export {
  AppWindow,
  DEFAULT_MIN_WINDOW_HEIGHT,
  DEFAULT_MIN_WINDOW_WIDTH,
  smallScreenQuery,
  type AppWindowOptions,
  type WindowGeometry,
  type WindowState,
} from "./app-window";

export {
  activateWindow,
  createAppWindow,
  disposeAppWindow,
  getActiveAppWindow,
  getAppWindow,
  initAppWindows,
  openAppWindow,
  registerAppWindowFactory,
} from "./registry";

export { createAppWindowFromTemplate } from "./template";
