<script lang="ts">
  import Button from "./Button.svelte";
  import FunnelPlusIcon from "./icons/FunnelPlusIcon.svelte";
  import PencilLineIcon from "./icons/PencilLineIcon.svelte";
</script>

<!--
  The filter strip. Values and the edit button match the original app, but
  the feature is not implemented in the demo, so it is shown disabled with
  a not implemented tooltip.
-->
<div
  class="browse-params disabled-control"
  title="Filter is not implemented"
  aria-disabled="true"
>
  <div class="filter-summary">
    <div class="filter-heading">
      <FunnelPlusIcon size={18} />
      Filter
    </div>

    <div class="separator"></div>

    <div class="param">
      <span>Prefix:</span>
      <code>[]</code>
    </div>

    <div class="separator"></div>

    <div class="param">
      <span>Start:</span>
      <code>[]</code>
    </div>

    <div class="separator"></div>

    <div class="param">
      <span>End:</span>
      <code>[]</code>
    </div>
  </div>

  <Button
    size="sm"
    aria-label="Edit Filters (not implemented)"
    title="Edit Filters (not implemented)"
    disabled
  >
    <PencilLineIcon size={16} />
  </Button>
</div>

<style>
  .browse-params {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 4px;
    overflow: auto;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
  }

  /* The disabled button ignores pointer events, so the strip owns the
     not implemented tooltip and the not-allowed cursor, like the other
     not-implemented actions in the browser. */
  .disabled-control {
    cursor: not-allowed;
  }

  .filter-summary {
    display: flex;
    min-width: 0;
    align-items: center;
    overflow-x: auto;
    scroll-behavior: smooth;
    opacity: 0.5;
  }

  .filter-summary::-webkit-scrollbar {
    height: 2px;
    background: var(--card);
  }

  .filter-heading {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--muted);
    font-weight: 700;
  }

  .separator {
    flex-shrink: 0;
    width: 1px;
    height: 100%;
    background: var(--border);
  }

  .param {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: calc(var(--radius) - 4px);
    background: var(--card);
    color: var(--foreground);
    font-size: 14px;
    font-weight: 600;
  }

  .param code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-weight: 400;
  }
</style>
