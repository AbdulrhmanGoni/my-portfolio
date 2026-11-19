// Toast notifications for the recreated denokv-gui-client window.
//
// The real application uses svelte-sonner. This window only needs the success
// notification, so the store is kept small while the appearance copies the
// success toast of the real app. Any component can call `notify.success` and
// the single <Toaster /> mounted by the app renders the message.

const TOAST_DURATION = 4000;
const EXIT_DURATION = 200;
const MAX_VISIBLE_TOASTS = 3;

export type ToastItem = {
  id: number;
  message: string;
  leaving: boolean;
};

let nextId = 0;
const dismissTimers = new Map<number, ReturnType<typeof setTimeout>>();
const removalTimers = new Map<number, ReturnType<typeof setTimeout>>();

export const toasts = $state<ToastItem[]>([]);

function clearTimer(
  timers: Map<number, ReturnType<typeof setTimeout>>,
  id: number,
): void {
  const timer = timers.get(id);
  if (timer === undefined) return;

  clearTimeout(timer);
  timers.delete(id);
}

function removeToast(id: number): void {
  clearTimer(dismissTimers, id);
  clearTimer(removalTimers, id);

  const index = toasts.findIndex((toast) => toast.id === id);
  if (index !== -1) toasts.splice(index, 1);
}

function dismissToast(id: number): void {
  const toast = toasts.find((item) => item.id === id);
  if (!toast || toast.leaving) return;

  clearTimer(dismissTimers, id);
  toast.leaving = true;

  removalTimers.set(
    id,
    setTimeout(() => removeToast(id), EXIT_DURATION),
  );
}

function showToast(message: string): number {
  const id = nextId++;

  toasts.push({ id, message, leaving: false });

  while (toasts.length > MAX_VISIBLE_TOASTS) {
    removeToast(toasts[0].id);
  }

  dismissTimers.set(
    id,
    setTimeout(() => dismissToast(id), TOAST_DURATION),
  );

  return id;
}

export const notify = {
  success(message: string): number {
    return showToast(message);
  },
};
