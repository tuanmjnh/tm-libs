const STORAGE_PREFIX = ''

interface StorageData {
  value: any
  expire: number | null
}
/**
 * LocalStorage Partial Operations
 */
function createLocalStorage() {
  // The default cache period is 7 days

  function set(key: string, value: any, expire: number = 60 * 60 * 24 * 7) {
    const storageData: StorageData = {
      value,
      expire: new Date().getTime() + expire * 1000,
    }
    const json = JSON.stringify(storageData)
    window.localStorage.setItem(`${STORAGE_PREFIX}${String(key)}`, json)
  }

  function get(key: string) {
    const json = window.localStorage.getItem(`${STORAGE_PREFIX}${String(key)}`)
    if (!json)
      return null

    const storageData: StorageData | null = JSON.parse(json)

    if (storageData) {
      const { value, expire } = storageData
      if (expire === null || expire >= Date.now())
        return value
    }
    remove(key)
    return null
  }

  function remove(key: string) {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${String(key)}`)
  }

  function clear() {
    window.localStorage.clear()
  }
  return {
    set,
    get,
    remove,
    clear,
  }
}
/**
 * Some operations of sessionStorage
 */

function createSessionStorage() {
  function set(key: string, value: any) {
    const json = JSON.stringify(value)
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${String(key)}`, json)
  }
  function get(key: string) {
    const json = sessionStorage.getItem(`${STORAGE_PREFIX}${String(key)}`)
    if (!json)
      return null

    const storageData: any | null = JSON.parse(json)

    if (storageData)
      return storageData

    return null
  }
  function remove(key: string) {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${String(key)}`)
  }
  function clear() {
    window.sessionStorage.clear()
  }

  return {
    set,
    get,
    remove,
    clear,
  }
}

export const local = createLocalStorage()
export const session = createSessionStorage()
