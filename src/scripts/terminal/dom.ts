// References to every terminal-content element the terminal interacts with,
// plus environment flags shared by its modules. Window mechanics live in
// ../windows and are looked up per app.

export const bootScreen = document.getElementById("boot-screen");
export const bootLog = document.getElementById("boot-log");
export const contentPane = document.getElementById("content-pane");
export const commandBar = document.querySelector<HTMLElement>(".command-bar");
export const commandInput = document.getElementById("command-input") as HTMLInputElement | null;
export const commandOutput = document.getElementById("command-output");
export const helpDialog = document.getElementById("help-dialog") as HTMLDialogElement | null;

/** True when the user prefers reduced motion. */
export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
