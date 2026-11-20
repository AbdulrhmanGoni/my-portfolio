// Kv entries for the recreated denokv-gui-client window.
//
// The real application keeps entries in a Deno KV database behind its bridge
// server. The portfolio has no backend, so entries are stored in localStorage
// as plain text, one list per kv store. Keys are kept exactly as they were
// typed: "[7,2]" and "[7, 2]" are different keys in this demo.

export type KvValueType =
  | "String"
  | "Number"
  | "Boolean"
  | "BigInt"
  | "KvU64"
  | "Date"
  | "Object"
  | "Array"
  | "Set"
  | "Map"
  | "RegExp"
  | "Uint8Array"
  | "Null"
  | "Undefined";

export type KvDataType = {
  type: KvValueType;
  starter: string;
};

export const kvDataTypes: KvDataType[] = [
  { type: "String", starter: "" },
  { type: "Number", starter: "" },
  { type: "Boolean", starter: "" },
  { type: "BigInt", starter: "" },
  { type: "KvU64", starter: "" },
  { type: "Date", starter: "" },
  { type: "Object", starter: "{}" },
  { type: "Array", starter: "[]" },
  { type: "Set", starter: "new Set([])" },
  { type: "Map", starter: "new Map([])" },
  { type: "RegExp", starter: '{ "source": "", "flags": "" }' },
  { type: "Uint8Array", starter: "new Uint8Array([])" },
  { type: "Null", starter: "null" },
  { type: "Undefined", starter: "undefined" },
];

export type KvEntry = {
  key: string;
  valueType: KvValueType;
  value: string;
  versionstamp: string;
  createdAt: string;
};

export type AddKvEntryInput = {
  key: string;
  valueType: KvValueType;
  value: string;
  overwrite: boolean;
};

export type AddKvEntryResult =
  | { ok: true; entries: KvEntry[] }
  | { ok: false; error: string };

const KV_ENTRIES_STORAGE_PREFIX = "denokv-gui-client:kv-entries:";

const kvValueTypes: KvValueType[] = [
  "String",
  "Number",
  "Boolean",
  "BigInt",
  "KvU64",
  "Date",
  "Object",
  "Array",
  "Set",
  "Map",
  "RegExp",
  "Uint8Array",
  "Null",
  "Undefined",
];

export function isKvValueType(value: unknown): value is KvValueType {
  return typeof value === "string" && kvValueTypes.includes(value as KvValueType);
}

function entriesStorageKey(kvStoreId: string): string {
  return `${KV_ENTRIES_STORAGE_PREFIX}${kvStoreId}`;
}

function parseKvEntry(value: unknown): KvEntry | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  if (
    typeof record.key !== "string" ||
    !isKvValueType(record.valueType) ||
    typeof record.value !== "string" ||
    typeof record.versionstamp !== "string" ||
    typeof record.createdAt !== "string"
  ) {
    return null;
  }

  return {
    key: record.key,
    valueType: record.valueType,
    value: record.value,
    versionstamp: record.versionstamp,
    createdAt: record.createdAt,
  };
}

export function loadKvEntries(kvStoreId: string): KvEntry[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const rawValue = localStorage.getItem(entriesStorageKey(kvStoreId));
    if (!rawValue) return [];

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue
      .map(parseKvEntry)
      .filter((entry): entry is KvEntry => entry !== null);
  } catch {
    return [];
  }
}

function saveKvEntries(kvStoreId: string, entries: KvEntry[]): void {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(entriesStorageKey(kvStoreId), JSON.stringify(entries));
  } catch {
    // Ignore storage failures (quota, private mode, ...). The in-memory list
    // still reflects the change for the current session.
  }
}

// The value editors accept arbitrary JavaScript text. The only check applied
// to a value is that the text evaluates to a JavaScript value, like the
// original application does with keys while browsing.
function evaluateJsExpression(source: string): { value: unknown } | null {
  try {
    const value: unknown = Function(`"use strict"; return (${source});`)();
    return { value };
  } catch {
    return null;
  }
}

export function validateKvEntryKey(key: string): string | null {
  const result = evaluateJsExpression(key);

  if (!result || !Array.isArray(result.value)) {
    return "Invalid key, must be an array";
  }

  return null;
}

export function validateKvEntryValue(
  type: KvValueType,
  value: string,
): string | null {
  if (
    type === "String" ||
    type === "Date" ||
    type === "Null" ||
    type === "Undefined"
  ) {
    return null;
  }

  if (type === "RegExp") {
    try {
      const parsedValue = JSON.parse(value) as {
        source?: unknown;
        flags?: unknown;
      };

      if (
        !parsedValue ||
        typeof parsedValue.source !== "string" ||
        typeof parsedValue.flags !== "string"
      ) {
        return "Invalid value, must be a JavaScript value";
      }

      new RegExp(parsedValue.source, parsedValue.flags);
      return null;
    } catch {
      return "Invalid value, must be a JavaScript value";
    }
  }

  if (!value.trim() || !evaluateJsExpression(value)) {
    return "Invalid value, must be a JavaScript value";
  }

  return null;
}

function createVersionstamp(): string {
  const timestamp = Date.now().toString(16).padStart(12, "0").slice(-12);
  const random = Math.floor(Math.random() * 0x100000000)
    .toString(16)
    .padStart(8, "0");

  return `${timestamp}${random}`;
}

export function addKvEntry(
  kvStoreId: string,
  input: AddKvEntryInput,
): AddKvEntryResult {
  const keyError = validateKvEntryKey(input.key);
  if (keyError) return { ok: false, error: keyError };

  const valueError = validateKvEntryValue(input.valueType, input.value);
  if (valueError) return { ok: false, error: valueError };

  const entries = loadKvEntries(kvStoreId);
  const existingIndex = entries.findIndex((entry) => entry.key === input.key);

  if (existingIndex !== -1 && !input.overwrite) {
    return { ok: false, error: "An entry with this key already exists" };
  }

  const entry: KvEntry = {
    key: input.key,
    valueType: input.valueType,
    value: input.value,
    versionstamp: createVersionstamp(),
    createdAt: new Date().toISOString(),
  };

  if (existingIndex === -1) {
    entries.push(entry);
  } else {
    entries[existingIndex] = entry;
  }

  saveKvEntries(kvStoreId, entries);
  return { ok: true, entries };
}
