import { LINKS } from "../data/links";

const bootScreen = document.getElementById("boot-screen");
const bootLog = document.getElementById("boot-log");
const terminal = document.getElementById("terminal-window");
const contentPane = document.getElementById("content-pane");
const commandInput = document.getElementById("command-input") as HTMLInputElement | null;
const commandOutput = document.getElementById("command-output");
const helpDialog = document.getElementById("help-dialog") as HTMLDialogElement | null;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compactQuery = window.matchMedia("(min-width: 769px) and (min-height: 620px)");

function alreadyBooted() {
  return sessionStorage.getItem("portfolio-booted") === "1";
}

function markBooted() {
  sessionStorage.setItem("portfolio-booted", "1");
  document.documentElement.classList.add("booted");
  bootScreen?.setAttribute("hidden", "");
}

const bootLines = [
  "ABDULRHMAN-OS kernel 7.0.0-38-generic (tty1)",
  "",
  "* Mounting /home/abdulrhman...",
  "* Mounted /home/abdulrhman.                    [  OK  ]",
  "* Loading profile...",
  "* Loaded profile.                              [  OK  ]",
  "* Indexing ~/projects...",
  "* Indexed ~/projects.                          [  OK  ]",
  "* Starting display server...",
  "* Started display server.                      [  OK  ]",
  "",
  "$ ssh abdulrhman@portfolio",
  "Authenticated. Type 'help' or press ? for the manual.",
];

async function playBoot() {
  if (!bootScreen || !bootLog) {
    markBooted();
    return;
  }
  if (reducedMotion || alreadyBooted()) {
    markBooted();
    return;
  }

  bootLog.textContent = "";
  const skip = () => markBooted();
  bootScreen.addEventListener("click", skip, { once: true });
  window.addEventListener("keydown", skip, { once: true });

  for (const line of bootLines) {
    if (document.documentElement.classList.contains("booted")) return;
    bootLog.textContent += line + "\n";
    await new Promise((r) => setTimeout(r, 110));
  }
  await new Promise((r) => setTimeout(r, 450));
  markBooted();
}

function setOutput(message: string) {
  if (!commandOutput) return;
  commandOutput.textContent = message;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function runCommand(raw: string): string {
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
    case "neofetch":
    case "home":
      scrollToId("home");
      return "abdulrhman";
    case "projects":
    case "project":
      scrollToId("projects");
      return "listing ~/projects";
    case "skills":
    case "skill":
      scrollToId("skills");
      return "reading skills.json";
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
        return "denokv-gui-client  mecha-agent  llms-tdm  am-store";
      }
      if (/skill/.test(argStr)) {
        scrollToId("skills");
        return "languages  backend  databases  frontend";
      }
      return "home.sh  projects/  skills.json";
    case "cd": {
      const target = argStr.replace(/^~\//, "").replace(/^\.\//, "").replace(/\/$/, "");
      if (!target || target === "~" || target === "home") {
        scrollToId("home");
        return "~/home.sh";
      }
      if (target.includes("project")) {
        scrollToId("projects");
        return "~/projects/";
      }
      if (target.includes("skill")) {
        scrollToId("skills");
        return "~/skills.json";
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
      helpDialog?.close();
      contentPane?.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
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
    case "vim":
    case "nvim":
    case "vi":
    case "nano":
    case "emacs":
      return "you are already inside the editor. press ? for help.";
    case "exit":
    case "quit":
    case "q":
      return "there is no exit. only more code. try 'help'.";
    default:
      return `command not found: ${cmd}. type 'help'.`;
  }
}

function wireCommandBar() {
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

function wireKeyboard() {
  window.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement | null;
    const typing =
      target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

    if (e.key === "Escape") {
      helpDialog?.close();
      commandInput?.blur();
      return;
    }

    if (typing) return;

    if (e.key === "/" || e.key === ":") {
      e.preventDefault();
      commandInput?.focus();
      return;
    }

    if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      openHelpDialog();
      return;
    }

    if (e.key === "1") scrollToId("home");
    if (e.key === "2") scrollToId("projects");
    if (e.key === "3") scrollToId("skills");
  });
}

function wireHashLinks() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href")?.slice(1);
      if (!id) return;
      if (id === "content-pane") {
        contentPane?.focus();
        return;
      }
      e.preventDefault();
      scrollToId(id);
      history.replaceState(null, "", `#${id}`);
    });
  });

  const initial = window.location.hash.replace("#", "");
  if (initial) {
    requestAnimationFrame(() => scrollToId(initial));
  }
}

function openHelpDialog() {
  if (!helpDialog || helpDialog.open) return;
  helpDialog.showModal();
  // showModal() moves focus to the first focusable element (the close
  // button). Focus the dialog itself instead so nothing looks selected
  // when it opens; Tab still reaches the button.
  helpDialog.focus();
}

function wireHelpDialog() {
  if (!helpDialog) return;

  // Native <dialog> only closes on Esc by default — treat clicks on the
  // backdrop (outside the dialog box) as a close request too.
  helpDialog.addEventListener("click", (e) => {
    if (e.target !== helpDialog) return;
    const rect = helpDialog.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inside) helpDialog.close();
  });
}

function wireTraffic() {
  const minBtn = document.getElementById("traffic-min");

  const syncMinAvailability = () => {
    const available = compactQuery.matches;
    minBtn?.classList.toggle("is-unavailable", !available);
    minBtn?.setAttribute("aria-disabled", String(!available));
    if (minBtn) {
      minBtn.title = available ? "minimize" : "minimize (unavailable on small screens)";
    }
    if (!available) {
      terminal?.classList.remove("is-minimized");
      minBtn?.setAttribute("aria-pressed", "false");
    }
  };

  minBtn?.addEventListener("click", () => {
    if (!compactQuery.matches) return;
    const minimized = terminal?.classList.toggle("is-minimized") ?? false;
    minBtn.setAttribute("aria-pressed", String(minimized));
  });

  compactQuery.addEventListener("change", syncMinAvailability);
  syncMinAvailability();

  document.getElementById("traffic-max")?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch { }
  });
}

playBoot();
wireCommandBar();
wireKeyboard();
wireHelpDialog();
wireTraffic();
wireHashLinks();
