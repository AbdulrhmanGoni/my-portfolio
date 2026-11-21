<script lang="ts">
  import Button from "./Button.svelte";
  import Checkbox from "./Checkbox.svelte";
  import KvCodeEditor from "./KvCodeEditor.svelte";
  import KvEntryValueEditor from "./KvEntryValueEditor.svelte";
  import CalendarClockIcon from "./icons/CalendarClockIcon.svelte";
  import ChevronDownIcon from "./icons/ChevronDownIcon.svelte";
  import FileKeyIcon from "./icons/FileKeyIcon.svelte";
  import FilePlusIcon from "./icons/FilePlusIcon.svelte";
  import PlusIcon from "./icons/PlusIcon.svelte";
  import XIcon from "./icons/XIcon.svelte";
  import type { AddKvEntryInput, KvValueType } from "./kv-entries";

  let {
    onClose,
    onSubmit,
  }: {
    onClose: () => void;
    onSubmit: (input: AddKvEntryInput) => boolean;
  } = $props();

  let keyText = $state("[]");
  let valueType = $state<KvValueType>("Undefined");
  let valueData = $state("undefined");
  let overwrite = $state(true);
  let expirationUnit = $state("milliseconds");
  let expirationValue = $state<number | undefined>(undefined);

  const expirationUnitSuffix = $derived.by(() => {
    switch (expirationUnit) {
      case "milliseconds":
        return "ms";
      case "seconds":
        return "s";
      case "minutes":
        return "m";
      case "hours":
        return "h";
      case "days":
        return "d";
      default:
        return "";
    }
  });

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    // The expiration controls are built to match the original dialog, but
    // they are intentionally not applied to the stored entry in this demo.
    const added = onSubmit({
      key: keyText,
      valueType,
      value: valueData,
      overwrite,
    });

    if (added) onClose();
  }
</script>

<form class="entry-panel" onsubmit={handleSubmit}>
  <h2 class="title-row" id="add-entry-title">
    <FilePlusIcon size={28} />
    Add a new KV Entry
  </h2>

  <div class="separator"></div>

  <div class="key-section">
    <p class="section-title">
      <FileKeyIcon size={18} />
      Key
    </p>
    <KvCodeEditor ariaLabel="Key" bind:value={keyText} />
  </div>

  <div class="overwrite-row">
    <Checkbox
      checked={overwrite}
      label="Overwrite existing entry with this key?"
      labelClass={overwrite ? "" : "dimmed"}
      onCheckedChange={(checked) => (overwrite = checked)}
    />
  </div>

  <div class="separator"></div>

  <KvEntryValueEditor bind:type={valueType} bind:data={valueData} />

  <div class="separator"></div>

  <div class="expiration-row">
    <p class="section-title">
      <CalendarClockIcon size={18} />
      Expires after?
    </p>

    <div class="expiration-controls">
      <div class="select-wrap">
        <select
          class="unit-select"
          aria-label="Expiration measurement unit"
          bind:value={expirationUnit}
        >
          <option value="milliseconds">milliseconds</option>
          <option value="seconds">seconds</option>
          <option value="minutes">minutes</option>
          <option value="hours">hours</option>
          <option value="days">days</option>
        </select>
        <span class="select-chevron" aria-hidden="true">
          <ChevronDownIcon size={16} />
        </span>
      </div>

      <input
        class="expiration-input"
        type="number"
        min="0"
        aria-label="Expiration value"
        placeholder="0{expirationUnitSuffix}"
        bind:value={expirationValue}
      />
    </div>
  </div>

  <div class="separator"></div>

  <div class="form-actions">
    <Button variant="outline" size="sm" onclick={onClose}>
      <XIcon size={16} />
      Close
    </Button>
    <Button variant="secondary" size="sm" type="submit">
      Add
      <PlusIcon size={16} />
    </Button>
  </div>

  <button
    class="close-button"
    type="button"
    aria-label="Close"
    title="Close"
    onclick={onClose}
  >
    <XIcon size={16} />
  </button>
</form>

<style>
  .entry-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    max-width: 48rem;
    max-height: calc(100dvh - 24px);
    padding: 12px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--background);
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    animation: panel-in 200ms ease-out;
  }

  .title-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding-inline-end: 24px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  .separator {
    flex-shrink: 0;
    height: 1px;
    margin: 8px 0;
    background: var(--border);
  }

  .key-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.4;
  }

  .overwrite-row {
    margin-top: 8px;
  }

  .expiration-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .expiration-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .select-wrap {
    position: relative;
  }

  .unit-select {
    height: 36px;
    padding: 0 32px 0 12px;
    appearance: none;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: var(--background);
    color: var(--foreground);
    font: inherit;
    font-size: 14px;
    outline: none;
    cursor: pointer;
  }

  :global(.dark) .unit-select {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .unit-select:focus-visible {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .unit-select option {
    background: var(--popover);
    color: var(--foreground);
  }

  .select-chevron {
    position: absolute;
    top: 50%;
    right: 10px;
    display: inline-flex;
    color: var(--muted-foreground);
    pointer-events: none;
    transform: translateY(-50%);
  }

  .expiration-input {
    width: 9rem;
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

  :global(.dark) .expiration-input {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .expiration-input::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }

  .expiration-input:focus-visible {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .form-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--foreground);
    opacity: 0.7;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .close-button:hover {
    opacity: 1;
  }

  .close-button:focus-visible {
    border-radius: 2px;
    outline: none;
    box-shadow: 0 0 0 2px var(--ring);
  }

  @keyframes panel-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 639px) {
    .expiration-row {
      align-items: flex-start;
      flex-direction: column;
    }

    .expiration-controls {
      width: 100%;
    }

    .expiration-input {
      flex: 1;
      width: auto;
    }
  }
</style>
