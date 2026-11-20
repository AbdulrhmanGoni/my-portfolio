// Kv store records for the recreated denokv-gui-client window.
//
// The real application keeps its stores in the Electron main process. The
// portfolio has no backend, so the records created through the form are kept in
// localStorage under a single key and loaded when the window opens.

export type KvStoreType = "local" | "remote" | "bridge" | "default";

export type CreatableKvStoreType = Exclude<KvStoreType, "default">;

export type KvStore = {
  id: string;
  name: string;
  url: string;
  type: KvStoreType;
  createdAt: string;
  updatedAt: string;
  accessToken?: string | null;
  authToken?: string | null;
};

export type CreateKvStoreInput = {
  name: string;
  url: string;
  type: CreatableKvStoreType;
  accessToken?: string | null;
  authToken?: string | null;
};

export const KV_STORES_STORAGE_KEY = "denokv-gui-client:kv-stores";

const kvStoreTypes: KvStoreType[] = ["local", "remote", "bridge", "default"];

export function isKvStoreType(value: unknown): value is KvStoreType {
  return kvStoreTypes.includes(value as KvStoreType);
}

export function isCreatableKvStoreType(
  value: unknown,
): value is CreatableKvStoreType {
  return value === "local" || value === "remote" || value === "bridge";
}

export function joinLocalKvPath(directory: string, fileName: string): string {
  const trimmedDirectory = directory.trim().replace(/\/+$/, "");
  const trimmedFileName = fileName.trim().replace(/^\/+/, "");

  if (!trimmedDirectory) return trimmedFileName;
  if (!trimmedFileName) return trimmedDirectory;

  return `${trimmedDirectory}/${trimmedFileName}`;
}

export function splitLocalKvPath(path: string): {
  directory: string;
  fileName: string;
} {
  const trimmedPath = path.trim();
  const separatorIndex = trimmedPath.lastIndexOf("/");

  if (separatorIndex === -1) {
    return { directory: "", fileName: trimmedPath };
  }

  return {
    directory: trimmedPath.slice(0, separatorIndex) || "/",
    fileName: trimmedPath.slice(separatorIndex + 1),
  };
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseKvStore(value: unknown): KvStore | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const { id, name, url, type, createdAt, updatedAt } = record;

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof url !== "string" ||
    !isKvStoreType(type) ||
    typeof createdAt !== "string" ||
    typeof updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id,
    name,
    url,
    type,
    createdAt,
    updatedAt,
    accessToken: typeof record.accessToken === "string" ? record.accessToken : null,
    authToken: typeof record.authToken === "string" ? record.authToken : null,
  };
}

export function loadKvStores(): KvStore[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const rawValue = localStorage.getItem(KV_STORES_STORAGE_KEY);
    if (!rawValue) return [];

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue
      .map(parseKvStore)
      .filter((store): store is KvStore => store !== null);
  } catch {
    return [];
  }
}

export function saveKvStores(stores: KvStore[]): void {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(KV_STORES_STORAGE_KEY, JSON.stringify(stores));
  } catch {
    // Ignore storage failures (quota, private mode, ...). The in-memory list
    // still reflects the change for the current session.
  }
}

export function createKvStore(input: CreateKvStoreInput): KvStore {
  const now = new Date().toISOString();

  return {
    id: createId(),
    name: input.name.trim(),
    url: input.url.trim(),
    type: input.type,
    createdAt: now,
    updatedAt: now,
    accessToken: input.accessToken ?? null,
    authToken: input.authToken ?? null,
  };
}

export function hasKvStoreChanges(
  kvStore: KvStore,
  input: CreateKvStoreInput,
): boolean {
  return (
    kvStore.name !== input.name.trim() ||
    kvStore.url !== input.url.trim() ||
    kvStore.type !== input.type ||
    (kvStore.accessToken ?? null) !== (input.accessToken ?? null) ||
    (kvStore.authToken ?? null) !== (input.authToken ?? null)
  );
}

export function updateKvStore(
  kvStore: KvStore,
  input: CreateKvStoreInput,
): KvStore {
  return {
    ...kvStore,
    name: input.name.trim(),
    url: input.url.trim(),
    type: input.type,
    updatedAt: new Date().toISOString(),
    accessToken: input.accessToken ?? null,
    authToken: input.authToken ?? null,
  };
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en-US", {
  style: "long",
});

export function formatTimeAgo(date: Date): string {
  const diffInMs = Date.now() - date.getTime();

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return relativeTimeFormatter.format(-years, "year");
  if (months > 0) return relativeTimeFormatter.format(-months, "month");
  if (weeks > 0) return relativeTimeFormatter.format(-weeks, "week");
  if (days > 0) return relativeTimeFormatter.format(-days, "day");
  if (hours > 0) return relativeTimeFormatter.format(-hours, "hour");
  if (minutes > 0) return relativeTimeFormatter.format(-minutes, "minute");
  return "just now";
}
