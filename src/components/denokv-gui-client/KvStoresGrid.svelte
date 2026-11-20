<script lang="ts">
  import type { Component } from "svelte";
  import CircleOffIcon from "./icons/CircleOffIcon.svelte";
  import CirclePlusIcon from "./icons/CirclePlusIcon.svelte";
  import DatabaseIcon from "./icons/DatabaseIcon.svelte";
  import FileIcon from "./icons/FileIcon.svelte";
  import FunnelIcon from "./icons/FunnelIcon.svelte";
  import FunnelXIcon from "./icons/FunnelXIcon.svelte";
  import GlobeIcon from "./icons/GlobeIcon.svelte";
  import HardDriveIcon from "./icons/HardDriveIcon.svelte";
  import ServerIcon from "./icons/ServerIcon.svelte";
  import XIcon from "./icons/XIcon.svelte";
  import FilterKvStoresChip from "./FilterKvStoresChip.svelte";
  import KvStoreCard from "./KvStoreCard.svelte";
  import type { KvStore, KvStoreType } from "./kv-stores";

  let {
    kvStores,
    onAddKvStore,
    onDeleteKvStore,
  }: {
    kvStores: KvStore[];
    onAddKvStore: () => void;
    onDeleteKvStore: (kvStore: KvStore) => void;
  } = $props();

  type FilterOption = {
    label: string;
    type: KvStoreType;
    icon: Component;
  };

  const filterOptions: FilterOption[] = [
    { label: "Remote", type: "remote", icon: GlobeIcon },
    { label: "Local", type: "local", icon: HardDriveIcon },
    { label: "Default", type: "default", icon: FileIcon },
    { label: "Bridge", type: "bridge", icon: ServerIcon },
  ];

  let selectedTypes = $state<KvStoreType[]>([]);
  let nameFilter = $state("");

  const trimmedNameFilter = $derived(nameFilter.trim());

  const typeCounts = $derived.by(() => {
    const counts: Record<KvStoreType, number> = {
      remote: 0,
      local: 0,
      default: 0,
      bridge: 0,
    };

    for (const store of kvStores) {
      counts[store.type] += 1;
    }

    return counts;
  });

  const filteredKvStores = $derived(
    kvStores.filter((store) => {
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(store.type);

      const matchesName =
        !trimmedNameFilter ||
        store.name.toLowerCase().includes(trimmedNameFilter.toLowerCase());

      return matchesType && matchesName;
    }),
  );

  function toggleFilter(type: KvStoreType) {
    selectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((selectedType) => selectedType !== type)
      : [...selectedTypes, type];
  }

  function clearFilters() {
    selectedTypes = [];
    nameFilter = "";
  }
</script>

<section class="kv-stores-panel">
  <div class="panel-head">
    <div>
      <h1 class="panel-title">
        <DatabaseIcon size={28} />
        Kv Stores
      </h1>
      <p class="panel-subtitle">
        Double click on a Kv Store card to open and browse it.
      </p>
    </div>

    {#if kvStores.length > 0}
      {@render addKvStoreButton()}
    {/if}
  </div>

  <div class="separator"></div>

  <div class="filters-row">
    <div class="type-filters">
      {#each filterOptions as option (option.type)}
        <FilterKvStoresChip
          label={option.label}
          type={option.type}
          icon={option.icon}
          count={typeCounts[option.type]}
          selected={selectedTypes.includes(option.type)}
          onclick={() => toggleFilter(option.type)}
        />
      {/each}
    </div>

    <div class="name-filter">
      <span class="name-filter-addon">
        <FunnelIcon size={16} />
      </span>
      <input
        class="name-filter-input"
        type="text"
        placeholder="Filter By Name"
        aria-label="Filter Kv Stores by name"
        bind:value={nameFilter}
      />
      <span class="name-filter-addon end">
        <button
          class="clear-name-filter"
          type="button"
          aria-label="Clear name filter"
          title="Clear name filter"
          disabled={!trimmedNameFilter}
          onclick={() => (nameFilter = "")}
        >
          {#if trimmedNameFilter}
            <XIcon size={16} />
          {/if}
        </button>
      </span>
    </div>
  </div>

  {#if kvStores.length === 0}
    <div class="empty-state">
      <CircleOffIcon size={40} />
      <p class="empty-title">No kv stores are available</p>
      <p class="empty-copy">
        Start by adding a new kv store, and then open and explore it!
      </p>
      {@render addKvStoreButton()}
    </div>
  {:else if filteredKvStores.length === 0}
    <div class="empty-state">
      <FunnelXIcon size={40} />
      <p class="empty-title">No matching Kv Stores</p>
      <p class="empty-copy">
        No kv stores found matching the selected filters.
      </p>
      <button class="outline-button" type="button" onclick={clearFilters}>
        Clear filters
      </button>
    </div>
  {:else}
    <div class="kv-stores-grid" id="kv-stores-grid">
      {#each filteredKvStores as kvStore (kvStore.id)}
        <KvStoreCard {kvStore} {onDeleteKvStore} />
      {/each}
    </div>
  {/if}
</section>

{#snippet addKvStoreButton()}
  <button class="add-button" type="button" onclick={onAddKvStore}>
    Add Kv Store
    <CirclePlusIcon size={20} />
  </button>
{/snippet}

<style>
  .kv-stores-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    min-height: 0;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) - 2px);
    color: var(--card-foreground);
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  .panel-head {
    display: flex;
    flex-shrink: 0;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  .panel-subtitle {
    color: var(--muted-foreground);
    font-size: 16px;
  }

  .separator {
    flex-shrink: 0;
    height: 1px;
    background: var(--border);
  }

  .filters-row {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .type-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    height: stretch;
  }

  .name-filter {
    display: flex;
    align-items: center;
    width: 268px;
    max-width: 100%;
    height: 36px;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: var(--background);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  :global(.dark) .name-filter {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .name-filter:focus-within {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .name-filter-addon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding-inline-start: 12px;
    color: var(--muted-foreground);
  }

  .name-filter-addon.end {
    padding: 0 8px 0 0;
  }

  .name-filter-input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 4px 0 8px;
    border: 0;
    background: transparent;
    color: var(--foreground);
    font-size: 14px;
    font-weight: 500;
    outline: none;
  }

  .name-filter-input::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }

  .clear-name-filter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .clear-name-filter:disabled {
    cursor: default;
  }

  .clear-name-filter:not(:disabled):hover {
    color: var(--foreground);
  }

  .add-button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 36px;
    padding: 0 12px;
    border: 0;
    border-radius: calc(var(--radius) - 2px);
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .add-button:hover {
    background: color-mix(in oklab, var(--primary) 90%, transparent);
  }

  .add-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .kv-stores-grid {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
    gap: 8px;
    min-height: 0;
    padding-inline-end: 6px;
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 0;
    text-align: center;
  }

  .empty-title {
    color: var(--foreground);
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
  }

  .empty-copy {
    color: var(--muted-foreground);
    font-size: 16px;
  }

  .outline-button {
    height: 36px;
    padding: 0 16px;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) - 2px);
    background: var(--background);
    color: var(--foreground);
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .outline-button:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  :global(.dark) .outline-button {
    border-color: var(--input);
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  :global(.dark) .outline-button:hover {
    background: color-mix(in oklab, var(--input) 50%, transparent);
    color: var(--foreground);
  }

  @media (max-width: 639px) {
    .kv-stores-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
