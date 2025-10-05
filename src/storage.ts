const STORAGE_PREFIX = "app:"; //✅ replace with a unique prefix for the project

interface StorageData<T = any> {
  value: T;
  expire: number | null;
}

type StorageMode = "expire" | "normal";

// ✅ Factory creates storage (can expire or not)
function createStorage(storage: Storage, prefix = STORAGE_PREFIX, mode: StorageMode = "expire") {
  function set<T = any>(key: string, value: T, expireSeconds?: number): void {
    try {
      const fullKey = prefix + key;
      if (mode === "normal") {
        storage.setItem(fullKey, JSON.stringify(value));
        return;
      }

      // expire mode
      const expire = expireSeconds ? Date.now() + expireSeconds * 1000 : null;
      const data: StorageData<T> = { value, expire };
      storage.setItem(fullKey, JSON.stringify(data));
    } catch (err) {
      console.error("[Storage:set] Error:", err);
    }
  }

  function get<T = any>(key: string): T | null {
    try {
      const fullKey = prefix + key;
      const raw = storage.getItem(fullKey);
      if (!raw) return null;

      if (mode === "normal") {
        return JSON.parse(raw);
      }

      // expire mode
      const data = JSON.parse(raw) as StorageData<T>;
      if (data && (data.expire === null || data.expire >= Date.now())) {
        return data.value;
      }

      remove(key);
      return null;
    } catch (err) {
      console.warn("[Storage:get] Error:", err);
      return null;
    }
  }

  function remove(key: string): void {
    try {
      storage.removeItem(prefix + key);
    } catch (err) {
      console.error("[Storage:remove] Error:", err);
    }
  }

  function clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(prefix)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => storage.removeItem(k));
    } catch (err) {
      console.error("[Storage:clear] Error:", err);
    }
  }

  function keys(): string[] {
    const result: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(prefix)) {
        result.push(k.replace(prefix, ""));
      }
    }
    return result;
  }

  return { set, get, remove, clear, keys };
}

/**
* ✅ Aggregate LocalStorage
* Modes can be selected: expire | normal
*/
export const createLocalStorage = (mode: StorageMode = "expire") =>
  createStorage(window.localStorage, STORAGE_PREFIX, mode);

/**
* ✅ Aggregate SessionStorage
* Modes can be selected: expire | normal
*/
export const createSessionStorage = (mode: StorageMode = "expire") =>
  createStorage(window.sessionStorage, STORAGE_PREFIX, mode);

// ⚡ Initialize 4 quick variables
export const localStorage = createLocalStorage("expire");
export const localStorageNormal = createLocalStorage("normal");
export const sessionStorage = createSessionStorage("expire");
export const sessionStorageNormal = createSessionStorage("normal");

export { };
