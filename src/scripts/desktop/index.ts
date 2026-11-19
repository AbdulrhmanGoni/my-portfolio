import { initAppWindows } from "../windows";
import { wireEmbeddedApps } from "../windows/embedded-app";
import { wireSidebar } from "./sidebar";

initAppWindows();
wireSidebar();
wireEmbeddedApps();

const clock = document.querySelector("[data-clock]");
const updateClock = () =>
  clock &&
  (clock.textContent = new Date()
    .toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    .replace(/,/g, ""));

updateClock();
setInterval(updateClock, 60_000 - (Date.now() % 60_000));
