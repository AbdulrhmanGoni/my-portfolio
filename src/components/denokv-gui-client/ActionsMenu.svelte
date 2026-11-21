<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import EllipsisVerticalIcon from "./icons/EllipsisVerticalIcon.svelte";
  import { setActionsMenuContext } from "./actions-menu-context";

  let {
    label,
    icon: TriggerIcon = EllipsisVerticalIcon,
    iconSize = 20,
    children,
  }: {
    label: string;
    icon?: Component<{ size?: number }>;
    iconSize?: number;
    children: Snippet;
  } = $props();

  const MENU_GAP = 4;

  let open = $state(false);
  let root: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let menu: HTMLDivElement | undefined = $state();

  // The dropdown lives on the document body (like the original app's portal)
  // so it is not clipped by the scrollable container it is opened from.
  function portal(node: HTMLElement) {
    document.body.appendChild(node);

    return () => {
      node.remove();
    };
  }

  // Measures the mounted menu and pins it to the trigger, flipping above it
  // when there is not enough room below (the same behaviour as the original
  // app's floating dropdown).
  function positionMenu(node: HTMLDivElement) {
    function place() {
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const menuHeight = node.scrollHeight;
      const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
      const spaceAbove = rect.top - MENU_GAP;

      // Flip above the trigger when the menu does not fit below it, unless
      // there is even less room above.
      const openAbove = menuHeight > spaceBelow && spaceAbove > spaceBelow;

      node.style.top = openAbove ? "auto" : `${rect.bottom + MENU_GAP}px`;
      node.style.bottom = openAbove
        ? `${window.innerHeight - rect.top + MENU_GAP}px`
        : "auto";
      node.style.right = `${window.innerWidth - rect.right}px`;
      node.style.maxHeight = `${Math.max(
        0,
        openAbove ? spaceAbove : spaceBelow,
      )}px`;
      node.style.transformOrigin = openAbove ? "bottom right" : "top right";
      node.classList.toggle("above", openAbove);
      node.classList.add("positioned");
    }

    place();
    window.addEventListener("resize", place);

    return () => {
      window.removeEventListener("resize", place);
    };
  }

  function toggleMenu() {
    if (open) {
      closeMenu(false);
      return;
    }

    open = true;
  }

  function closeMenu(restoreFocus = true) {
    if (!open) return;
    open = false;
    if (restoreFocus) trigger?.focus();
  }

  setActionsMenuContext({ close: () => closeMenu(false) });

  function handleWindowPointerDown(event: PointerEvent) {
    if (!open) return;

    const target = event.target as Node;
    if (!root?.contains(target) && !menu?.contains(target)) {
      closeMenu(false);
    }
  }

  function handleWindowKeyDown(event: KeyboardEvent) {
    if (!open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    }
  }

  function handleWindowScroll() {
    if (open) closeMenu(false);
  }

  function handleMenuKeyDown(event: KeyboardEvent) {
    if (!menu) return;

    const items = Array.from(
      menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    );
    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        items[(currentIndex + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        items[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        items.at(-1)?.focus();
        break;
    }
  }

  $effect(() => {
    if (!open) return;

    // Scroll events do not bubble, so listen in the capture phase to catch
    // scrolling inside the scrollable containers as well.
    window.addEventListener("scroll", handleWindowScroll, true);

    return () => {
      window.removeEventListener("scroll", handleWindowScroll, true);
    };
  });

  $effect(() => {
    if (open && menu) {
      menu.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    }
  });
</script>

<svelte:window
  onpointerdown={handleWindowPointerDown}
  onkeydown={handleWindowKeyDown}
/>

<div class="actions" bind:this={root}>
  <button
    bind:this={trigger}
    class="trigger"
    type="button"
    aria-label={label}
    title={label}
    aria-haspopup="menu"
    aria-expanded={open}
    onclick={toggleMenu}
  >
    <TriggerIcon size={iconSize} />
  </button>
</div>

{#if open}
  <div
    class="menu"
    role="menu"
    tabindex="-1"
    aria-label={label}
    {@attach portal}
    {@attach positionMenu}
    bind:this={menu}
    onkeydown={handleMenuKeyDown}
  >
    {@render children()}
  </div>
{/if}

<style>
  .actions {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
  }

  .trigger {
    display: inline-flex;
    flex-shrink: 0;
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

  .trigger:hover {
    background: color-mix(in oklab, var(--accent) 50%, transparent);
  }

  .trigger:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  /* Mirrors the shadcn dropdown-menu styling used by the original app. */
  .menu {
    position: fixed;
    z-index: 50;
    min-width: 8rem;
    padding: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    visibility: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  /* Position is measured once the menu is mounted, then revealed. The
     classes are added by the positioning attachment, so they are global. */
  .menu:global(.positioned) {
    visibility: visible;
    animation: menu-in 0.15s ease-out;
  }

  .menu:global(.above.positioned) {
    animation-name: menu-in-above;
  }

  @keyframes menu-in {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes menu-in-above {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu {
      animation: none;
    }
  }
</style>
