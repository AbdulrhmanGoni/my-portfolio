<script lang="ts">
  import CheckIcon from "./icons/CheckIcon.svelte";

  let {
    checked = false,
    disabled = false,
    ariaLabel,
    label,
    labelClass = "",
    onCheckedChange,
  }: {
    checked?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    label?: string;
    labelClass?: string;
    onCheckedChange?: (checked: boolean) => void;
  } = $props();
</script>

<label class="checkbox" class:disabled>
  <span class="checkbox-box">
    <input
      class="checkbox-input"
      type="checkbox"
      {checked}
      {disabled}
      aria-label={ariaLabel ?? label}
      onchange={(event) => onCheckedChange?.(event.currentTarget.checked)}
    />
    {#if checked}
      <span class="checkbox-check" aria-hidden="true">
        <CheckIcon size={12} />
      </span>
    {/if}
  </span>

  {#if label}
    <span class="checkbox-label {labelClass}">{label}</span>
  {/if}
</label>

<style>
  .checkbox {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .checkbox.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .checkbox-box {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
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

  .checkbox-label {
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
  }

  .checkbox-label.dimmed {
    opacity: 0.7;
  }
</style>
