<script lang="ts">
  let {
    value = $bindable(""),
    ariaLabel,
    placeholder = "",
    fixedHeight = false,
  }: {
    value?: string;
    ariaLabel: string;
    placeholder?: string;
    fixedHeight?: boolean;
  } = $props();
</script>

<textarea
  class="code-editor"
  class:fixed-height={fixedHeight}
  rows={fixedHeight ? undefined : 1}
  {placeholder}
  aria-label={ariaLabel}
  spellcheck="false"
  bind:value
></textarea>

<style>
  .code-editor {
    display: block;
    width: 100%;
    min-height: 42px;
    padding: 10px 12px;
    border: 0;
    border-radius: calc(var(--radius) - 2px);
    background: var(--card);
    color: var(--foreground);
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    resize: none;
    outline: none;
    field-sizing: content;
  }

  .code-editor.fixed-height {
    height: 100%;
    field-sizing: fixed;
  }

  .code-editor:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }
</style>
