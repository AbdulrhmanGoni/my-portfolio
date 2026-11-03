// Boot sequence: the fake kernel log on first visit.

import { bootLog, bootScreen, reducedMotion } from "./dom";

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

export async function playBoot() {
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
