<script lang="ts">
  import type { FileIcon } from "./file-icons";

  let {
    icon,
    size = 18,
  }: {
    icon: FileIcon;
    size?: number;
  } = $props();
</script>

{#if "character" in icon}
  <span
    class="seti"
    style:color={icon.color}
    style:font-size={`${size}px`}
    aria-hidden="true">{icon.character}</span
  >
{:else}
  <svg
    class="file-icon"
    style:color={icon.color}
    style:width={`${icon.size ?? size}px`}
    style:height={`${icon.size ?? size}px`}
    viewBox={icon.viewBox}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d={icon.path} fill="currentColor" />
  </svg>
{/if}

<style>
  .file-icon {
    display: block;
    flex: none;
  }
</style>
