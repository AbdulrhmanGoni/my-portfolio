<script lang="ts">
  import CalendarFoldIcon from "./icons/CalendarFoldIcon.svelte";
  import CalendarSyncIcon from "./icons/CalendarSyncIcon.svelte";
  import EllipsisVerticalIcon from "./icons/EllipsisVerticalIcon.svelte";
  import FileIcon from "./icons/FileIcon.svelte";
  import FileSymlinkIcon from "./icons/FileSymlinkIcon.svelte";
  import GlobeIcon from "./icons/GlobeIcon.svelte";
  import HardDriveIcon from "./icons/HardDriveIcon.svelte";
  import LinkIcon from "./icons/LinkIcon.svelte";
  import ServerIcon from "./icons/ServerIcon.svelte";
  import { formatTimeAgo, type KvStore } from "./kv-stores";

  const { kvStore }: { kvStore: KvStore } = $props();

  const isLocal = $derived(
    kvStore.type === "local" || kvStore.type === "default",
  );
</script>

<article class="kv-store-card">
  <div class="card-head">
    <span class="type-icon {kvStore.type}">
      {#if kvStore.type === "remote"}
        <GlobeIcon size={20} />
      {:else if kvStore.type === "default"}
        <FileIcon size={20} />
      {:else if kvStore.type === "local"}
        <HardDriveIcon size={20} />
      {:else}
        <ServerIcon size={20} />
      {/if}
    </span>

    <p class="card-name" title={kvStore.name}>{kvStore.name}</p>

    <button
      class="card-menu"
      type="button"
      aria-label="Kv Store actions"
      title="Kv Store actions"
    >
      <EllipsisVerticalIcon size={20} />
    </button>
  </div>

  <p class="card-line">
    <span class="line-icon">
      {#if isLocal}
        <FileSymlinkIcon size={16} />
      {:else}
        <LinkIcon size={16} />
      {/if}
    </span>
    <span class="line-label">{isLocal ? "Path" : "Url"}:</span>
    <span class="line-value" title={kvStore.url}>{kvStore.url}</span>
  </p>

  <p class="card-line">
    <span class="line-icon"><CalendarFoldIcon size={16} /></span>
    Created:
    <span>{formatTimeAgo(new Date(kvStore.createdAt))}</span>
  </p>

  <p class="card-line">
    <span class="line-icon"><CalendarSyncIcon size={16} /></span>
    Last Update:
    <span>{formatTimeAgo(new Date(kvStore.updatedAt))}</span>
  </p>
</article>

<style>
  .kv-store-card {
    width: 100%;
    height: fit-content;
    padding: 16px;
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
    color: var(--muted-foreground);
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .type-icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  .type-icon.remote {
    color: var(--secondary);
  }

  .type-icon.local {
    color: var(--secondary-3);
  }

  .type-icon.default {
    color: var(--secondary-2);
  }

  .type-icon.bridge {
    color: var(--secondary-1);
  }

  .card-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--foreground);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  .card-line {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.43;
  }

  .line-icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  .line-label {
    flex-shrink: 0;
  }

  .line-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
