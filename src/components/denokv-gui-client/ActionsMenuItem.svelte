<script lang="ts">
  import type { Snippet } from "svelte";
  import { getActionsMenuContext } from "./actions-menu-context";

  let {
    onSelect,
    destructive = false,
    disabled = false,
    title,
    children,
  }: {
    onSelect?: () => void;
    destructive?: boolean;
    disabled?: boolean;
    title?: string;
    children: Snippet;
  } = $props();

  const actionsMenu = getActionsMenuContext();

  function handleClick() {
    if (disabled) return;
    actionsMenu.close();
    onSelect?.();
  }
</script>

<button
  class={["menu-item", { destructive, disabled }]}
  type="button"
  role="menuitem"
  aria-disabled={disabled}
  {title}
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
    cursor: pointer;
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

  /* Disabled actions stay visible but cannot be triggered. A real `disabled`
     attribute would swallow the hover cursor, so aria-disabled is used and the
     pointer is styled here instead. */
  .menu-item.disabled,
  .menu-item.disabled:hover,
  .menu-item.disabled:focus-visible {
    background: transparent;
    color: var(--muted-foreground);
    cursor: not-allowed;
  }

  .menu-item.disabled :global(svg) {
    opacity: 0.5;
  }
</style>
