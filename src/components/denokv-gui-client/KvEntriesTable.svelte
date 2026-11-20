<script lang="ts">
  import Button from "./Button.svelte";
  import Checkbox from "./Checkbox.svelte";
  import KvEntryValue from "./KvEntryValue.svelte";
  import ArrowLeftIcon from "./icons/ArrowLeftIcon.svelte";
  import ArrowRightIcon from "./icons/ArrowRightIcon.svelte";
  import EllipsisIcon from "./icons/EllipsisIcon.svelte";
  import type { KvEntry } from "./kv-entries";

  let { entries }: { entries: KvEntry[] } = $props();

  let selectedKeys = $state<string[]>([]);

  const allSelected = $derived(
    entries.length > 0 && selectedKeys.length === entries.length,
  );

  function isSelected(key: string): boolean {
    return selectedKeys.includes(key);
  }

  function toggleAll() {
    selectedKeys = allSelected ? [] : entries.map((entry) => entry.key);
  }

  function toggleEntry(key: string) {
    selectedKeys = isSelected(key)
      ? selectedKeys.filter((selectedKey) => selectedKey !== key)
      : [...selectedKeys, key];
  }
</script>

<div class="entries-table">
  <div class="table-scroll">
    <div class={["table-container", { "empty-state": entries.length === 0 }]}>
      <table>
        <thead>
          <tr>
            <th class="select-column">
              <Checkbox
                checked={allSelected}
                ariaLabel="Select all"
                onCheckedChange={toggleAll}
              />
            </th>
            <th>Key</th>
            <th>Value</th>
            <th class="align-right">Versionstamp</th>
            <th class="align-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {#if entries.length === 0}
            <tr>
              <td class="empty-cell" colspan="5">
                No Entries in this Deno Kv Store.
              </td>
            </tr>
          {:else}
            {#each entries as entry (entry.key)}
              <tr class={{ selected: isSelected(entry.key) }}>
                <td class="select-cell">
                  <Checkbox
                    checked={isSelected(entry.key)}
                    ariaLabel="Select row"
                    onCheckedChange={() => toggleEntry(entry.key)}
                  />
                </td>
                <td class="key-cell">
                  <span class="entry-key" title={entry.key}>{entry.key}</span>
                </td>
                <td class="value-cell">
                  <div class="value-clip" title={entry.value}>
                    <KvEntryValue {entry} />
                  </div>
                </td>
                <td class="versionstamp-cell">{entry.versionstamp}</td>
                <td class="action-cell">
                  <button
                    type="button"
                    class="action-button"
                    title="Not implemented"
                    aria-label="Entry actions"
                  >
                    <EllipsisIcon size={16} />
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <div class="separator"></div>

  <div class="table-footer">
    <span class="selection-info">
      {selectedKeys.length} of {entries.length} row selected.
    </span>

    <div class="navigation">
      <Button size="sm" disabled style="opacity: 0.25">
        <ArrowLeftIcon size={16} />
        Prev
      </Button>
      <Button size="sm" disabled style="opacity: 0.25">
        Next
        <ArrowRightIcon size={16} />
      </Button>
    </div>
  </div>
</div>

<style>
  .entries-table {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) - 2px);
  }

  .table-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .table-container {
    width: 100%;
    overflow-x: auto;
  }

  /* The empty state stretches to the space left below the header instead of
     forcing the table to scroll on short windows. */
  .table-container.empty-state {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .table-container.empty-state table {
    flex: 1;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  thead {
    background: var(--muted);
  }

  thead tr {
    border-bottom: 1px solid var(--border);
  }

  th {
    height: 52px;
    padding: 10px;
    background-clip: padding-box;
    color: var(--foreground);
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    vertical-align: middle;
    white-space: nowrap;
  }

  th.align-right {
    text-align: right;
  }

  .select-column,
  .select-cell {
    padding-inline-end: 0;
  }

  tbody tr {
    border-bottom: 1px solid var(--border);
  }

  tbody tr:last-child {
    border-bottom: 0;
  }

  tbody tr:hover td {
    background: color-mix(in oklab, var(--muted) 50%, transparent);
  }

  tbody tr.selected td {
    background: var(--muted);
  }

  td {
    height: 51px;
    padding: 10px;
    background-clip: padding-box;
    vertical-align: middle;
    white-space: nowrap;
  }

  .entry-key {
    display: block;
    max-width: 16rem;
    overflow: hidden;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: pre;
  }

  .value-clip {
    max-width: 32rem;
    overflow: hidden;
  }

  .versionstamp-cell {
    text-align: right;
  }

  .action-cell {
    text-align: right;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: calc(var(--radius) - 2px);
    background: transparent;
    color: var(--foreground);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .action-button:hover {
    background: var(--accent);
  }

  .action-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .empty-cell {
    height: auto;
    padding: 10px;
    color: var(--foreground);
    font-size: 18px;
    text-align: center;
    vertical-align: middle;
    background-color: transparent !important;
  }

  .separator {
    flex-shrink: 0;
    width: 100%;
    height: 1px;
    background: var(--border);
  }

  .table-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--muted);
  }

  .selection-info {
    color: var(--foreground);
    font-size: 14px;
  }

  .navigation {
    display: flex;
    gap: 8px;
    margin-inline-start: auto;
  }
</style>
