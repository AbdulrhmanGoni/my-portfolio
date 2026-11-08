import { LINKS } from "../../data/links";
import { closeHelpDialog, openHelpDialog } from "./help";
import { openExternal, scrollToId, scrollToTop } from "./navigation";

/**
 * Where focus should land after a command finishes. Keeping this on the result
 * means the command bar never has to guess: shell-like commands leave the
 * caret in the prompt, navigation commands hand focus to the content pane, and
 * the manual takes focus itself.
 */
export type CommandFocus = "prompt" | "pane" | "dialog";

export type CommandResult = {
  output: string;
  focus: CommandFocus;
};

const atPrompt = (output = ""): CommandResult => ({ output, focus: "prompt" });
const focusPane = (output = ""): CommandResult => ({ output, focus: "pane" });
const focusDialog = (output = ""): CommandResult => ({ output, focus: "dialog" });

export function runCommand(raw: string): CommandResult {
  const trimmed = raw.trim();
  if (!trimmed) return atPrompt();

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase().replace(/^:/, "");
  const args = parts.slice(1);
  const argStr = args.join(" ").toLowerCase();

  switch (cmd) {
    case "help":
    case "man":
    case "?":
      openHelpDialog();
      return focusDialog("opening manual — press Esc to close");
    case "whoami":
    case "about":
    case "home":
      scrollToId("home");
      return focusPane();
    case "projects":
    case "project":
      scrollToId("projects");
      return focusPane();
    case "skills":
    case "skill":
      scrollToId("skills");
      return focusPane();
    case "contact":
    case "mail":
      scrollToId("home");
      return focusPane(LINKS.emailAddress);
    case "email":
      openExternal(LINKS.email);
      return atPrompt(`opening mailto:${LINKS.emailAddress}`);
    case "github":
    case "gh":
      openExternal(LINKS.github);
      return atPrompt("opening github.com/abdulrhmangoni");
    case "linkedin":
      openExternal(LINKS.linkedin);
      return atPrompt("opening linkedin profile");
    case "ls":
      if (/project/.test(argStr) || argStr === "." || argStr === "./") {
        scrollToId("projects");
        return focusPane("denokv-gui-client\nmecha-agent\nllms-tdm\nam-store");
      }
      if (/skill/.test(argStr)) {
        scrollToId("skills");
        return focusPane();
      }
      return atPrompt("home.sh\nprojects/\nskills.json");
    case "cd": {
      const target = argStr.replace(/^~\//, "").replace(/^\.\//, "").replace(/\/$/, "");
      if (!target || target === "~" || target === "home") {
        scrollToId("home");
        return focusPane();
      }
      if (target.includes("project")) {
        scrollToId("projects");
        return focusPane();
      }
      if (target.includes("skill")) {
        scrollToId("skills");
        return focusPane();
      }
      return atPrompt(`cd: no such file or directory: ${args[0] ?? ""}`);
    }
    case "cat": {
      const file = argStr;
      if (!file || file.includes("home") || file.includes("about") || file.includes("readme")) {
        scrollToId("home");
        return focusPane("cat home.sh");
      }
      if (file.includes("skill")) {
        scrollToId("skills");
        return focusPane("cat skills.json");
      }
      if (file.includes("project")) {
        scrollToId("projects");
        return focusPane("cat projects/README");
      }
      return atPrompt(`cat: ${args[0]}: No such file or directory`);
    }
    case "clear":
    case "cls":
      closeHelpDialog();
      scrollToTop();
      return atPrompt();
    case "pwd":
      return atPrompt("/home/abdulrhman/portfolio");
    case "date":
      return atPrompt(new Date().toString());
    case "echo":
      return atPrompt(args.join(" ") || "");
    case "sudo":
      return atPrompt("abdulrhman is not in the sudoers file. This incident will be reported.");
    case "rm":
      return atPrompt("permission denied: the portfolio is write-protected.");
    case "exit":
    case "quit":
    case "q":
      return atPrompt("there is no exit. only more code. try 'help'.");
    default:
      return atPrompt(`command not found: ${cmd}. type 'help'.`);
  }
}
