import { getAppWindow } from "../windows";
import { playBoot } from "./boot";
import { wireCommandBar } from "./command-bar";
import { contentPane, helpDialog } from "./dom";
import { wireHelpDialog } from "./help";
import { wireKeyboard } from "./keyboard";
import { wireHashLinks } from "./navigation";

const terminalWindow = getAppWindow("terminal");

// Clicking the window focuses the content pane, unless the manual is open — in
// which case the dialog keeps its own focus. Restoring the window focuses the
// manual if it is still open, otherwise the content pane.
terminalWindow?.setFocusTarget(() => (helpDialog?.open ? null : contentPane));
terminalWindow?.setRestoreFocusTarget(() => (helpDialog?.open ? helpDialog : contentPane));

playBoot();
wireCommandBar();
wireKeyboard(terminalWindow);
wireHelpDialog();
wireHashLinks();
