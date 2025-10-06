type StorageMode = "expire" | "normal";

// 1. Declare No-op Interface
interface StorageInstance {
  length: number;
  key(index: number): string | null;
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clear(): void;
}

// 2. Declare No-op Implementation (Mock class for Node.js)
// This class does nothing but helps prevent runtime errors in non-browser environments.
const NoOpStorage: StorageInstance = {
  length: 0,
  key: () => null,
  setItem: () => { },
  getItem: () => null,
  removeItem: () => { },
  clear: () => { },
};

// 4. Window existence check (Isomorphic helper)
const getBrowserStorage = (type: 'local' | 'session') => {
  if (typeof window !== 'undefined') {
    // Cast to StorageInstance for type compatibility
    return type === 'local' ? window.localStorage as StorageInstance : window.sessionStorage as StorageInstance;
  }
  // Returns the No-op object when running in Node.js
  return NoOpStorage;
}

// 3. Conditional Factory Function (Isomorphic Storage Creator)
/**
 * Creates a storage instance with expiry and/or nested object support.
 * @param initialStorage The underlying storage mechanism (localStorage, sessionStorage, or NoOp).
 * @param initialPrefix The default key prefix for this instance (defaults to "").
 * @param mode The storage mode: "expire" (with TTL) or "normal".
 */
function createStorage(initialStorage: StorageInstance, initialPrefix: string = "", mode: StorageMode = "expire") {
  // The default prefix for this instance (can be "")
  const defaultPrefix = initialPrefix;
  const storage = initialStorage;

  /**
   * Helper to determine the final prefix:
   * - If customPrefix is a string (including ""), use it.
   * - Otherwise (null/undefined), use the instance's defaultPrefix.
   */
  const getFinalPrefix = (customPrefix?: string | null): string => {
    if (typeof customPrefix === 'string') return customPrefix;
    return defaultPrefix;
  };

  const getFullKey = (key: string, prefix: string) => prefix + key;

  // --- NESTED OBJECT HELPERS (Private Logic) ---

  /** Finds a deeply nested value within an object using a dot-separated path. */
  function _getNested(obj: any, path: string): any {
    const keys = path.split('.');
    return keys.reduce((acc, key) => {
      // Handles array indices: e.g., items[0]
      const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const prop = arrayMatch[1];
        const index = parseInt(arrayMatch[2]);
        return acc && acc[prop] ? acc[prop][index] : undefined;
      }
      // Handles object properties
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
  }

  /** Updates a deeply nested value within an object and returns the updated object. */
  function _setNested(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;

    for (const key of keys) {
      const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const prop = arrayMatch[1];
        const index = parseInt(arrayMatch[2]);
        if (!current[prop] || typeof current[prop] !== 'object') current[prop] = [];
        current = current[prop][index] || {};
      } else {
        if (!current[key] || typeof current[key] !== 'object') current[key] = {};
        current = current[key];
      }
    }

    const lastArrayMatch = lastKey.match(/(\w+)\[(\d+)\]/);
    if (lastArrayMatch) {
      const prop = lastArrayMatch[1];
      const index = parseInt(lastArrayMatch[2]);
      if (!current[prop] || typeof current[prop] !== 'object') current[prop] = [];
      current[prop][index] = value;
    } else {
      current[lastKey] = value;
    }

    return obj;
  }

  // --- PUBLIC STORAGE API ---

  /**
   * Sets a value by key. Supports nested paths (e.g., "user.name") and expiry.
   * If a nested key is provided, it attempts to merge the value into the root object.
   * If a top-level key is provided, it overwrites the entire value.
   */
  function set<T = any>(key: string, value: T, expireSeconds?: number, customPrefix?: string | null): void {
    try {
      // 1. Handle Nested Key (e.g., "user.name")
      if (key.includes('.')) {
        const [rootKey, nestedPath] = key.split(/\.(.*)/s);

        // Try to retrieve the root value (may be null/expired)
        const rootValue = get(rootKey, customPrefix);

        // If rootValue is a valid object, update the nested path
        if (typeof rootValue === 'object' && rootValue !== null) {
          _setNested(rootValue, nestedPath, value);
          // Recursively call set for the root key (overwrites the whole object)
          set(rootKey, rootValue, expireSeconds, customPrefix);
          return;
        }
        // If rootValue is null or not an object, initialize a new object
        else {
          let newRootValue: any = {};
          _setNested(newRootValue, nestedPath, value);
          // Recursively call set for the root key (overwrites with the new object)
          set(rootKey, newRootValue, expireSeconds, customPrefix);
          return;
        }
      }

      // 2. Default logic for Top-Level Key (Full Overwrite)

      const prefix = getFinalPrefix(customPrefix);
      const fullKey = getFullKey(key, prefix);

      if (mode === "normal") {
        storage.setItem(fullKey, JSON.stringify(value));
        return;
      }

      // expire mode
      const expire = expireSeconds ? Date.now() + expireSeconds * 1000 : null;
      const data = { value, expire };
      storage.setItem(fullKey, JSON.stringify(data));

    } catch (err) {
      console.error("[Storage:set] Error:", err);
    }
  }

  /**
   * Gets a value by key. Supports nested paths (e.g., "user.name").
   * Returns the entire root object if a top-level key is provided.
   */
  function get<T = any>(key: string, customPrefix?: string | null): T | null {
    try {
      const isNested = key.includes('.');
      // Always find the root key for storage lookup
      const rootKey = isNested ? key.split('.')[0] : key;

      const prefix = getFinalPrefix(customPrefix);
      const fullRootKey = getFullKey(rootKey, prefix);

      const raw = storage.getItem(fullRootKey);
      if (!raw) return null;

      let data: any;

      // 1. Parse JSON and check expiry
      if (mode === "normal") {
        data = JSON.parse(raw);
      } else {
        const parsed = JSON.parse(raw) as { value: T, expire: number | null };
        if (parsed && (parsed.expire === null || parsed.expire >= Date.now())) {
          data = parsed.value;
        } else {
          // Auto-remove expired item
          remove(rootKey, customPrefix);
          return null;
        }
      }

      // 2. Return Result

      // Case 1: Top-level key, return the whole parsed object/value
      if (!isNested) {
        return data as T;
      }

      // Case 2: Nested key, search deep within the parsed data
      if (typeof data === 'object' && data !== null) {
        const [_, nestedPath] = key.split(/\.(.*)/s);
        return _getNested(data, nestedPath) ?? null;
      }

      // Case 3: Nested key but root data is not an object
      return null;

    } catch (err) {
      console.warn("[Storage:get] Error:", err);
      return null;
    }
  }

  /**
   * Removes a value by key. Only removes the top-level (root) key,
   * even if a nested path is specified.
   */
  function remove(key: string, customPrefix?: string | null): void {
    try {
      // Always remove the top-level key
      const rootKey = key.includes('.') ? key.split('.')[0] : key;
      const prefix = getFinalPrefix(customPrefix);
      storage.removeItem(getFullKey(rootKey, prefix));
    } catch (err) {
      console.error("[Storage:remove] Error:", err);
    }
  }

  /**
   * Clears all keys starting with the specified prefix (or all keys if prefix is "").
   */
  function clear(customPrefix?: string | null): void {
    try {
      const prefix = getFinalPrefix(customPrefix);

      // WARNING: If prefix is "", this clears ALL storage keys!
      if (prefix === "") {
        storage.clear();
        return;
      }

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

  /**
   * Returns an array of keys (without the prefix) that start with the specified prefix.
   * If prefix is "", returns ALL keys in storage (with no prefix removal).
   */
  function keys(customPrefix?: string | null): string[] {
    const prefix = getFinalPrefix(customPrefix);
    const result: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k) {
        if (prefix === "") {
          // Return all keys if prefix is empty
          result.push(k);
        } else if (k.startsWith(prefix)) {
          // Return keys stripped of the prefix
          result.push(k.replace(prefix, ""));
        }
      }
    }
    return result;
  }

  return { set, get, remove, clear, keys };
}

// --- Factory Functions for Easy Initialization ---

/**
 * ✅ Aggregate LocalStorage
 * Modes can be selected: expire | normal
 * Prefix defaults to ""
 */
export const createLocalStorage = (mode: StorageMode = "expire", prefix: string = "") =>
  createStorage(getBrowserStorage('local'), prefix, mode);

/**
 * ✅ Aggregate SessionStorage
 * Modes can be selected: expire | normal
 * Prefix defaults to ""
 */
export const createSessionStorage = (mode: StorageMode = "expire", prefix: string = "") =>
  createStorage(getBrowserStorage('session'), prefix, mode);

// ⚡ Initialize 4 quick variables (with no prefix by default)
export const localStorage = createLocalStorage("expire");
export const localStorageNormal = createLocalStorage("normal");
export const sessionStorage = createSessionStorage("expire");
export const sessionStorageNormal = createSessionStorage("normal");

export { };