import { commandInput, commandOutput, contentPane, helpDialog } from "./dom";
import { runCommand } from "./commands";

function setOutput(message: string) {
  if (commandOutput) {
    commandOutput.textContent = message;
    commandOutput.classList.toggle("command-output-empty", !message)
  }
}

export function wireCommandBar() {
  const form = document.getElementById("command-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!commandInput) return;
    const result = runCommand(commandInput.value);
    setOutput(result);
    commandInput.value = "";
    // Keep focus inside the window so keyboard shortcuts stay active; the
    // manual keeps its own focus if it was opened by this command.
    if (!helpDialog?.open) contentPane?.focus({ preventScroll: true });
  });
}
