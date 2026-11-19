// A single desktop application window: positioning, sizing, dragging,
// resizing, minimizing, maximizing, and focus/activation state.
//
// Each instance owns its own state, so multiple windows can coexist on the
// desktop. Application-specific behavior (shortcuts, commands, dialogs) lives
// in the application's own modules and talks to this class through the
// registry.

export const DEFAULT_MIN_WINDOW_WIDTH = 360;
export const DEFAULT_MIN_WINDOW_HEIGHT = 280;

/**
 * Matches the breakpoint where the sidebar is hidden and every window goes
 * full-bleed. Keep in sync with the viewport rules in main.css.
 */
export const smallScreenQuery = window.matchMedia("(max-width: 768px)");

export type WindowGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type WindowState = {
  maximized: boolean;
  minimized: boolean;
  active: boolean;
};

export type AppWindowOptions = {
  id: string;
  root: HTMLElement;
  desktop: HTMLElement;
  dock?: HTMLElement | null;
  minWidth?: number;
  minHeight?: number;
  draggable?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  /** Internal hook used by the registry to update stacking/active state. */
  onActivate?: (window: AppWindow) => void;
  /** Internal hook used by the registry to keep dock focus state in sync. */
  onMinimizeChange?: (window: AppWindow, minimized: boolean) => void;
  /** Internal hook used by the registry when the window is disposed. */
  onDispose?: (window: AppWindow) => void;
};

type PointerDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
};

type PointerResize = {
  pointerId: number;
  direction: string;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  startWidth: number;
  startHeight: number;
};

export class AppWindow {
  readonly id: string;
  readonly root: HTMLElement;
  readonly desktop: HTMLElement;
  readonly dock: HTMLElement | null;

  private readonly options: AppWindowOptions;
  private readonly minWidth: number;
  private readonly minHeight: number;
  private readonly draggable: boolean;
  private readonly resizable: boolean;
  private readonly minimizable: boolean;
  private readonly maximizable: boolean;
  private readonly closable: boolean;

  private readonly titlebar: HTMLElement | null;
  private readonly resizeHandles: HTMLElement[];
  private readonly closeButton: HTMLButtonElement | null;
  private readonly minButton: HTMLButtonElement | null;
  private readonly maxButton: HTMLButtonElement | null;

  private readonly cleanups: Array<() => void> = [];
  private readonly stateListeners = new Set<(state: WindowState) => void>();

  private focusTarget: (() => HTMLElement | null) | null = null;
  private restoreFocusTarget: (() => HTMLElement | null) | null = null;
  private maximized = false;
  private minimized = false;
  private active = false;
  private disposed = false;
  private preMaximizeGeometry: WindowGeometry | null = null;

  constructor(options: AppWindowOptions) {
    this.options = options;
    this.id = options.id;
    this.root = options.root;
    this.desktop = options.desktop;
    this.dock = options.dock ?? null;

    this.minWidth = options.minWidth ?? DEFAULT_MIN_WINDOW_WIDTH;
    this.minHeight = options.minHeight ?? DEFAULT_MIN_WINDOW_HEIGHT;
    this.draggable = options.draggable !== false;
    this.resizable = options.resizable !== false;
    this.minimizable = options.minimizable !== false && Boolean(this.dock);
    this.maximizable = options.maximizable !== false;
    this.closable = options.closable !== false;

    this.titlebar = this.root.querySelector<HTMLElement>(".titlebar");
    this.resizeHandles = Array.from(
      this.root.querySelectorAll<HTMLElement>(".resize-handle"),
    );
    this.closeButton = this.root.querySelector<HTMLButtonElement>(
      '[data-window-action="close"]',
    );
    this.minButton = this.root.querySelector<HTMLButtonElement>(
      '[data-window-action="minimize"]',
    );
    this.maxButton = this.root.querySelector<HTMLButtonElement>(
      '[data-window-action="maximize"]',
    );

    this.wireActivation();
    this.wireEmbeddedFrameActivation();
    this.wireDrag();
    this.wireResize();
    this.wireControls();
    this.syncControls();
  }

  get isMaximized(): boolean {
    return this.maximized;
  }

  get isMinimized(): boolean {
    return this.minimized;
  }

  get isActive(): boolean {
    return this.active;
  }

  /** Mark this window as the active one. Used by the registry. */
  setActive(value: boolean): void {
    if (this.active === value) return;
    this.active = value;
    this.root.classList.toggle("is-active", value);
    this.emitState();
  }

  /** Ask the registry to bring this window to the front. */
  activate(): void {
    if (this.minimized) return;
    this.options.onActivate?.(this);
  }

  /**
   * Move keyboard focus into the window's content. Applications that want
   * focus to land somewhere specific set a focus target first.
   */
  focus(): void {
    this.focusContent(true);
  }

  minimize(): void {
    if (this.minimized || !this.minimizable || smallScreenQuery.matches) return;

    const dock = this.dock;
    if (!dock) return;

    const origin = this.getDockOrigin(dock);
    if (!origin) return;

    // transform-origin is relative to the window's own border box; anchor it
    // to the dock icon's center so the window collapses into the dock.
    this.root.style.transformOrigin = `${origin.x.toFixed(2)}px ${origin.y.toFixed(2)}px`;
    this.root.style.transform = "scale(0)";
    this.minimized = true;

    // Move focus out before hiding the window from assistive technology.
    dock.focus();
    this.root.setAttribute("inert", "");
    this.root.setAttribute("aria-hidden", "true");

    this.syncControls();
    this.emitState();
    this.options.onMinimizeChange?.(this, true);
  }

  restore(): void {
    if (!this.minimized) return;

    this.minimized = false;
    this.root.removeAttribute("aria-hidden");
    this.root.removeAttribute("inert");

    // Bring the window back inside the current viewport before revealing it.
    this.clampToDesktop();

    // Clamping may have moved the window while it was invisible, so re-anchor
    // the grow animation to the dock icon.
    if (this.dock) {
      const origin = this.getDockOrigin(this.dock);
      if (origin) {
        this.root.style.transformOrigin = `${origin.x.toFixed(2)}px ${origin.y.toFixed(2)}px`;
      }
    }

    this.root.style.transform = "scale(1)";
    this.syncControls();
    this.activate();
    this.focusContent(false, true);
    this.emitState();
    this.options.onMinimizeChange?.(this, false);
  }

  maximize(): void {
    if (!this.maximizable || this.maximized || this.minimized) return;

    this.preMaximizeGeometry = this.getGeometry();

    // Drop the inline size/position so the maximize CSS rule can take over
    // (and keep filling the desktop as the viewport changes).
    this.root.style.removeProperty("left");
    this.root.style.removeProperty("top");
    this.root.style.removeProperty("width");
    this.root.style.removeProperty("height");

    this.maximized = true;
    this.root.classList.add("is-maximized");
    this.syncMaxControl();
    this.emitState();
  }

  unmaximize(): void {
    if (!this.maximized) return;

    const geometry = this.preMaximizeGeometry;
    this.clearMaximizeState();

    if (geometry) {
      this.applyGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
    } else {
      this.resetGeometry();
    }

    this.emitState();
  }

  toggleMaximize(): void {
    if (this.maximized) {
      this.unmaximize();
    } else {
      this.maximize();
    }
  }

  getGeometry(): WindowGeometry {
    const rect = this.root.getBoundingClientRect();
    const bounds = this.desktop.getBoundingClientRect();
    return {
      left: rect.left - bounds.left,
      top: rect.top - bounds.top,
      width: rect.width,
      height: rect.height,
    };
  }

  /**
   * Layout geometry that ignores CSS transforms, so it stays accurate while
   * the window is scaled to zero. `offsetParent` is the desktop, matching the
   * coordinate space used by `getGeometry`.
   */
  getLayoutGeometry(): WindowGeometry {
    return {
      left: this.root.offsetLeft,
      top: this.root.offsetTop,
      width: this.root.offsetWidth,
      height: this.root.offsetHeight,
    };
  }

  /**
   * Center of a dock icon expressed in the window's own border-box
   * coordinates. Uses layout offsets so it also works while scaled down.
   */
  getDockOrigin(icon: Element): { x: number; y: number } | null {
    const bounds = this.desktop.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    return {
      x: iconRect.left + iconRect.width / 2 - (bounds.left + this.root.offsetLeft),
      y: iconRect.top + iconRect.height / 2 - (bounds.top + this.root.offsetTop),
    };
  }

  applyGeometry(left: number, top: number, width: number, height: number): void {
    const bounds = this.desktop.getBoundingClientRect();
    const minWidth = Math.min(this.minWidth, bounds.width);
    const minHeight = Math.min(this.minHeight, bounds.height);
    const nextWidth = Math.min(Math.max(width, minWidth), bounds.width);
    const nextHeight = Math.min(Math.max(height, minHeight), bounds.height);
    const nextLeft = Math.min(Math.max(left, 0), Math.max(0, bounds.width - nextWidth));
    const nextTop = Math.min(Math.max(top, 0), Math.max(0, bounds.height - nextHeight));

    this.root.style.left = `${Math.round(nextLeft)}px`;
    this.root.style.top = `${Math.round(nextTop)}px`;
    this.root.style.width = `${Math.round(nextWidth)}px`;
    this.root.style.height = `${Math.round(nextHeight)}px`;
  }

  setPosition(left: number, top: number): void {
    const bounds = this.desktop.getBoundingClientRect();
    const maxLeft = Math.max(0, bounds.width - this.root.offsetWidth);
    const maxTop = Math.max(0, bounds.height - this.root.offsetHeight);
    this.root.style.left = `${Math.round(Math.min(Math.max(left, 0), maxLeft))}px`;
    this.root.style.top = `${Math.round(Math.min(Math.max(top, 0), maxTop))}px`;
  }

  /** Keep the window inside the desktop, preserving its size when possible. */
  clampToDesktop(): void {
    // The maximize rule keeps the window at 100% of the desktop, so there is
    // nothing to clamp while it is active.
    if (this.maximized) return;

    if (this.root.style.width || this.root.style.height) {
      // Measure the layout box, not the transformed rect: a minimized window
      // is scaled to zero, and clamping that would overwrite real geometry.
      const geometry = this.getLayoutGeometry();
      this.applyGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
      return;
    }

    if (!this.root.style.left && !this.root.style.top) return;
    this.setPosition(
      Number.parseFloat(this.root.style.left) || 0,
      Number.parseFloat(this.root.style.top) || 0,
    );
  }

  resetGeometry(): void {
    this.root.style.removeProperty("left");
    this.root.style.removeProperty("top");
    this.root.style.removeProperty("width");
    this.root.style.removeProperty("height");
    this.clearMaximizeState();
  }

  /**
   * Where focus should go when the window is clicked. Return null to leave
   * focus where it is — use this while a modal is open, so the window does
   * not steal focus from it.
   */
  setFocusTarget(target: () => HTMLElement | null): void {
    this.focusTarget = target;
  }

  /**
   * Where focus should go when the window is unminimized. Falls back to the
   * click focus target when omitted. Return null to leave focus where it is.
   */
  setRestoreFocusTarget(target: () => HTMLElement | null): void {
    this.restoreFocusTarget = target;
  }

  /**
   * Register a keyboard shortcut handler scoped to this window. The handler is
   * skipped while the window is minimized (and inert).
   */
  onKeydown(handler: (event: KeyboardEvent) => void): () => void {
    return this.listen<KeyboardEvent>(this.root, "keydown", (event) => {
      if (this.minimized) return;
      handler(event);
    });
  }

  onStateChange(handler: (state: WindowState) => void): () => void {
    this.stateListeners.add(handler);
    return () => {
      this.stateListeners.delete(handler);
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // Return focus to the launcher before the focused element disappears.
    if (this.active || this.root.contains(document.activeElement)) {
      this.dock?.focus();
    }
    this.dock?.setAttribute("aria-expanded", "false");

    for (const cleanup of this.cleanups.splice(0)) cleanup();
    this.stateListeners.clear();

    // Removing the window also removes any embedded iframes, which destroys
    // their browsing contexts and releases the application's JS/DOM memory.
    this.root.remove();

    this.options.onDispose?.(this);
  }

  private clearMaximizeState(): void {
    this.maximized = false;
    this.preMaximizeGeometry = null;
    this.root.classList.remove("is-maximized");
    this.syncMaxControl();
  }

  private focusContent(preventScroll = false, restoring = false): void {
    // A restore target that resolves to null means "focus nothing" and must
    // not fall through to the click target. Only an omitted restore target
    // falls back to the click target.
    const target =
      restoring && this.restoreFocusTarget
        ? this.restoreFocusTarget()
        : this.focusTarget?.() ?? null;
    target?.focus({ preventScroll });
  }

  private wireControls(): void {
    if (this.closeButton) {
      if (this.closable) {
        this.listen(this.closeButton, "click", () => this.dispose());
      } else {
        this.closeButton.hidden = true;
      }
    }

    if (this.minButton) {
      this.minButton.hidden = !this.minimizable;
      if (this.minimizable) {
        this.listen(this.minButton, "click", () => this.minimize());
      }
    }

    if (this.maxButton) {
      this.maxButton.hidden = !this.maximizable;
      if (this.maximizable) {
        this.listen(this.maxButton, "click", () => this.toggleMaximize());
      }
    }
  }

  private syncControls(): void {
    this.syncMinControl();
    this.syncMaxControl();
    this.dock?.setAttribute("aria-expanded", String(!this.minimized));
  }

  private syncMinControl(): void {
    this.minButton?.setAttribute("aria-pressed", String(this.minimized));
  }

  private syncMaxControl(): void {
    if (!this.maxButton) return;
    this.maxButton.setAttribute("aria-pressed", String(this.maximized));
    this.maxButton.title = this.maximized ? "restore" : "maximize";
    this.maxButton.setAttribute("aria-label", this.maximized ? "Restore" : "Maximize");
  }

  private emitState(): void {
    const state: WindowState = {
      maximized: this.maximized,
      minimized: this.minimized,
      active: this.active,
    };
    for (const listener of this.stateListeners) listener(state);
  }

  private wireActivation(): void {
    this.listen<PointerEvent>(this.root, "pointerdown", (event) => {
      this.activate();
      if (this.minimized) return;

      // Interactive controls keep their own focus; the help dialog manages its
      // own focus while it is open, which the focus target can reflect.
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("button, a, input, textarea, select, [tabindex], .resize-handle")
      ) {
        return;
      }
      this.focusContent(true);
    });

    this.listen<FocusEvent>(this.root, "focusin", () => {
      this.activate();
    });
  }

  /**
   * Pointer events inside an iframe belong to the frame's own document and
   * never reach this one, and moving focus into a frame fires no focusin on
   * the frame element, so clicking embedded app content would not activate the
   * window. Bridge pointerdown from same-origin frames back to the window.
   * Cross-origin frames cannot be instrumented and are ignored.
   */
  private wireEmbeddedFrameActivation(): void {
    for (const frame of this.root.querySelectorAll<HTMLIFrameElement>("iframe")) {
      const bridgedDocuments = new WeakSet<Document>();
      let detachDocument: (() => void) | null = null;

      const bridge = () => {
        let frameDocument: Document | null = null;

        try {
          frameDocument = frame.contentDocument;
        } catch {
          return;
        }

        if (!frameDocument || bridgedDocuments.has(frameDocument)) return;
        bridgedDocuments.add(frameDocument);

        // Drop the listener on the previous document when the frame navigates.
        detachDocument?.();

        const onPointerDown = () => this.activate();
        frameDocument.addEventListener("pointerdown", onPointerDown, {
          capture: true,
        });
        detachDocument = () => {
          frameDocument.removeEventListener("pointerdown", onPointerDown, {
            capture: true,
          });
          detachDocument = null;
        };
      };

      // Navigation creates a fresh document and drops listeners on the old one.
      this.listen(frame, "load", bridge);
      // Do not leave a listener on the frame's document when the window is
      // disposed, even if the frame's browsing context is still alive.
      this.cleanups.push(() => detachDocument?.());
      bridge();
    }
  }

  private wireDrag(): void {
    const titlebar = this.titlebar;
    if (!titlebar || !this.draggable) return;

    let drag: PointerDrag | null = null;

    this.listen<PointerEvent>(titlebar, "pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (smallScreenQuery.matches) return;

      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(
          "button, a, input, textarea, select, [data-window-action], .window-controls, .resize-handle",
        )
      ) {
        return;
      }

      const rect = this.root.getBoundingClientRect();
      const bounds = this.desktop.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startLeft: rect.left - bounds.left,
        startTop: rect.top - bounds.top,
      };

      this.root.classList.add("is-dragging");
      titlebar.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    this.listen<PointerEvent>(titlebar, "pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      this.setPosition(
        drag.startLeft + (event.clientX - drag.startX),
        drag.startTop + (event.clientY - drag.startY),
      );
    });

    const endDrag = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      drag = null;
      this.root.classList.remove("is-dragging");
      if (titlebar.hasPointerCapture(event.pointerId)) {
        titlebar.releasePointerCapture(event.pointerId);
      }
    };

    this.listen<PointerEvent>(titlebar, "pointerup", endDrag);
    this.listen<PointerEvent>(titlebar, "pointercancel", endDrag);
    this.listen<PointerEvent>(titlebar, "lostpointercapture", () => {
      drag = null;
      this.root.classList.remove("is-dragging");
    });
  }

  private wireResize(): void {
    if (!this.resizable || this.resizeHandles.length === 0) return;

    let resize: PointerResize | null = null;

    const beginResize = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (smallScreenQuery.matches) return;

      const handle = event.currentTarget as HTMLElement;
      const direction = handle.dataset.resize;
      const geometry = this.getGeometry();
      if (!direction) return;

      // Take ownership of the current size/position so the CSS defaults can
      // no longer affect the window.
      this.applyGeometry(geometry.left, geometry.top, geometry.width, geometry.height);
      const wasMaximized = this.maximized;
      this.clearMaximizeState();
      if (wasMaximized) this.emitState();

      resize = {
        pointerId: event.pointerId,
        direction,
        startX: event.clientX,
        startY: event.clientY,
        startLeft: geometry.left,
        startTop: geometry.top,
        startWidth: geometry.width,
        startHeight: geometry.height,
      };

      this.root.classList.add("is-resizing");
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const updateResize = (event: PointerEvent) => {
      if (!resize || event.pointerId !== resize.pointerId) return;

      const bounds = this.desktop.getBoundingClientRect();
      const dx = event.clientX - resize.startX;
      const dy = event.clientY - resize.startY;
      const minWidth = Math.min(this.minWidth, bounds.width);
      const minHeight = Math.min(this.minHeight, bounds.height);
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

      this.applyGeometry(left, top, width, height);
    };

    const endResize = (event: PointerEvent) => {
      if (!resize || event.pointerId !== resize.pointerId) return;
      const handle = event.currentTarget as HTMLElement | null;
      resize = null;
      this.root.classList.remove("is-resizing");
      if (handle?.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
    };

    for (const handle of this.resizeHandles) {
      this.listen<PointerEvent>(handle, "pointerdown", beginResize);
      this.listen<PointerEvent>(handle, "pointermove", updateResize);
      this.listen<PointerEvent>(handle, "pointerup", endResize);
      this.listen<PointerEvent>(handle, "pointercancel", endResize);
      this.listen<PointerEvent>(handle, "lostpointercapture", () => {
        resize = null;
        this.root.classList.remove("is-resizing");
      });
    }
  }

  private listen<T extends Event>(
    target: EventTarget,
    type: string,
    handler: (event: T) => void,
    options?: AddEventListenerOptions | boolean,
  ): () => void {
    const listener = (event: Event) => handler(event as T);
    target.addEventListener(type, listener, options);
    const cleanup = () => target.removeEventListener(type, listener, options);
    this.cleanups.push(cleanup);
    return cleanup;
  }
}
