// Loading state for applications embedded with EmbeddedApp.astro.
//
// The embedded app posts EMBEDDED_APP_READY when it has mounted. The listener
// finds the iframe that sent it and marks the wrapper as ready, which hides
// the spinner.

const EMBEDDED_APP_READY = "embedded-app-ready";

export function wireEmbeddedApps(): void {
  window.addEventListener("message", (event) => {
    if (
      event.origin !== window.location.origin ||
      event.data !== EMBEDDED_APP_READY
    ) {
      return;
    }

    for (const frame of document.querySelectorAll<HTMLIFrameElement>("iframe")) {
      if (frame.contentWindow !== event.source) continue;

      frame.closest("[data-embedded-app]")?.classList.add("is-ready");
      return;
    }
  });
}
