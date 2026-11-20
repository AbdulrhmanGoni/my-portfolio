<script lang="ts">
  import CircleAlertIcon from "./icons/CircleAlertIcon.svelte";
  import { toasts } from "./notifications.svelte";
</script>

<ol
  class="toaster"
  aria-label="Notifications"
  aria-live="polite"
  aria-relevant="additions text"
  aria-atomic="false"
>
  {#each toasts as toast (toast.id)}
    <li
      class="toast"
      class:warning={toast.variant === "warning"}
      class:leaving={toast.leaving}
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="icon" aria-hidden="true">
        {#if toast.variant === "warning"}
          <CircleAlertIcon size={20} />
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            height="20"
            width="20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        {/if}
      </span>
      <span class="title">{toast.message}</span>
    </li>
  {/each}
</ol>

<style>
  .toaster {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 999999999;
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 356px;
    max-width: calc(100% - 32px);
    margin: 0;
    padding: 0;
    list-style: none;
    pointer-events: none;
    font-family:
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      "Helvetica Neue",
      Arial,
      "Noto Sans",
      sans-serif,
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      "Noto Color Emoji";
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 16px;
    border: 1px solid hsl(145, 92%, 87%);
    border-radius: 8px;
    background: hsl(143, 85%, 96%);
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
    color: hsl(140, 100%, 27%);
    font-size: 13px;
    overflow-wrap: anywhere;
    animation: toast-in 400ms ease;
  }

  .toast.leaving {
    animation: toast-out 200ms ease forwards;
  }

  .icon {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-start;
    width: 16px;
    height: 16px;
    margin-left: -3px;
    margin-right: 4px;
  }

  .icon svg {
    flex-shrink: 0;
    margin-left: -1px;
  }

  .title {
    font-weight: 500;
    line-height: 1.5;
    color: inherit;
  }

  :global(.dark) .toast {
    border-color: hsl(147, 100%, 12%);
    background: hsl(150, 100%, 6%);
    color: hsl(150, 86%, 65%);
  }

  .toast.warning {
    border-color: hsl(45, 96%, 82%);
    background: hsl(48, 100%, 96%);
    color: hsl(32, 95%, 30%);
  }

  :global(.dark) .toast.warning {
    border-color: hsl(35, 92%, 20%);
    background: hsl(37, 92%, 8%);
    color: hsl(45, 93%, 65%);
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes toast-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(100%);
    }
  }

  @media (max-width: 600px) {
    .toaster {
      right: 16px;
      bottom: 16px;
      left: 16px;
      width: auto;
      max-width: none;
    }
  }
</style>
