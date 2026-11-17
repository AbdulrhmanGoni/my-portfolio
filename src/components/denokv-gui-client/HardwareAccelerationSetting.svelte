<script lang="ts">
  import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
  import GPUIcon from "@lucide/svelte/icons/gpu";

  let {
    enabled,
    onEnabledChange,
  }: {
    enabled: boolean;
    onEnabledChange: (value: boolean) => void;
  } = $props();
</script>

<div class="hardware-setting">
  <h3 class="section-title">
    <GPUIcon size={24} />
    Hardware Acceleration
  </h3>

  <p class="description">
    When enabled, the app will use your computer's graphics hardware (if
    available) to improve visual performance for smoother experience
  </p>

  <div class="acceleration-card">
    <button
      class="switch"
      class:checked={enabled}
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="Hardware acceleration"
      onclick={() => onEnabledChange(!enabled)}
    >
      <span class="switch-thumb"></span>
    </button>
    <span class="status">{enabled ? "Enabled" : "Disabled"}</span>
  </div>

  <div class="hint" class:invisible={!enabled}>
    <CircleAlertIcon size={16} />
    <p>Disable this if you noticed display issues or unexpected crashes</p>
  </div>
</div>

<style>
  .hardware-setting {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
  }

  .description {
    color: var(--muted-foreground);
    font-size: 14px;
    line-height: 20px;
  }

  .acceleration-card {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
  }

  .switch {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    width: 32px;
    height: 18.4px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 9999px;
    background: var(--input);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  :global(.dark) .switch {
    background: color-mix(in oklab, var(--input) 80%, transparent);
  }

  .switch.checked {
    background: var(--secondary-3);
  }

  .switch:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }

  .switch-thumb {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 9999px;
    background: white;
    transform: translateX(0);
    transition: transform 0.15s;
  }

  .switch.checked .switch-thumb {
    transform: translateX(14px);
  }

  .status {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .hint {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border: 1px solid color-mix(in oklab, var(--secondary) 50%, transparent);
    border-radius: calc(var(--radius) - 2px);
    color: var(--secondary);
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }

  .hint svg {
    flex-shrink: 0;
  }

  .hint p {
    margin: 0;
  }

  .hint.invisible {
    visibility: hidden;
  }
</style>
