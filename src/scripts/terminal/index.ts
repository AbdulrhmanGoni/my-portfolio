import { playBoot } from "./boot";
import { wireCommandBar } from "./command-bar";
import { wireViewportClamp } from "./geometry";
import { wireHelpDialog } from "./help";
import { wireKeyboard } from "./keyboard";
import { wireHashLinks } from "./navigation";
import { wireTraffic } from "./traffic";
import { wireWindowDrag } from "./window-drag";
import { wireWindowResize } from "./window-resize";

playBoot();
wireCommandBar();
wireKeyboard();
wireHelpDialog();
wireWindowDrag();
wireWindowResize();
wireTraffic();
wireHashLinks();
wireViewportClamp();
