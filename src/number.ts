import { max } from './array.js'
export const random = (min: number, max: number) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

export const randomIn = (min: number, max: number) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

export const formatFileSize = (val: number, si = true, dp = 1) => {
  let bytes = parseInt(val.toString())
  const thresh = si ? 1000 : 1024

  if (Math.abs((bytes)) < thresh) return bytes + ' B'

  const units = si ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return bytes.toFixed(dp) + ' ' + units[u]
}
export const toThousandFilter = (val: number) => {
  return (+val || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}
export const numberFormat = (val: number, language = 'en-US') => {
  if (!val) return '0'
  return new Intl.NumberFormat(language).format(parseInt(val.toString()))
}

export const generatorIdType = (options: Array<any>, key = 'id') => {
  const keys = options.map(x => x[key])
  return max(keys) + 1
}
export { };