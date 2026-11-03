import { LINKS } from "../../data/links";
import { closeHelpDialog, openHelpDialog } from "./help";
import { openExternal, scrollToId, scrollToTop } from "./navigation";

export function runCommand(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase().replace(/^:/, "");
  const args = parts.slice(1);
  const argStr = args.join(" ").toLowerCase();

  switch (cmd) {
    case "help":
    case "man":
    case "?":
      openHelpDialog();
      return "opening manual — press Esc to close";
    case "whoami":
    case "about":
    case "home":
      scrollToId("home");
      return "";
    case "projects":
    case "project":
      scrollToId("projects");
      return "";
    case "skills":
    case "skill":
      scrollToId("skills");
      return "";
    case "contact":
    case "mail":
      scrollToId("home");
      return LINKS.emailAddress;
    case "email":
      openExternal(LINKS.email);
      return `opening mailto:${LINKS.emailAddress}`;
    case "github":
    case "gh":
      openExternal(LINKS.github);
      return "opening github.com/abdulrhmangoni";
    case "linkedin":
      openExternal(LINKS.linkedin);
      return "opening linkedin profile";
    case "ls":
      if (/project/.test(argStr) || argStr === "." || argStr === "./") {
        scrollToId("projects");
        return "denokv-gui-client\nmecha-agent\nllms-tdm\nam-store";
      }
      if (/skill/.test(argStr)) {
        scrollToId("skills");
        return "";
      }
      return "home.sh\nprojects/\nskills.json";
    case "cd": {
      const target = argStr.replace(/^~\//, "").replace(/^\.\//, "").replace(/\/$/, "");
      if (!target || target === "~" || target === "home") {
        scrollToId("home");
        return "";
      }
      if (target.includes("project")) {
        scrollToId("projects");
        return "";
      }
      if (target.includes("skill")) {
        scrollToId("skills");
        return "";
      }
      return `cd: no such file or directory: ${args[0] ?? ""}`;
    }
    case "cat": {
      const file = argStr;
      if (!file || file.includes("home") || file.includes("about") || file.includes("readme")) {
        scrollToId("home");
        return "cat home.sh";
      }
      if (file.includes("skill")) {
        scrollToId("skills");
        return "cat skills.json";
      }
      if (file.includes("project")) {
        scrollToId("projects");
        return "cat projects/README";
      }
      return `cat: ${args[0]}: No such file or directory`;
    }
    case "clear":
    case "cls":
      closeHelpDialog();
      scrollToTop();
      return "";
    case "pwd":
      return "/home/abdulrhman/portfolio";
    case "date":
      return new Date().toString();
    case "echo":
      return args.join(" ") || "";
    case "sudo":
      return "abdulrhman is not in the sudoers file. This incident will be reported.";
    case "rm":
      return "permission denied: the portfolio is write-protected.";
    case "exit":
    case "quit":
    case "q":
      return "there is no exit. only more code. try 'help'.";
    default:
      return `command not found: ${cmd}. type 'help'.`;
  }
}
