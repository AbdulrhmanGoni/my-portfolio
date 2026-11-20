<script lang="ts">
  import Button from "./Button.svelte";
  import ArrowLeftIcon from "./icons/ArrowLeftIcon.svelte";
  import ArrowRightIcon from "./icons/ArrowRightIcon.svelte";
</script>

<div class="entries-table">
  <div class="table-scroll">
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="select-column">
              <input
                class="table-checkbox"
                type="checkbox"
                aria-label="Select all"
              />
            </th>
            <th>Key</th>
            <th>Value</th>
            <th class="align-right">Versionstamp</th>
            <th class="align-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="empty-cell" colspan="5">
              No Entries in this Deno Kv Store.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="separator"></div>

  <div class="table-footer">
    <span class="selection-info">0 of 0 row selected.</span>

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

  .select-column {
    padding-inline-end: 0;
  }

  .table-checkbox {
    display: block;
    width: 16px;
    height: 16px;
    margin: 0;
    appearance: none;
    border: 1px solid var(--input);
    border-radius: 4px;
    background: transparent;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
  }

  .table-checkbox:checked {
    border-color: var(--primary);
    background: var(--primary);
  }

  .table-checkbox:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  :global(.dark) .table-checkbox {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .empty-cell {
    height: 398px;
    padding: 10px;
    color: var(--foreground);
    font-size: 18px;
    text-align: center;
    vertical-align: middle;
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
