<script lang="ts">
  import { untrack } from "svelte";
  import Button from "./Button.svelte";
  import Checkbox from "./Checkbox.svelte";
  import KvCodeEditor from "./KvCodeEditor.svelte";
  import CalendarClockIcon from "./icons/CalendarClockIcon.svelte";
  import ChevronDownIcon from "./icons/ChevronDownIcon.svelte";
  import FileBracesIcon from "./icons/FileBracesIcon.svelte";
  import ScanTextIcon from "./icons/ScanTextIcon.svelte";
  import { isKvValueType, kvDataTypes, type KvValueType } from "./kv-entries";

  let {
    type = $bindable("Undefined"),
    data = $bindable("undefined"),
  }: {
    type?: KvValueType;
    data?: string;
  } = $props();

  const formattableTypes: KvValueType[] = [
    "Object",
    "Array",
    "Set",
    "Map",
    "Uint8Array",
  ];
  const specialNumbers = ["NaN", "Infinity", "-Infinity"] as const;

  const isFormattable = $derived(formattableTypes.includes(type));

  type DateMethod = "date-picker" | "timestamp" | "current-date";

  let dateMethod = $state<DateMethod | null>(null);
  let datePickerInput = $state("");
  let timestampInput = $state("");

  function parseRegExpData(value: string): { source: string; flags: string } {
    try {
      const parsedValue = JSON.parse(value) as {
        source?: unknown;
        flags?: unknown;
      };

      if (
        typeof parsedValue.source === "string" &&
        typeof parsedValue.flags === "string"
      ) {
        return { source: parsedValue.source, flags: parsedValue.flags };
      }
    } catch {}

    return { source: "", flags: "" };
  }

  const initialRegExp = parseRegExpData(untrack(() => data));
  let regExpSource = $state(initialRegExp.source);
  let regExpFlags = $state(initialRegExp.flags);

  $effect(() => {
    if (type !== "RegExp") return;

    data = JSON.stringify({ source: regExpSource, flags: regExpFlags });
  });

  function handleTypeChange(event: Event) {
    const nextType = (event.currentTarget as HTMLSelectElement).value;

    if (!isKvValueType(nextType)) return;

    type = nextType;
    data =
      kvDataTypes.find((dataType) => dataType.type === nextType)?.starter ?? "";

    dateMethod = null;
    datePickerInput = "";
    timestampInput = "";

    const starterRegExp = parseRegExpData(
      kvDataTypes.find((dataType) => dataType.type === "RegExp")?.starter ?? "",
    );
    regExpSource = starterRegExp.source;
    regExpFlags = starterRegExp.flags;
  }

  function formatValue() {
    // Formatting is intentionally not implemented in this demo.
  }

  function setSpecialNumber(value: string) {
    data = data === value ? "" : value;
  }

  function selectDateMethod(method: DateMethod, checked: boolean) {
    if (!checked) {
      if (dateMethod === method) dateMethod = null;
      return;
    }

    dateMethod = method;

    if (method === "date-picker") {
      data = datePickerInput ? new Date(datePickerInput).toISOString() : "";
    } else if (method === "timestamp") {
      data = timestampInput
        ? new Date(Number(timestampInput)).toISOString()
        : "";
    } else {
      data = new Date().toISOString();
    }
  }

  function handleDatePickerInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;

    datePickerInput = input.value;

    if (dateMethod !== "date-picker") return;

    if (!input.value) {
      data = "";
      return;
    }

    const date = new Date(input.value);
    data = Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function handleTimestampInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;

    timestampInput = input.value;

    if (dateMethod !== "timestamp") return;

    if (!input.value) {
      data = "";
      return;
    }

    const date = new Date(Number(input.value));
    data = Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function setBooleanValue(value: boolean) {
    data = String(value);
  }
</script>

<div class="value-section">
  <div class="value-header">
    <p class="section-title">
      <FileBracesIcon size={18} />
      Value
    </p>

    <div class="value-actions">
      {#if isFormattable}
        <Button
          variant="outline"
          size="icon"
          title="Not implemented"
          aria-label="Format (not implemented)"
          onclick={formatValue}
        >
          <ScanTextIcon size={16} />
        </Button>
      {/if}

      <div class="select-wrap">
        <select
          class="type-select"
          aria-label="Value type"
          value={type}
          onchange={handleTypeChange}
        >
          {#each kvDataTypes as dataType (dataType.type)}
            <option value={dataType.type}>{dataType.type}</option>
          {/each}
        </select>
        <span class="select-chevron" aria-hidden="true">
          <ChevronDownIcon size={16} />
        </span>
      </div>
    </div>
  </div>

  <div class="value-body">
    {#if type === "String"}
      <textarea
        class="string-input"
        placeholder="String..."
        aria-label="String value"
        bind:value={data}
      ></textarea>
    {:else if type === "Number"}
      <div class="number-inputs">
        <input
          class="number-input number-color"
          type="text"
          inputmode="decimal"
          placeholder="Number"
          aria-label="Number value"
          bind:value={data}
        />
        <div class="special-numbers">
          {#each specialNumbers as specialNumber (specialNumber)}
            <button
              type="button"
              class="special-number"
              class:blue={specialNumber !== "NaN"}
              class:selected={data === specialNumber}
              onclick={() => setSpecialNumber(specialNumber)}
            >
              {specialNumber}
            </button>
          {/each}
        </div>
      </div>
    {:else if type === "Boolean"}
      <div class="boolean-buttons">
        {#each [true, false] as booleanValue (booleanValue)}
          <button
            type="button"
            class="boolean-button"
            class:selected={data === String(booleanValue)}
            onclick={() => setBooleanValue(booleanValue)}
          >
            {booleanValue}
          </button>
        {/each}
      </div>
    {:else if type === "BigInt" || type === "KvU64"}
      <div class="number-group">
        <input
          class="number-group-input number-color"
          type="text"
          inputmode="numeric"
          placeholder="0"
          aria-label="{type} value"
          bind:value={data}
        />
        <span class="number-group-addon">{type}</span>
      </div>
    {:else if type === "Date"}
      <div class="date-inputs">
        <div class="date-preview">
          <CalendarClockIcon size={16} />
          {data || "No Value"}
        </div>

        <p class="date-hint">
          Pick one of the following methods to create a Date value:
        </p>

        <div class="date-method">
          <Checkbox
            checked={dateMethod === "date-picker"}
            label="Date Picker"
            onCheckedChange={(checked) =>
              selectDateMethod("date-picker", checked)}
          />
          <input
            class="date-input"
            class:inactive={dateMethod !== "date-picker"}
            type="datetime-local"
            aria-label="Date picker value"
            value={datePickerInput}
            oninput={handleDatePickerInput}
          />
        </div>

        <div class="date-method">
          <Checkbox
            checked={dateMethod === "timestamp"}
            label="Timestamp"
            onCheckedChange={(checked) =>
              selectDateMethod("timestamp", checked)}
          />
          <input
            class="date-input number-color"
            class:inactive={dateMethod !== "timestamp"}
            type="text"
            inputmode="numeric"
            aria-label="Timestamp value"
            placeholder={`e.g., ${Date.now()}`}
            value={timestampInput}
            oninput={handleTimestampInput}
          />
        </div>

        <div class="date-method">
          <Checkbox
            checked={dateMethod === "current-date"}
            label="Current Date"
            onCheckedChange={(checked) =>
              selectDateMethod("current-date", checked)}
          />
        </div>
      </div>
    {:else if type === "RegExp"}
      <div class="regexp-editor">
        <span class="blue new-keyword">new</span>
        <span class="regexp-name">RegExp</span>
        <span class="punctuation">(</span>
        <span class="string-color">"</span>
        <input
          class="regexp-part regexp-source"
          aria-label="RegExp source"
          bind:value={regExpSource}
        />
        <span class="string-color">"</span>
        <span class="punctuation">, </span>
        <span class="string-color">"</span>
        <input
          class="regexp-part regexp-flags"
          aria-label="RegExp flags"
          bind:value={regExpFlags}
        />
        <span class="string-color">"</span>
        <span class="punctuation">)</span>
      </div>
    {:else if type === "Null" || type === "Undefined"}
      <div class="literal-value">
        <span class={type === "Null" ? "null-color" : "undefined-color"}>
          {type.toLowerCase()}
        </span>
      </div>
    {:else}
      <KvCodeEditor ariaLabel="Value" bind:value={data} fixedHeight />
    {/if}
  </div>
</div>

<style>
  /* Mirrors the value editor of the original app. */
  .value-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .value-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.4;
  }

  .value-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-inline-start: auto;
  }

  .select-wrap {
    position: relative;
  }

  .type-select {
    width: 7.5rem;
    height: 28px;
    padding: 0 28px 0 10px;
    appearance: none;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: transparent;
    color: var(--foreground);
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    cursor: pointer;
  }

  :global(.dark) .type-select {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .type-select:focus-visible {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .type-select option {
    background: var(--popover);
    color: var(--foreground);
  }

  .select-chevron {
    position: absolute;
    top: 50%;
    right: 8px;
    display: inline-flex;
    color: var(--muted-foreground);
    pointer-events: none;
    transform: translateY(-50%);
  }

  .value-body {
    height: 250px;
  }

  .string-input {
    display: block;
    width: 100%;
    height: 100%;
    padding: 10px 12px;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
    color: var(--string-color);
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    resize: none;
    outline: none;
  }

  .string-input::placeholder,
  .number-input::placeholder,
  .number-group-input::placeholder,
  .date-input::placeholder,
  .regexp-part::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }

  .string-input:focus-visible,
  .number-input:focus-visible,
  .number-group:focus-within,
  .date-input:focus-visible {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .number-inputs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .number-input {
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: var(--background);
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    outline: none;
  }

  :global(.dark) .number-input,
  :global(.dark) .number-group,
  :global(.dark) .date-input {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .special-numbers {
    display: flex;
    gap: 8px;
  }

  .special-number {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: calc(var(--radius) - 4px);
    background: var(--card);
    color: var(--number-color);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color 0.15s,
      border-color 0.15s;
  }

  .special-number:hover,
  .boolean-button:hover {
    background: var(--accent);
  }

  .special-number.selected,
  .boolean-button.selected {
    border-color: var(--primary);
  }

  .boolean-buttons {
    display: flex;
    gap: 8px;
  }

  .boolean-button {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: calc(var(--radius) - 4px);
    background: var(--card);
    color: var(--blue-color);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color 0.15s,
      border-color 0.15s;
  }

  .number-group {
    display: flex;
    align-items: center;
    width: 100%;
    height: 36px;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: var(--background);
  }

  .number-group:focus-within {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .number-group-input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 12px;
    border: 0;
    background: transparent;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    outline: none;
  }

  .number-group-addon {
    flex-shrink: 0;
    margin-inline-end: 4px;
    padding: 3px 6px;
    border-radius: 4px;
    background: color-mix(in oklab, #22c55e 35%, transparent);
    color: var(--foreground);
    font-size: 12px;
    font-weight: 500;
  }

  :global(.dark) .number-group-addon {
    background: color-mix(in oklab, #22c55e 25%, transparent);
  }

  .date-inputs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .date-preview {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: calc(var(--radius) - 4px);
    background: var(--card);
    color: var(--date-color);
    font-weight: 600;
  }

  .date-hint {
    color: var(--muted-foreground);
    font-size: 16px;
  }

  .date-method {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .date-input {
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: var(--background);
    color: var(--foreground);
    font: inherit;
    font-size: 14px;
    outline: none;
  }

  .date-input.inactive {
    opacity: 0.7;
  }

  .date-input.number-color {
    font-weight: 600;
  }

  .regexp-editor {
    display: flex;
    align-items: center;
    padding: 12px;
    overflow: auto;
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }

  .regexp-part {
    min-width: 1ch;
    max-width: 16rem;
    padding: 0 4px;
    border: 0;
    border-radius: 4px;
    background: var(--muted);
    color: var(--regexp-color);
    font: inherit;
    font-weight: 600;
    outline: none;
    field-sizing: content;
  }

  .regexp-part.regexp-flags {
    color: var(--blue-color);
  }

  .regexp-part:focus-visible {
    box-shadow: 0 0 0 2px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .literal-value {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 12px;
    border-radius: calc(var(--radius) - 4px);
    background: var(--card);
    font-weight: 700;
  }

  /* Data type colors copied from the original app's palette. */
  .value-section {
    --string-color: #c6834e;
    --number-color: #59a500;
    --boolean-color: #8142ff;
    --blue-color: #1e40af;
    --date-color: #386cb7;
    --regexp-color: coral;
    --null-color: #006ac7;
    --undefined-color: #6b7280;
  }

  :global(.dark) .value-section {
    --number-color: #b3ff59;
    --boolean-color: #6c48b5;
    --blue-color: #3b82f6;
    --date-color: #a9cbff;
    --undefined-color: #9ca3af;
  }

  .number-color {
    color: var(--number-color);
  }

  .string-color {
    color: var(--string-color);
  }

  .blue {
    color: var(--blue-color);
  }

  .new-keyword {
    margin-right: 4px;
  }

  .null-color {
    color: var(--null-color);
  }

  .undefined-color {
    color: var(--undefined-color);
  }

  .regexp-source {
    color: var(--regexp-color);
  }

  .regexp-name {
    color: #038703;
  }

  :global(.dark) .regexp-name {
    color: #06a606;
  }

  .punctuation {
    color: var(--foreground);
  }
</style>
