<script lang="ts">
  import CalendarClockIcon from "./icons/CalendarClockIcon.svelte";
  import HighlightedCode from "./HighlightedCode.svelte";
  import type { KvEntry } from "./kv-entries";

  let { entry }: { entry: KvEntry } = $props();

  const regExp = $derived.by(() => {
    try {
      const parsedValue = JSON.parse(entry.value) as {
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
  });
</script>

<div class="entry-value type-{entry.valueType.toLowerCase()}">
  {#if entry.valueType === "String"}
    <span>&quot;{entry.value}&quot;</span>
  {:else if entry.valueType === "BigInt"}
    <span class="number">{entry.value}</span><span class="n">n</span>
  {:else if entry.valueType === "KvU64"}
    <span>KvU64</span><span class="punctuation">(</span><span class="number"
      >{entry.value}</span
    ><span class="n">n</span><span class="punctuation">)</span>
  {:else if entry.valueType === "Date"}
    <span class="date-value">
      <CalendarClockIcon size={16} />
      {entry.value || "No Value"}
    </span>
  {:else if entry.valueType === "RegExp"}
    <span class="punctuation">/</span><span class="regexp-source"
      >{regExp.source}</span
    ><span class="punctuation">/</span><span class="flags">{regExp.flags}</span>
  {:else if entry.valueType === "Number" || entry.valueType === "Null" || entry.valueType === "Undefined"}
    <span>{entry.value}</span>
  {:else}
    <HighlightedCode code={entry.value} />
  {/if}
</div>

<style>
  .entry-value {
    overflow: hidden;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: pre;
  }

  .type-string {
    color: #c6834e;
  }

  .type-number {
    color: #59a500;
  }

  :global(.dark) .type-number {
    color: #b3ff59;
  }

  .type-boolean {
    color: #8142ff;
  }

  :global(.dark) .type-boolean {
    color: #6c48b5;
  }

  .type-bigint {
    color: #1e40af;
  }

  :global(.dark) .type-bigint {
    color: #3b82f6;
  }

  .type-uint8array {
    color: #6f4dff;
  }

  :global(.dark) .type-uint8array {
    color: #9981ff;
  }

  .type-kvu64 {
    color: #e5ab00;
  }

  :global(.dark) .type-kvu64 {
    color: #ffdd00;
  }

  .type-null {
    color: #006ac7;
  }

  .type-undefined {
    color: #6b7280;
  }

  :global(.dark) .type-undefined {
    color: #9ca3af;
  }

  .type-date {
    color: #386cb7;
  }

  :global(.dark) .type-date {
    color: #a9cbff;
  }

  .date-value {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .number {
    color: #59a500;
  }

  :global(.dark) .number {
    color: #b3ff59;
  }

  .n {
    color: #1e40af;
  }

  :global(.dark) .n {
    color: #3b82f6;
  }

  .punctuation {
    color: var(--foreground);
  }

  .regexp-source {
    color: coral;
  }

  .flags {
    color: #1e40af;
  }

  :global(.dark) .flags {
    color: #3b82f6;
  }
</style>
