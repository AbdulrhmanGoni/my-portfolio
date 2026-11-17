<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import HardDriveDownloadIcon from "@lucide/svelte/icons/hard-drive-download";
  import NotesIcon from "@lucide/svelte/icons/notepad-text";
  import SearchCheckIcon from "@lucide/svelte/icons/search-check";

  let {
    autoCheckForUpdate,
    onAutoCheckForUpdateChange,
  }: {
    autoCheckForUpdate: boolean;
    onAutoCheckForUpdateChange: (value: boolean) => void;
  } = $props();

  // Static metadata mirrored from the real application.
  const appVersion = "1.32.1";
</script>

<div class="update-setting">
  <h3 class="section-title">
    <HardDriveDownloadIcon size={24} />
    App Update
  </h3>

  <div class="current-version">
    <p class="current-version-text">
      Current Version: <span>v{appVersion}</span>
    </p>
    <button class="notes-button" type="button">
      <NotesIcon size={16} />
      Notes
    </button>
  </div>

  <button class="check-button" type="button">
    Check for update
    <SearchCheckIcon size={16} />
  </button>

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
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .notes-button:hover {
    background: color-mix(in oklab, var(--primary) 90%, transparent);
  }

  .notes-button:focus-visible,
  .check-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .check-button {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 32px;
    padding: 0 10px;
    border: 0;
    border-radius: calc(var(--radius) - 2px);
    background: var(--secondary-2);
    color: var(--secondary-2-foreground);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .check-button:hover {
    background: color-mix(in oklab, var(--secondary-2) 80%, transparent);
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
    background: color-mix(in oklab, var(--input) 30%, transparent);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    transition:
      background-color 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;
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
</style>
