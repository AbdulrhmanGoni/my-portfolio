<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type ButtonVariant =
    | "default"
    | "outline"
    | "secondary"
    | "secondary1"
    | "secondary2"
    | "ghost";

  type ButtonSize = "default" | "sm" | "icon";

  let {
    variant = "default",
    size = "default",
    gap,
    class: className = "",
    children,
    ...restProps
  }: HTMLButtonAttributes & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    gap?: string;
    children?: Snippet;
  } = $props();
</script>

<button
  type="button"
  class="app-button {className}"
  data-variant={variant}
  data-size={size}
  style:--button-gap={gap}
  {...restProps}
>
  {@render children?.()}
</button>

<style>
  /* Mirrors the shadcn button variants/sizes used by the original app. */
  .app-button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: var(--button-gap, 8px);
    height: 36px;
    padding: 0 16px;
    border: 1px solid transparent;
    border-radius: calc(var(--radius) - 2px);
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    white-space: nowrap;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      color 0.15s,
      box-shadow 0.15s;
  }

  .app-button:has(> :global(svg)) {
    padding-inline: 12px;
  }

  .app-button[data-size="sm"] {
    --button-gap: 6px;
    height: 32px;
    padding-inline: 12px;
  }

  .app-button[data-size="sm"]:has(> :global(svg)) {
    padding-inline: 10px;
  }

  .app-button[data-size="icon"] {
    width: 28px;
    height: 28px;
    padding: 0;
  }

  .app-button :global(svg) {
    flex-shrink: 0;
    pointer-events: none;
  }

  .app-button:focus-visible {
    border-color: var(--ring);
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .app-button:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .app-button[data-variant="outline"] {
    border-color: var(--border);
    background: var(--background);
    color: var(--foreground);
  }

  .app-button[data-variant="outline"]:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  :global(.dark) .app-button[data-variant="outline"] {
    border-color: var(--input);
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  :global(.dark) .app-button[data-variant="outline"]:hover {
    background: color-mix(in oklab, var(--input) 50%, transparent);
    color: var(--foreground);
  }

  .app-button[data-variant="secondary"] {
    background: var(--secondary);
    color: var(--secondary-foreground);
  }

  .app-button[data-variant="secondary"]:hover {
    background: color-mix(in oklab, var(--secondary) 80%, transparent);
  }

  .app-button[data-variant="secondary1"] {
    background: var(--secondary-1);
    color: var(--secondary-1-foreground);
  }

  .app-button[data-variant="secondary1"]:hover {
    background: color-mix(in oklab, var(--secondary-1) 80%, transparent);
  }

  .app-button[data-variant="secondary2"] {
    background: var(--secondary-2);
    color: var(--secondary-2-foreground);
  }

  .app-button[data-variant="secondary2"]:hover {
    background: color-mix(in oklab, var(--secondary-2) 80%, transparent);
  }

  .app-button[data-variant="ghost"] {
    background: transparent;
    color: var(--foreground);
    box-shadow: none;
  }

  .app-button[data-variant="ghost"]:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  :global(.dark) .app-button[data-variant="ghost"]:hover {
    background: color-mix(in oklab, var(--accent) 50%, transparent);
  }

  .app-button[data-variant="default"]:hover {
    background: color-mix(in oklab, var(--primary) 90%, transparent);
  }
</style>
