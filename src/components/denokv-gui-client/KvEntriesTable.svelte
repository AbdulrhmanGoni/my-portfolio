<script lang="ts">
  import ActionsMenu from "./ActionsMenu.svelte";
  import ActionsMenuItem from "./ActionsMenuItem.svelte";
  import ActionsMenuSeparator from "./ActionsMenuSeparator.svelte";
  import Button from "./Button.svelte";
  import Checkbox from "./Checkbox.svelte";
  import HighlightedCode from "./HighlightedCode.svelte";
  import KvEntryValue from "./KvEntryValue.svelte";
  import ArrowLeftIcon from "./icons/ArrowLeftIcon.svelte";
  import ArrowRightIcon from "./icons/ArrowRightIcon.svelte";
  import ClipboardCopyIcon from "./icons/ClipboardCopyIcon.svelte";
  import CopyIcon from "./icons/CopyIcon.svelte";
  import EllipsisIcon from "./icons/EllipsisIcon.svelte";
  import EyeIcon from "./icons/EyeIcon.svelte";
  import LoaderIcon from "./icons/LoaderIcon.svelte";
  import NotesIcon from "./icons/NotesIcon.svelte";
  import PencilIcon from "./icons/PencilIcon.svelte";
  import TagsIcon from "./icons/TagsIcon.svelte";
  import TrashIcon from "./icons/TrashIcon.svelte";
  import type { KvEntry } from "./kv-entries";

  let {
    entries,
    loading = false,
    onViewEntry,
    onEditEntry,
    onDeleteEntry,
  }: {
    entries: KvEntry[];
    loading?: boolean;
    onViewEntry: (entry: KvEntry) => void;
    onEditEntry: (entry: KvEntry) => void;
    onDeleteEntry: (entry: KvEntry) => void;
  } = $props();

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

  function copyText(text: string) {
    void navigator.clipboard.writeText(text).catch(() => {});
  }
</script>

<div class="entries-table">
  <div class="table-scroll">
    <div
      class={[
        "table-container",
        { "empty-state": loading || entries.length === 0 },
      ]}
    >
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
          {#if loading}
            <tr>
              <td class="loading-cell" colspan="5">
                <span class="spinner"><LoaderIcon size={20} /></span>
              </td>
            </tr>
          {:else if entries.length === 0}
            <tr>
              <td class="empty-cell" colspan="5">
                No Entries in this Deno Kv Store.
              </td>
            </tr>
          {:else}
            {#each entries as entry (entry.key)}
              <tr
                class={{ selected: isSelected(entry.key) }}
                ondblclick={() => onViewEntry(entry)}
              >
                <td
                  class="select-cell"
                  ondblclick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected(entry.key)}
                    ariaLabel="Select row"
                    onCheckedChange={() => toggleEntry(entry.key)}
                  />
                </td>
                <td class="key-cell">
                  <span class="entry-key" title={entry.key}
                    ><HighlightedCode code={entry.key} /></span
                  >
                </td>
                <td class="value-cell">
                  <div class="value-clip" title={entry.value}>
                    <KvEntryValue {entry} />
                  </div>
                </td>
                <td class="versionstamp-cell">{entry.versionstamp}</td>
                <td
                  class="action-cell"
                  ondblclick={(event) => event.stopPropagation()}
                >
                  <ActionsMenu
                    label="Entry actions"
                    icon={EllipsisIcon}
                    iconSize={16}
                  >
                    <ActionsMenuItem onSelect={() => onViewEntry(entry)}>
                      <NotesIcon size={16} />
                      <span>View</span>
                    </ActionsMenuItem>

                    <ActionsMenuItem onSelect={() => copyText(entry.key)}>
                      <CopyIcon size={16} />
                      <span>Copy Key</span>
                    </ActionsMenuItem>

                    <ActionsMenuItem onSelect={() => copyText(entry.value)}>
                      <ClipboardCopyIcon size={16} />
                      <span>Copy Value</span>
                    </ActionsMenuItem>

                    <ActionsMenuItem
                      onSelect={() => copyText(entry.versionstamp)}
                    >
                      <TagsIcon size={16} />
                      <span>Copy Version</span>
                    </ActionsMenuItem>

                    <ActionsMenuItem onSelect={() => onEditEntry(entry)}>
                      <PencilIcon size={16} />
                      <span>Edit</span>
                    </ActionsMenuItem>

                    <ActionsMenuItem
                      disabled
                      title="Watch is not implemented"
                    >
                      <EyeIcon size={16} />
                      <span>Watch</span>
                    </ActionsMenuItem>

                    <ActionsMenuSeparator />

                    <ActionsMenuItem
                      destructive
                      onSelect={() => onDeleteEntry(entry)}
                    >
                      <TrashIcon size={16} />
                      <span>Delete</span>
                    </ActionsMenuItem>
                  </ActionsMenu>
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

  /* The empty and loading states stretch to the space left below the header
     instead of forcing the table to scroll on short windows. */
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

  tbody tr.selected td,
  tbody tr:hover td {
    background: color-mix(in oklab, var(--muted) 50%, transparent);
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

  .empty-cell {
    height: auto;
    padding: 10px;
    color: var(--foreground);
    font-size: 18px;
    text-align: center;
    vertical-align: middle;
    background-color: transparent !important;
  }

  .loading-cell {
    height: auto;
    text-align: center;
    vertical-align: middle;
    background-color: transparent !important;
  }

  .spinner {
    display: inline-flex;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
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
