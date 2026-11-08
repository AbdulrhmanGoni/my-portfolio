import { commandInput, commandOutput, contentPane } from "./dom";
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
    setOutput(result.output);
    commandInput.value = "";

    // Each command declares where focus belongs: shell-like commands keep the
    // caret in the prompt, navigation commands move to the content pane, and
    // the manual focuses itself when it opens.
    switch (result.focus) {
      case "pane":
        contentPane?.focus({ preventScroll: true });
        break;
      case "dialog":
        break;
      default:
        commandInput.focus({ preventScroll: true });
        break;
    }
  });
}
