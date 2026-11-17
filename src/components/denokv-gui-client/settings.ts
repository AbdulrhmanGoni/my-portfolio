// Settings for the recreated denokv-gui-client window.
//
// The real application stores these preferences in its SQLite database. The
// portfolio has no backend, so the values live in localStorage. The theme is
// applied to the window; the update and hardware controls stay inert and only
// remember their selection.

export type ThemePreference = "dark" | "light" | "system";

export type ResolvedTheme = "dark" | "light";

export type AppSettings = {
  autoCheckForUpdate: boolean;
  theme: ThemePreference;
  hardwareAccelerationEnabled: boolean;
};

export const APP_SETTINGS_STORAGE_KEY = "denokv-gui-client:settings";

export const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

const themePreferences: ThemePreference[] = ["dark", "light", "system"];

const defaultSettings: AppSettings = {
  autoCheckForUpdate: false,
  theme: "dark",
  hardwareAccelerationEnabled: true,
};

function isThemePreference(value: unknown): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
}

export function resolveTheme(theme: ThemePreference): ResolvedTheme {
  if (theme !== "system") return theme;

  if (typeof window === "undefined" || !window.matchMedia) return "dark";

  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
}

export function applyTheme(theme: ThemePreference): void {
  if (typeof document === "undefined") return;

  const resolvedTheme = resolveTheme(theme);

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function loadAppSettings(): AppSettings {
  if (typeof localStorage === "undefined") return { ...defaultSettings };

  try {
    const rawValue = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!rawValue) return { ...defaultSettings };

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== "object") {
      return { ...defaultSettings };
    }

    const record = parsedValue as Record<string, unknown>;

    return {
      autoCheckForUpdate:
        typeof record.autoCheckForUpdate === "boolean"
          ? record.autoCheckForUpdate
          : defaultSettings.autoCheckForUpdate,
      theme: isThemePreference(record.theme)
        ? record.theme
        : defaultSettings.theme,
      hardwareAccelerationEnabled:
        typeof record.hardwareAccelerationEnabled === "boolean"
          ? record.hardwareAccelerationEnabled
          : defaultSettings.hardwareAccelerationEnabled,
    };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures (quota, private mode, ...). The in-memory
    // settings still reflect the change for the current session.
  }
}
