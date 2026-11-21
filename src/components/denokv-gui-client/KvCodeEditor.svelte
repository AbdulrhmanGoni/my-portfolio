<script lang="ts">
  import { onMount } from "svelte";
  import { CodeJar, type CodeJar as CodeJarInstance } from "codejar";
  import { highlightCode } from "./code-highlight";
  import "./code-highlight.css";

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

  let editorElement: HTMLDivElement;
  let jar = $state.raw<CodeJarInstance | null>(null);

  // Mirrors the original app: the editor writes its plain text back to the
  // bound value and replaces its content with highlighted markup.
  function highlight(element: HTMLElement) {
    const code = element.textContent ?? "";

    value = code;
    element.innerHTML = highlightCode(code);
  }

  onMount(() => {
    const instance = CodeJar(editorElement, highlight, { addClosing: false });

    jar = instance;
    instance.updateCode(value);

    return () => {
      instance.destroy();
      jar = null;
    };
  });

  // Keep the editor in sync when the bound value changes from the outside,
  // e.g. when the value type select swaps in a starter value.
  $effect(() => {
    const nextValue = value;

    if (jar && jar.toString() !== nextValue) {
      jar.updateCode(nextValue);
    }
  });
</script>

<div
  bind:this={editorElement}
  class="code-editor"
  class:fixed-height={fixedHeight}
  role="textbox"
  aria-multiline="true"
  aria-label={ariaLabel}
  data-placeholder={placeholder}
></div>

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
    overflow-wrap: break-word;
    overflow-y: auto;
    white-space: pre-wrap;
    outline: none;
    cursor: text;
  }

  .code-editor.fixed-height {
    height: 100%;
  }

  .code-editor:empty::before {
    color: var(--muted-foreground);
    content: attr(data-placeholder);
    pointer-events: none;
  }

  .code-editor:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
  }
</style>
