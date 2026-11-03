import { commandInput, commandOutput } from "./dom";
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
    commandInput.blur();
  });
}
