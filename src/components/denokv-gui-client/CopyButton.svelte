<script lang="ts">
  import { onDestroy } from "svelte";
  import CheckIcon from "./icons/CheckIcon.svelte";
  import CopyIcon from "./icons/CopyIcon.svelte";

  let {
    text,
    label,
    className = "",
  }: {
    text: string;
    label: string;
    className?: string;
  } = $props();

  let copied = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  function handleClick() {
    void navigator.clipboard?.writeText(text).catch(() => {});

    copied = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (copied = false), 5000);
  }

  onDestroy(() => clearTimeout(resetTimer));
</script>

<button
  class="copy-button {className}"
  type="button"
  aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
  title={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
  onclick={handleClick}
>
  {#if copied}
    <CheckIcon size={16} />
  {:else}
    <CopyIcon size={16} />
  {/if}
</button>

<style>
  .copy-button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: calc(var(--radius) - 4px);
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .copy-button:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  .copy-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }
</style>
