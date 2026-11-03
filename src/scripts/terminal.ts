import { LINKS } from "../data/links";

const bootScreen = document.getElementById("boot-screen");
const bootLog = document.getElementById("boot-log");
const terminal = document.getElementById("terminal-window");
const desktop = terminal?.parentElement as HTMLElement | null;
const contentPane = document.getElementById("content-pane");
const commandInput = document.getElementById("command-input") as HTMLInputElement | null;
const commandOutput = document.getElementById("command-output");
const helpDialog = document.getElementById("help-dialog") as HTMLDialogElement | null;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compactQuery = window.matchMedia("(min-width: 769px) and (min-height: 620px)");

const MIN_WINDOW_WIDTH = 360;
const MIN_WINDOW_HEIGHT = 280;

type TerminalGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type SavedGeometry = {
  left: number;
  top: number;
  width?: number;
  height?: number;
};

let positionPinnedByUser = false;
let preMinimizeGeometry: SavedGeometry | null = null;

function getTerminalGeometry(): TerminalGeometry | null {
  if (!terminal || !desktop) return null;
  const rect = terminal.getBoundingClientRect();
  const bounds = desktop.getBoundingClientRect();
  return {
    left: rect.left - bounds.left,
    top: rect.top - bounds.top,
    width: rect.width,
    height: rect.height,
  };
}

function applyTerminalGeometry(left: number, top: number, width: number, height: number) {
  if (!terminal || !desktop) return;
  const bounds = desktop.getBoundingClientRect();
  const minWidth = Math.min(MIN_WINDOW_WIDTH, bounds.width);
  const minHeight = Math.min(MIN_WINDOW_HEIGHT, bounds.height);
  const nextWidth = Math.min(Math.max(width, minWidth), bounds.width);
  const nextHeight = Math.min(Math.max(height, minHeight), bounds.height);
  const nextLeft = Math.min(Math.max(left, 0), Math.max(0, bounds.width - nextWidth));
  const nextTop = Math.min(Math.max(top, 0), Math.max(0, bounds.height - nextHeight));

  terminal.style.left = `${Math.round(nextLeft)}px`;
  terminal.style.top = `${Math.round(nextTop)}px`;
  terminal.style.width = `${Math.round(nextWidth)}px`;
  terminal.style.height = `${Math.round(nextHeight)}px`;
}

function setTerminalPosition(left: number, top: number) {
  if (!terminal || !desktop) return;
  const bounds = desktop.getBoundingClientRect();
  const maxLeft = Math.max(0, bounds.width - terminal.offsetWidth);
  const maxTop = Math.max(0, bounds.height - terminal.offsetHeight);
  terminal.style.left = `${Math.round(Math.min(Math.max(left, 0), maxLeft))}px`;
  terminal.style.top = `${Math.round(Math.min(Math.max(top, 0), maxTop))}px`;
}

function centerTerminal() {
  if (!terminal || !desktop) return;
  const bounds = desktop.getBoundingClientRect();
  setTerminalPosition(
    (bounds.width - terminal.offsetWidth) / 2,
    (bounds.height - terminal.offsetHeight) / 2,
  );
  positionPinnedByUser = false;
}

function resetTerminalGeometry() {
  terminal?.style.removeProperty("left");
  terminal?.style.removeProperty("top");
  terminal?.style.removeProperty("width");
  terminal?.style.removeProperty("height");
  positionPinnedByUser = false;
}

function clampTerminalPosition() {
  if (!terminal || !desktop) return;
  if (terminal.classList.contains("is-minimized") && !positionPinnedByUser) {
    centerTerminal();
    return;
  }
  if (terminal.style.width || terminal.style.height) {
    const geometry = getTerminalGeometry();
    if (!geometry) return;
    applyTerminalGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
    return;
  }
  if (!terminal.style.left && !terminal.style.top) return;
  setTerminalPosition(
    Number.parseFloat(terminal.style.left) || 0,
    Number.parseFloat(terminal.style.top) || 0,
  );
}

function minimizeTerminal() {
  if (!terminal) return;
  const geometry = getTerminalGeometry();
  const hasCustomSize = Boolean(terminal.style.width || terminal.style.height);
  const hasCustomPosition = Boolean(terminal.style.left || terminal.style.top);

  preMinimizeGeometry =
    hasCustomSize && geometry
      ? geometry
      : hasCustomPosition && geometry
        ? { left: geometry.left, top: geometry.top }
        : null;

  resetTerminalGeometry();
  terminal.classList.add("is-minimized");
  centerTerminal();
}

function restoreTerminal() {
  if (!terminal) return;
  terminal.classList.remove("is-minimized");

  const geometry = preMinimizeGeometry;
  preMinimizeGeometry = null;

  if (!geometry) {
    resetTerminalGeometry();
    return;
  }

  if (geometry.width !== undefined && geometry.height !== undefined) {
    applyTerminalGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
  } else {
    setTerminalPosition(geometry.left, geometry.top);
  }
  positionPinnedByUser = true;
}

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
  if (commandOutput) {
    commandOutput.textContent = message;
    commandOutput.classList.toggle("command-output-empty", !message)
  }
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

function wireWindowDrag() {
  if (!terminal || !desktop) return;
  const titlebar = terminal.querySelector<HTMLElement>(".titlebar");
  if (!titlebar) return;

  let drag: {
    pointerId: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null = null;

  titlebar.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target;
    if (target instanceof Element && target.closest("button, a, input, textarea, select, .traffic, .resize-handle")) {
      return;
    }

    const termRect = terminal.getBoundingClientRect();
    const desktopRect = desktop.getBoundingClientRect();
    drag = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: termRect.left - desktopRect.left,
      startTop: termRect.top - desktopRect.top,
    };

    terminal.classList.add("is-dragging");
    titlebar.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  titlebar.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    positionPinnedByUser = true;
    setTerminalPosition(
      drag.startLeft + (e.clientX - drag.startX),
      drag.startTop + (e.clientY - drag.startY),
    );
  });

  const endDrag = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag = null;
    terminal.classList.remove("is-dragging");
    if (titlebar.hasPointerCapture(e.pointerId)) {
      titlebar.releasePointerCapture(e.pointerId);
    }
  };

  titlebar.addEventListener("pointerup", endDrag);
  titlebar.addEventListener("pointercancel", endDrag);
  titlebar.addEventListener("lostpointercapture", () => {
    drag = null;
    terminal.classList.remove("is-dragging");
  });

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      clampTerminalPosition();
    });
  });
}

function wireWindowResize() {
  if (!terminal || !desktop) return;

  const handles = terminal.querySelectorAll<HTMLElement>(".resize-handle");
  if (!handles.length) return;

  type ResizeState = {
    pointerId: number;
    direction: string;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
    startHeight: number;
  };

  let resize: ResizeState | null = null;

  const beginResize = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const handle = e.currentTarget as HTMLElement;
    const direction = handle.dataset.resize;
    const geometry = getTerminalGeometry();
    if (!direction || !geometry) return;

    if (terminal.classList.contains("is-minimized")) {
      terminal.classList.remove("is-minimized");
      document.getElementById("traffic-min")?.setAttribute("aria-pressed", "false");
      preMinimizeGeometry = null;
    }

    // Take ownership of the current size/position so the CSS defaults (and
    // the compact minimized size) can no longer affect the window.
    applyTerminalGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
    positionPinnedByUser = true;

    resize = {
      pointerId: e.pointerId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: geometry.left,
      startTop: geometry.top,
      startWidth: geometry.width,
      startHeight: geometry.height,
    };

    terminal.classList.add("is-resizing");
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const updateResize = (e: PointerEvent) => {
    if (!resize || e.pointerId !== resize.pointerId) return;

    const bounds = desktop.getBoundingClientRect();
    const dx = e.clientX - resize.startX;
    const dy = e.clientY - resize.startY;
    const minWidth = Math.min(MIN_WINDOW_WIDTH, bounds.width);
    const minHeight = Math.min(MIN_WINDOW_HEIGHT, bounds.height);
    const { direction } = resize;

    let left = resize.startLeft;
    let top = resize.startTop;
    let width = resize.startWidth;
    let height = resize.startHeight;

    if (direction.includes("w")) {
      left = Math.min(Math.max(left + dx, 0), resize.startLeft + resize.startWidth - minWidth);
      width = resize.startLeft + resize.startWidth - left;
    } else if (direction.includes("e")) {
      width = Math.min(Math.max(width + dx, minWidth), bounds.width - left);
    }

    if (direction.includes("n")) {
      top = Math.min(Math.max(top + dy, 0), resize.startTop + resize.startHeight - minHeight);
      height = resize.startTop + resize.startHeight - top;
    } else if (direction.includes("s")) {
      height = Math.min(Math.max(height + dy, minHeight), bounds.height - top);
    }

    applyTerminalGeometry(left, top, width, height);
  };

  const endResize = (e: PointerEvent) => {
    if (!resize || e.pointerId !== resize.pointerId) return;
    const handle = e.currentTarget as HTMLElement | null;
    resize = null;
    terminal.classList.remove("is-resizing");
    if (handle?.hasPointerCapture(e.pointerId)) {
      handle.releasePointerCapture(e.pointerId);
    }
  };

  handles.forEach((handle) => {
    handle.addEventListener("pointerdown", beginResize);
    handle.addEventListener("pointermove", updateResize);
    handle.addEventListener("pointerup", endResize);
    handle.addEventListener("pointercancel", endResize);
    handle.addEventListener("lostpointercapture", () => {
      resize = null;
      terminal.classList.remove("is-resizing");
    });
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
      resetTerminalGeometry();
      preMinimizeGeometry = null;
      minBtn?.setAttribute("aria-pressed", "false");
    }
  };

  minBtn?.addEventListener("click", () => {
    if (!compactQuery.matches || !terminal) return;
    const shouldMinimize = !terminal.classList.contains("is-minimized");
    if (shouldMinimize) {
      minimizeTerminal();
    } else {
      restoreTerminal();
    }
    minBtn.setAttribute("aria-pressed", String(shouldMinimize));
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
wireWindowDrag();
wireWindowResize();
wireTraffic();
wireHashLinks();
