const KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const;

type StorageKey = (typeof KEYS)[keyof typeof KEYS];

function get<T>(key: StorageKey): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
}

function set<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error(`Failed to set storage key: ${key}`);
  }
}

function remove(key: StorageKey): void {
  localStorage.removeItem(key);
}

function clear(): void {
  localStorage.clear();
}

export const storage = { get, set, remove, clear, KEYS };