<script lang="ts">
  import type { Snippet } from "svelte";
  import { getActionsMenuContext } from "./actions-menu-context";

  let {
    onSelect,
    destructive = false,
    children,
  }: {
    onSelect?: () => void;
    destructive?: boolean;
    children: Snippet;
  } = $props();

  const actionsMenu = getActionsMenuContext();

  function handleClick() {
    actionsMenu.close();
    onSelect?.();
  }
</script>

<button
  class={["menu-item", { destructive }]}
  type="button"
  role="menuitem"
  tabindex="-1"
  onclick={handleClick}
>
  {@render children()}
</button>

<style>
  .menu-item {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    appearance: none;
    border: 0;
    border-radius: calc(var(--radius) - 4px);
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 14px;
    line-height: 20px;
    text-align: left;
    white-space: nowrap;
    cursor: default;
    user-select: none;
    outline: none;
  }

  .menu-item :global(svg) {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    color: var(--muted-foreground);
    pointer-events: none;
  }

  .menu-item:hover,
  .menu-item:focus-visible {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  .menu-item.destructive,
  .menu-item.destructive :global(svg) {
    color: var(--destructive);
  }

  .menu-item.destructive:hover,
  .menu-item.destructive:focus-visible {
    background: color-mix(in oklab, var(--destructive) 10%, transparent);
    color: var(--destructive);
  }

  :global(.dark) .menu-item.destructive:hover,
  :global(.dark) .menu-item.destructive:focus-visible {
    background: color-mix(in oklab, var(--destructive) 20%, transparent);
  }
</style>
