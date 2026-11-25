import type { APIRoute, GetStaticPaths } from "astro";
import { demoEntries } from "../../../lib/vscode-demo/manifest";
import type { DemoImageEntry } from "../../../lib/vscode-demo/manifest";

// One static PNG per demo image. The browser fetches these on demand.
export const prerender = true;

// Only the paths listed here are generated, so each one carries its entry
// instead of looking it up again in GET.
export const getStaticPaths = (() =>
  demoEntries
    .filter((entry) => entry.kind === "image")
    .map((entry) => ({
      params: { id: entry.id },
      props: { entry },
    }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: DemoImageEntry }> = ({ props }) =>
  new Response(new Uint8Array(props.entry.bytes), {
    headers: { "Content-Type": "image/png" },
  });
