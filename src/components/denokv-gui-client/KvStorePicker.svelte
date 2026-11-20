<script lang="ts">
  import type { Component } from "svelte";
  import FileIcon from "./icons/FileIcon.svelte";
  import GlobeIcon from "./icons/GlobeIcon.svelte";
  import HardDriveIcon from "./icons/HardDriveIcon.svelte";
  import ServerIcon from "./icons/ServerIcon.svelte";
  import type { KvStore } from "./kv-stores";

  let { kvStore }: { kvStore: KvStore } = $props();

  const StoreIcon: Component = $derived(
    kvStore.type === "remote"
      ? GlobeIcon
      : kvStore.type === "default"
        ? FileIcon
        : kvStore.type === "local"
          ? HardDriveIcon
          : ServerIcon,
  );
</script>

<!--
  The original uses a select to switch between open kv stores. This recreation
  keeps the trigger's look, but it is only a box showing the current store.
-->
<div class="kv-store-picker" title={kvStore.name}>
  <span class="store-icon {kvStore.type}"><StoreIcon size={20} /></span>
  <span class="store-name">{kvStore.name}</span>
</div>

<style>
  /* Matches the original select trigger (text-base) without the chevron. */
  .kv-store-picker {
    display: inline-flex;
    min-width: 0;
    width: fit-content;
    height: 36px;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: transparent;
    color: var(--foreground);
    font-size: 16px;
    white-space: nowrap;
    user-select: none;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  :global(.dark) .kv-store-picker {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .store-icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  .store-icon.remote {
    color: var(--secondary);
  }

  .store-icon.default {
    color: var(--secondary-2);
  }

  .store-icon.local {
    color: var(--secondary-3);
  }

  .store-icon.bridge {
    color: var(--secondary-1);
  }

  .store-name {
    max-width: 24rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
