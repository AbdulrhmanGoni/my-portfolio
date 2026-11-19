// Types for the committed denokv-gui-client release snapshot.
//
// src/data/denokv-gui-client-release.json is read by Astro at build time and
// passed to the client app as props, so its values are inlined into the
// generated page. Svelte components only import these types; they never read
// the JSON file themselves.

export type DenokvReleaseInfo = {
  schemaVersion: number;
  app: {
    name: string;
    version: string;
    tag: string;
    repository: string;
    publishedAt: string | null;
    releaseUrl: string;
  };
  runtime: {
    electron: string;
    node: string;
    chromium: string;
  };
  // Release notes for the current version, rendered to HTML by `marked` (the
  // same way the desktop app renders its release notes). Displayed by the
  // in-app Release Notes dialog opened from the "Notes" button.
  releaseNotesHtml: string | null;
};
