<script lang="ts">
  import type { KvStore } from "./kv-stores";
  import CopyIcon from "./icons/CopyIcon.svelte";
  import EllipsisVerticalIcon from "./icons/EllipsisVerticalIcon.svelte";
  import FilePenIcon from "./icons/FilePenIcon.svelte";
  import OpenPathIcon from "./icons/OpenPathIcon.svelte";
  import SquareArrowOutUpRightIcon from "./icons/SquareArrowOutUpRightIcon.svelte";
  import SquarePenIcon from "./icons/SquarePenIcon.svelte";
  import TrashIcon from "./icons/TrashIcon.svelte";

  const {
    kvStore,
    onEditKvStore,
    onDeleteKvStore,
  }: {
    kvStore: KvStore;
    onEditKvStore: (kvStore: KvStore) => void;
    onDeleteKvStore: (kvStore: KvStore) => void;
  } = $props();

  const isLocal = $derived(
    kvStore.type === "local" || kvStore.type === "default",
  );

  const MENU_GAP = 4;

  let open = $state(false);
  let root: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let menu: HTMLDivElement | undefined = $state();

  // The dropdown lives on the document body (like the original app's portal)
  // so it is not clipped by the scrollable kv stores grid.
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

  function runAction() {
    // Browse, Rename and Open Path are still no-ops in this recreation.
    closeMenu(false);
  }

  async function copyPathOrUrl() {
    closeMenu(false);

    try {
      await navigator.clipboard.writeText(kvStore.url);
    } catch {}
  }

  function deleteKvStore() {
    closeMenu(false);
    onDeleteKvStore(kvStore);
  }

  function editKvStore() {
    closeMenu(false);

    // Default kv stores are renamed, not edited, in the original app. The
    // rename dialog is not part of this recreation yet.
    if (kvStore.type === "default") return;

    onEditKvStore(kvStore);
  }

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
    // scrolling inside the kv stores grid as well.
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
    class="card-menu"
    type="button"
    aria-label="Kv Store actions"
    title="Kv Store actions"
    aria-haspopup="menu"
    aria-expanded={open}
    onclick={toggleMenu}
  >
    <EllipsisVerticalIcon size={20} />
  </button>
</div>

{#if open}
  <div
    class="menu"
    role="menu"
    tabindex="-1"
    aria-label="Kv Store actions"
    {@attach portal}
    {@attach positionMenu}
    bind:this={menu}
    onkeydown={handleMenuKeyDown}
  >
    <button
      class="menu-item"
      type="button"
      role="menuitem"
      tabindex="-1"
      onclick={runAction}
    >
      <SquareArrowOutUpRightIcon size={16} />
      <span>Browse</span>
    </button>

    <button
      class="menu-item"
      type="button"
      role="menuitem"
      tabindex="-1"
      onclick={copyPathOrUrl}
    >
      <CopyIcon size={16} />
      <span>Copy {isLocal ? "Path" : "URL"}</span>
    </button>

    <button
      class="menu-item"
      type="button"
      role="menuitem"
      tabindex="-1"
      onclick={editKvStore}
    >
      {#if kvStore.type === "default"}
        <FilePenIcon size={16} />
        <span>Rename</span>
      {:else}
        <SquarePenIcon size={16} />
        <span>Edit</span>
      {/if}
    </button>

    {#if kvStore.type === "default"}
      <button
        class="menu-item"
        type="button"
        role="menuitem"
        tabindex="-1"
        onclick={runAction}
      >
        <OpenPathIcon size={16} />
        <span>Open Path</span>
      </button>
    {/if}

    <div class="menu-separator" role="separator"></div>

    <button
      class="menu-item destructive"
      type="button"
      role="menuitem"
      tabindex="-1"
      onclick={deleteKvStore}
    >
      <TrashIcon size={16} />
      <span>Delete</span>
    </button>
  </div>
{/if}

<style>
  .actions {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
  }

  .card-menu {
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

  .card-menu:hover {
    background: color-mix(in oklab, var(--accent) 50%, transparent);
  }

  .card-menu:focus-visible {
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

  .menu-separator {
    height: 1px;
    margin: 4px -4px;
    background: var(--border);
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

  @media (prefers-reduced-motion: reduce) {
    .menu {
      animation: none;
    }
  }
</style>
