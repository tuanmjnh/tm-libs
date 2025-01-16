export const get = (key: string) => {
  try {
    if (!key) return null
    const nest = key.split('.')
    const rs = window.localStorage.getItem(nest[0]) || ''
    if (nest.length < 2)
      return rs ? JSON.parse(rs) : null
    else {
      const json = JSON.parse(rs)
      return json[nest[1]]
    }
  } catch (e) { return null }
}

export const set = (key: string, value: any) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (e) { throw e }
}
export const remove = (key: string) => {
  try {
    window.localStorage.removeItem(key)
  } catch (e) { throw e }
}
export const clear = () => {
  try {
    window.localStorage.clear()
  } catch (e) { throw e }
}

export default { get, set, remove, clear }