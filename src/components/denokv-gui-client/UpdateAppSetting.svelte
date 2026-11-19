<script lang="ts">
  import CheckIcon from "./icons/CheckIcon.svelte";
  import DownloadIcon from "./icons/DownloadIcon.svelte";
  import HardDriveDownloadIcon from "./icons/HardDriveDownloadIcon.svelte";
  import LoaderIcon from "./icons/LoaderIcon.svelte";
  import NotesIcon from "./icons/NotesIcon.svelte";
  import SearchCheckIcon from "./icons/SearchCheckIcon.svelte";
  import { formatTimeAgo } from "./format-time-ago";
  import type { DenokvReleaseInfo } from "./release-info";
  import { checkForUpdates, updateState } from "./update-state.svelte";

  let {
    releaseInfo,
    autoCheckForUpdate,
    onAutoCheckForUpdateChange,
  }: {
    releaseInfo: DenokvReleaseInfo;
    autoCheckForUpdate: boolean;
    onAutoCheckForUpdateChange: (value: boolean) => void;
  } = $props();

  const appVersion = $derived(releaseInfo.app.version);
  const newUpdate = $derived(
    updateState.result?.hasUpdate ? updateState.result : null,
  );

  function handleCheckForUpdate() {
    void checkForUpdates(releaseInfo, { force: true });
  }
</script>

<div class="update-setting">
  <h3 class="section-title">
    <HardDriveDownloadIcon size={24} />
    App Update
    {#if newUpdate}
      <span class="update-dot" aria-hidden="true"></span>
    {/if}
  </h3>

  <div class="current-version">
    <p class="current-version-text">
      Current Version: <span>v{appVersion}</span>
    </p>
    <a
      class="notes-button"
      href={releaseInfo.app.releaseUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Open release notes on GitHub"
    >
      <NotesIcon size={16} />
      Notes
    </a>
  </div>

  <div class="update-status" aria-live="polite">
    {#if updateState.errorMessage}
      <p class="error-text">{updateState.errorMessage}</p>
    {:else if newUpdate}
      <p>
        New version is available:
        <span class="strong">v{newUpdate.latestVersion}</span>
        {#if newUpdate.latestPublishedAt}
          (<span>{formatTimeAgo(newUpdate.latestPublishedAt)}</span>)
        {/if}
      </p>
    {:else if updateState.result}
      <p class="muted-text">No new version is available</p>
    {/if}
  </div>

  {#if newUpdate}
    <div class="update-actions">
      {#if newUpdate.latestReleaseUrl}
        <a
          class="download-button"
          href={newUpdate.latestReleaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open release page on GitHub"
        >
          Download Update
          <DownloadIcon size={16} />
        </a>
        <a
          class="notes-outline-button"
          href={newUpdate.latestReleaseUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          See Release Notes
          <NotesIcon size={16} />
        </a>
      {/if}
    </div>
  {:else}
    <button
      class="check-button"
      type="button"
      disabled={updateState.checking}
      onclick={handleCheckForUpdate}
    >
      {#if updateState.checking}
        Checking for update
        <span class="spinner"><LoaderIcon size={16} /></span>
      {:else}
        Check for update
        <SearchCheckIcon size={16} />
      {/if}
    </button>
  {/if}

  <label class="checkbox-row">
    <span class="checkbox-box" class:checked={autoCheckForUpdate}>
      <input
        class="checkbox-input"
        type="checkbox"
        checked={autoCheckForUpdate}
        onchange={(event) =>
          onAutoCheckForUpdateChange(event.currentTarget.checked)}
      />
      <span class="checkbox-indicator" aria-hidden="true">
        {#if autoCheckForUpdate}
          <CheckIcon size={14} />
        {/if}
      </span>
    </span>
    <span class="checkbox-label">
      Always check for new updates automatically
    </span>
  </label>
</div>

<style>
  .update-setting {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
  }

  .update-dot {
    width: 8px;
    height: 8px;
    margin-inline-start: -4px;
    margin-top: 2px;
    align-self: flex-start;
    border-radius: 50%;
    background: var(--destructive);
  }

  .current-version {
    display: flex;
    align-items: center;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
  }

  .current-version-text {
    padding: 4px 8px;
    font-size: 16px;
    line-height: 24px;
  }

  .current-version-text span {
    font-weight: 600;
  }

  .notes-button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 32px;
    margin-inline-start: auto;
    padding: 0 10px;
    border: 0;
    border-radius: 0 calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0;
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .notes-button:hover {
    background: color-mix(in oklab, var(--primary) 90%, transparent);
  }

  .notes-button:focus-visible,
  .check-button:focus-visible,
  .download-button:focus-visible,
  .notes-outline-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .update-status {
    font-size: 14px;
    line-height: 20px;
  }

  .update-status:empty {
    display: none;
  }

  .update-status .strong {
    font-weight: 600;
  }

  .muted-text {
    color: var(--muted-foreground);
    font-style: italic;
  }

  .error-text {
    color: var(--destructive);
  }

  .update-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .check-button,
  .download-button,
  .notes-outline-button {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 32px;
    padding: 0 10px;
    border: 0;
    border-radius: calc(var(--radius) - 2px);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color 0.15s,
      border-color 0.15s;
  }

  .check-button {
    background: var(--secondary-2);
    color: var(--secondary-2-foreground);
  }

  .check-button:hover:not(:disabled) {
    background: color-mix(in oklab, var(--secondary-2) 80%, transparent);
  }

  .check-button:disabled {
    cursor: progress;
    opacity: 0.75;
  }

  .spinner {
    display: inline-flex;
    animation: spin 1s linear infinite;
  }

  .download-button {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .download-button:hover {
    background: color-mix(in oklab, var(--primary) 90%, transparent);
  }

  .notes-outline-button {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--foreground);
  }

  .notes-outline-button:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    cursor: pointer;
  }

  .checkbox-box {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 1px solid var(--input);
    border-radius: 4px;
    background: transparent;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    transition:
      background-color 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;
  }

  :global(.dark) .checkbox-box {
    background: color-mix(in oklab, var(--input) 30%, transparent);
  }

  .checkbox-box.checked {
    border-color: var(--primary);
    background: var(--primary);
  }

  .checkbox-box:has(.checkbox-input:focus-visible) {
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .checkbox-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  .checkbox-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-foreground);
    pointer-events: none;
  }

  .checkbox-label {
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
