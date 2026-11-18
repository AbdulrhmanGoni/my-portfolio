// Shared update-check state for the denokv-gui-client window.
//
// The header dot, the settings section and anything else that needs to know
// about an available update read this one store, so a check started by the
// automatic background check shows up everywhere at once.

import type { DenokvReleaseInfo } from "./release-info";
import { fetchLatestRelease, type UpdateCheckResult } from "./release-check";

type UpdateState = {
  checking: boolean;
  result: UpdateCheckResult | null;
  errorMessage: string;
};

export const updateState = $state<UpdateState>({
  checking: false,
  result: null,
  errorMessage: "",
});

let activeController: AbortController | null = null;
let activeRequest: Promise<void> | null = null;

export async function checkForUpdates(
  releaseInfo: DenokvReleaseInfo,
  options: { force?: boolean } = {},
): Promise<void> {
  if (activeRequest) return activeRequest;

  const controller = new AbortController();

  activeController = controller;
  updateState.checking = true;
  updateState.errorMessage = "";

  activeRequest = (async () => {
    try {
      const result = await fetchLatestRelease(
        releaseInfo.app.version,
        releaseInfo.app.repository,
        { signal: controller.signal, force: options.force },
      );

      updateState.result = result;
    } catch (error) {
      if (controller.signal.aborted) return;

      updateState.errorMessage =
        error instanceof Error ? error.message : String(error);
    } finally {
      if (activeController === controller) {
        activeController = null;
        activeRequest = null;
        updateState.checking = false;
      }
    }
  })();

  return activeRequest;
}

export function cancelUpdateCheck(): void {
  activeController?.abort();
  activeController = null;
  activeRequest = null;
  updateState.checking = false;
}
