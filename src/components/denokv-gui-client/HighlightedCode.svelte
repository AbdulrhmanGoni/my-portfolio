<script lang="ts">
  import { highlightCode } from "./code-highlight";

  let { code }: { code: string } = $props();

  const html = $derived(highlightCode(code));
</script>

<!-- highlight.js escapes the input before wrapping it in token spans. -->
<code class="highlighted-code">{@html html}</code>

<style>
  /* Keep the highlighted markup inline and in the surrounding font, rather
     than the browser's default monospace code style. */
  .highlighted-code {
    font: inherit;
  }
</style>
