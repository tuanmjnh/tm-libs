const STORAGE_PREFIX = "app:";
type StorageMode = "expire" | "normal";

// 1. Khai báo Interface No-op (Chỉ dành cho Node.js)
interface StorageInstance {
  length: number;
  key(index: number): string | null;
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clear(): void;
}

// 2. Khai báo Implement No-op (Lớp giả lập cho Node.js)
// Lớp này không làm gì cả, chỉ giúp tránh lỗi runtime.
const NoOpStorage: StorageInstance = {
  length: 0,
  key: () => null,
  setItem: () => { },
  getItem: () => null,
  removeItem: () => { },
  clear: () => { },
};

// 3. Hàm tạo có kiểm tra điều kiện (Isomorphic Factory)
function createStorage(storage: StorageInstance, prefix = STORAGE_PREFIX, mode: StorageMode = "expire") {
  // [GIỮ NGUYÊN LOGIC CÁC HÀM SET/GET/REMOVE/CLEAR/KEYS]

  function set<T = any>(key: string, value: T, expireSeconds?: number): void {
    try {
      const fullKey = prefix + key;
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

  function get<T = any>(key: string): T | null {
    try {
      const fullKey = prefix + key;
      const raw = storage.getItem(fullKey);
      if (!raw) return null;

      if (mode === "normal") {
        return JSON.parse(raw);
      }

      // expire mode
      const data = JSON.parse(raw) as { value: T, expire: number | null };
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

// 4. Kiểm tra sự tồn tại của Window
const getBrowserStorage = (type: 'local' | 'session') => {
  if (typeof window !== 'undefined') {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  }
  // Trả về đối tượng No-op khi chạy trong Node.js
  return NoOpStorage as Storage;
}

/**
 * ✅ Aggregate LocalStorage
 * Modes can be selected: expire | normal
 */
export const createLocalStorage = (mode: StorageMode = "expire") =>
  createStorage(getBrowserStorage('local'), STORAGE_PREFIX, mode);

/**
 * ✅ Aggregate SessionStorage
 * Modes can be selected: expire | normal
 */
export const createSessionStorage = (mode: StorageMode = "expire") =>
  createStorage(getBrowserStorage('session'), STORAGE_PREFIX, mode);

// ⚡ Initialize 4 quick variables
export const localStorage = createLocalStorage("expire");
export const localStorageNormal = createLocalStorage("normal");
export const sessionStorage = createSessionStorage("expire");
export const sessionStorageNormal = createSessionStorage("normal");

export { };