// References to every element the terminal interacts with, plus the
// environment flags and size constants shared by the other modules.

export const bootScreen = document.getElementById("boot-screen");
export const bootLog = document.getElementById("boot-log");
export const terminal = document.getElementById("terminal-window");
export const desktop = terminal?.parentElement as HTMLElement | null;
export const contentPane = document.getElementById("content-pane");
export const commandInput = document.getElementById("command-input") as HTMLInputElement | null;
export const commandOutput = document.getElementById("command-output");
export const helpDialog = document.getElementById("help-dialog") as HTMLDialogElement | null;
export const trafficMin = document.getElementById("traffic-min");
export const trafficMax = document.getElementById("traffic-max");

/** True when the user prefers reduced motion. */
export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Viewport is large enough for the compact (minimized) window mode. */
export const compactQuery = window.matchMedia("(min-width: 769px) and (min-height: 620px)");

export const MIN_WINDOW_WIDTH = 360;
export const MIN_WINDOW_HEIGHT = 280;
