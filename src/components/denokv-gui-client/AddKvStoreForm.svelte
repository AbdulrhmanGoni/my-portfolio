<script lang="ts">
  import { untrack } from "svelte";
  import ArrowLeftIcon from "./icons/ArrowLeftIcon.svelte";
  import CheckIcon from "./icons/CheckIcon.svelte";
  import ChevronDownIcon from "./icons/ChevronDownIcon.svelte";
  import DatabaseIcon from "./icons/DatabaseIcon.svelte";
  import DatabasePlusIcon from "./icons/DatabasePlusIcon.svelte";
  import PlugZapIcon from "./icons/PlugZapIcon.svelte";
  import SaveIcon from "./icons/SaveIcon.svelte";
  import SquarePenIcon from "./icons/SquarePenIcon.svelte";
  import XIcon from "./icons/XIcon.svelte";
  import {
    isCreatableKvStoreType,
    joinLocalKvPath,
    splitLocalKvPath,
    type CreateKvStoreInput,
    type CreatableKvStoreType,
    type KvStore,
  } from "./kv-stores";

  let {
    kvStore = null,
    onBack,
    onSubmit,
  }: {
    kvStore?: KvStore | null;
    onBack: () => void;
    onSubmit: (input: CreateKvStoreInput) => void;
  } = $props();

  const isEditing = $derived(kvStore !== null);

  // The form fields are editable copies, so they are seeded once when the form
  // opens rather than tracking later changes to the store being edited.
  const initialKvStore = untrack(() => kvStore);
  const initialLocalPath = splitLocalKvPath(
    initialKvStore?.type === "local" ? initialKvStore.url : "",
  );

  let kvStoreName = $state(initialKvStore?.name ?? "");
  let selectedType = $state<CreatableKvStoreType | "">(
    initialKvStore && isCreatableKvStoreType(initialKvStore.type)
      ? initialKvStore.type
      : "",
  );
  let kvStoreUrl = $state(
    initialKvStore && initialKvStore.type !== "local"
      ? initialKvStore.url
      : "",
  );
  let accessToken = $state(initialKvStore?.accessToken ?? "");
  let authToken = $state(initialKvStore?.authToken ?? "");
  let localKvFileName = $state(initialLocalPath.fileName || "kv.sqlite3");
  let localKvDirectory = $state(initialLocalPath.directory);
  let replaceExisting = $state(false);

  const isLocalStore = $derived(selectedType === "local");
  const isRemoteStore = $derived(selectedType === "remote");
  const isBridgeStore = $derived(selectedType === "bridge");
  const localKvUrl = $derived(
    joinLocalKvPath(localKvDirectory, localKvFileName),
  );

  function handleTypeChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;

    if (!isCreatableKvStoreType(value)) {
      selectedType = "";
      return;
    }

    selectedType = value;
  }

  function pickLocalFileName() {
    localKvFileName = "kv.sqlite3";
  }

  function pickLocalDirectory() {
    localKvDirectory = "/home/user/denokv";
  }

  function handleSubmit(
    event: SubmitEvent & { currentTarget: HTMLFormElement },
  ) {
    event.preventDefault();

    if (!selectedType) return;

    onSubmit({
      name: kvStoreName,
      type: selectedType,
      url: selectedType === "local" ? localKvUrl : kvStoreUrl,
      accessToken: isRemoteStore ? accessToken.trim() || null : null,
      authToken: isBridgeStore ? authToken.trim() || null : null,
    });
  }
</script>

<form class="add-kv-store-form" onsubmit={handleSubmit}>
  <h1 class="form-title">
    {#if isEditing}
      <SquarePenIcon size={24} />
      Edit KV Store
    {:else}
      <DatabaseIcon size={24} />
      Add KV Store
    {/if}
  </h1>

  <div class="form-fields">
    <div class="field">
      <label class="field-label" for="kv-store-name">Kv Store Name</label>
      <input
        class="text-input"
        type="text"
        id="kv-store-name"
        name="name"
        placeholder="Name"
        required
        bind:value={kvStoreName}
      />
      <p class="field-hint">Enter the name of the new kv store.</p>
    </div>

    <div class="field">
      <label class="field-label" for="kv-store-type">Kv Store Type</label>
      <div class="select-wrap">
        <select
          class="select-input"
          class:placeholder={!selectedType}
          id="kv-store-type"
          name="type"
          required
          value={selectedType}
          onchange={handleTypeChange}
        >
          <option value="" disabled>Select Type</option>
          <option value="remote">remote</option>
          <option value="bridge">bridge</option>
          <option value="local">local</option>
        </select>
        <span class="select-chevron" aria-hidden="true">
          <ChevronDownIcon size={16} />
        </span>
      </div>
      <p class="field-hint">
        Select the type of the kv store you want to create a connection to.
      </p>
    </div>

    {#if isLocalStore}
      <div class="local-fields">
        <div class="field">
          <label class="field-label" for="local-kv-file-name">
            Kv Store File Name
          </label>
          <div class="input-group">
            <input
              class="input-group-control"
              type="text"
              id="local-kv-file-name"
              placeholder="kv.sqlite3"
              required
              bind:value={localKvFileName}
            />
            <button
              class="pick-button"
              type="button"
              title="Fill a sample file name"
              onclick={pickLocalFileName}
            >
              Pick
            </button>
          </div>
          <p class="field-hint">
            Name of the file that contains the kv store data.
          </p>
        </div>

        <div class="field">
          <label class="field-label" for="local-kv-directory">
            Kv Store Directory
            <span class="label-optional">(absolute path)</span>
          </label>
          <div class="input-group">
            <input
              class="input-group-control"
              type="text"
              id="local-kv-directory"
              placeholder="/path/to/directory/"
              required
              bind:value={localKvDirectory}
            />
            <button
              class="pick-button"
              type="button"
              title="Fill a sample directory"
              onclick={pickLocalDirectory}
            >
              Pick
            </button>
          </div>
          <p class="field-hint">
            The directory of your local Deno KV store database file.
          </p>
        </div>
      </div>

      <div class="checkbox-row">
        <span class="checkbox-box">
          <input
            class="checkbox-input"
            type="checkbox"
            id="replace-existing"
            name="replaceExisting"
            bind:checked={replaceExisting}
          />
          {#if replaceExisting}
            <span class="checkbox-check" aria-hidden="true">
              <CheckIcon size={12} />
            </span>
          {/if}
        </span>
        <label class="checkbox-copy" for="replace-existing">
          <span class="checkbox-title">Replace Existing?</span>
          <span class="checkbox-description">
            If there is already an existing database file with the same name in
            the picked directory, replace it with a new empty database file.
          </span>
        </label>
      </div>
    {:else}
      <div class="field">
        <label class="field-label" for="kv-store-url">Kv Store URL</label>
        <input
          class="text-input"
          type="url"
          id="kv-store-url"
          name="url"
          placeholder="http://"
          required
          bind:value={kvStoreUrl}
        />
        <p class="field-hint">Enter URL of the kv Store.</p>
      </div>
    {/if}

    {#if isRemoteStore}
      <div class="field">
        <label class="field-label" for="kv-store-access-token">
          Access Token
        </label>
        <input
          class="text-input"
          type="text"
          id="kv-store-access-token"
          name="accessToken"
          placeholder="ddp_..."
          required
          bind:value={accessToken}
        />
        <p class="field-hint">
          Enter the access token of your remote kv store.
        </p>
      </div>
    {/if}

    {#if isBridgeStore}
      <div class="field">
        <label class="field-label" for="kv-store-auth-token">Auth Token</label>
        <input
          class="text-input"
          type="text"
          id="kv-store-auth-token"
          name="authToken"
          placeholder="Token..."
          bind:value={authToken}
        />
        <p class="field-hint">
          Enter the auth token of bridge server if it's required to access the
          server.
        </p>
      </div>
    {/if}
  </div>

  <div class="form-actions">
    <div class="form-buttons">
      <button class="button button-outline" type="button" onclick={onBack}>
        {#if isEditing}
          <XIcon size={16} />
          Cancel
        {:else}
          <ArrowLeftIcon size={16} />
          Back
        {/if}
      </button>
      <button
        class="button button-connection"
        type="button"
        title="Not available in this demo"
      >
        Test Connection
        <PlugZapIcon size={16} />
      </button>
      <button class="button button-primary" type="submit">
        {#if isEditing}
          Save
          <SaveIcon size={16} />
        {:else}
          Add
          <DatabasePlusIcon size={16} />
        {/if}
      </button>
    </div>
  </div>
</form>

<style>
  .add-kv-store-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 0;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
    color: var(--card-foreground);
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
  }

  .form-title {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  .form-fields {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
    padding-inline-end: 6px;
    overflow-y: auto;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .field-label {
    color: var(--foreground);
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
  }

  .label-optional {
    margin-inline-start: 4px;
    color: var(--muted-foreground);
    font-weight: 400;
  }

  .field-hint {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 14px;
    line-height: 1.43;
  }

  .text-input,
  .select-input,
  .input-group {
    width: 100%;
    height: 36px;
    border: 1px solid var(--input);
    border-radius: calc(var(--radius) - 2px);
    background: var(--background);
    color: var(--foreground);
    font-size: 14px;
    font-weight: 400;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  :global(.dark) .text-input,
  :global(.dark) .select-input,
  :global(.dark) .input-group {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .text-input {
    min-width: 0;
    padding: 0 12px;
    outline: none;
  }

  .text-input::placeholder,
  .input-group-control::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }

  .text-input:focus-visible,
  .select-input:focus-visible,
  .input-group:focus-within {
    border-color: var(--ring);
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .select-wrap {
    position: relative;
  }

  .select-input {
    appearance: none;
    padding: 0 36px 0 12px;
    cursor: pointer;
    outline: none;
  }

  .select-input.placeholder {
    color: var(--muted-foreground);
  }

  .select-input option {
    background: var(--popover);
    color: var(--foreground);
  }

  .select-chevron {
    position: absolute;
    top: 50%;
    right: 12px;
    display: inline-flex;
    color: var(--muted-foreground);
    pointer-events: none;
    transform: translateY(-50%);
  }

  .local-fields {
    display: flex;
    gap: 8px;
  }

  .local-fields .field {
    flex: 1;
  }

  .input-group {
    display: flex;
    align-items: center;
  }

  .input-group-control {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 0 0 12px;
    border: 0;
    background: transparent;
    color: var(--foreground);
    font-size: 14px;
    outline: none;
  }

  .pick-button {
    flex-shrink: 0;
    height: 26px;
    margin-inline-end: 5px;
    padding: 0 8px;
    border: 0;
    border-radius: calc(var(--radius) - 4px);
    background: transparent;
    color: var(--foreground);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .pick-button:hover {
    background: color-mix(in oklab, var(--accent) 70%, transparent);
  }

  .pick-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .checkbox-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .checkbox-box {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }

  .checkbox-input {
    width: 16px;
    height: 16px;
    margin: 0;
    appearance: none;
    border: 1px solid var(--input);
    border-radius: 4px;
    background: transparent;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    outline: none;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;
  }

  :global(.dark) .checkbox-input {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .checkbox-input:checked {
    border-color: var(--primary);
    background: var(--primary);
  }

  .checkbox-input:focus-visible {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .checkbox-check {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-foreground);
    pointer-events: none;
  }

  .checkbox-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
  }

  .checkbox-title {
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
  }

  .checkbox-description {
    color: var(--muted-foreground);
    font-size: 14px;
    line-height: 1.43;
  }

  .form-actions {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: auto;
  }

  .form-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    margin-inline-start: auto;
  }

  .button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 36px;
    padding: 0 16px;
    border: 0;
    border-radius: calc(var(--radius) - 2px);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .button-outline {
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
  }

  .button-outline:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  :global(.dark) .button-outline {
    border-color: var(--input);
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  :global(.dark) .button-outline:hover {
    background: color-mix(in oklab, var(--input) 50%, transparent);
    color: var(--foreground);
  }

  .button-connection {
    background: var(--secondary-2);
    color: var(--secondary-2-foreground);
  }

  .button-connection:hover {
    background: color-mix(in oklab, var(--secondary-2) 80%, transparent);
  }

  .button-primary {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .button-primary:hover {
    background: color-mix(in oklab, var(--primary) 90%, transparent);
  }

  @media (max-width: 639px) {
    .local-fields {
      flex-direction: column;
      gap: 16px;
    }

    .form-buttons {
      width: 100%;
    }
  }
</style>
