<script lang="ts">
  import type { Component } from "svelte";
  import type { KvStoreType } from "./kv-stores";

  let {
    label,
    type,
    count,
    selected,
    icon: Icon,
    onclick,
  }: {
    label: string;
    type: KvStoreType;
    count: number;
    selected: boolean;
    icon: Component;
    onclick: () => void;
  } = $props();
</script>

<button
  class="filter-chip"
  class:selected
  data-type={type}
  type="button"
  aria-pressed={selected}
  {onclick}
>
  <span class="chip-icon"><Icon size={16} /></span>
  {label} ({count})
</button>

<style>
  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: var(--background);
    color: var(--muted-foreground);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.25;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      color 0.15s,
      box-shadow 0.15s;
  }

  .filter-chip:hover {
    background: color-mix(in oklab, var(--accent) 50%, transparent);
  }

  .filter-chip:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .filter-chip.selected {
    background: var(--accent);
    color: var(--foreground);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .chip-icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  .filter-chip[data-type="remote"] .chip-icon {
    color: var(--secondary);
  }

  .filter-chip[data-type="local"] .chip-icon {
    color: var(--secondary-3);
  }

  .filter-chip[data-type="default"] .chip-icon {
    color: var(--secondary-2);
  }

  .filter-chip[data-type="bridge"] .chip-icon {
    color: var(--secondary-1);
  }

  .filter-chip.selected[data-type="remote"] {
    border-color: color-mix(in oklab, var(--secondary) 35%, transparent);
  }

  .filter-chip.selected[data-type="local"] {
    border-color: color-mix(in oklab, var(--secondary-3) 35%, transparent);
  }

  .filter-chip.selected[data-type="default"] {
    border-color: color-mix(in oklab, var(--secondary-2) 35%, transparent);
  }

  .filter-chip.selected[data-type="bridge"] {
    border-color: color-mix(in oklab, var(--secondary-1) 35%, transparent);
  }
</style>
