import { random } from './number'
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms))
export const delayRandom = (msMin: number, msMax: number) => new Promise(res => setTimeout(res, random(msMin, msMax)))

// export function debounce(func: Function, delay: number, immediate = false) {
//   let timer: any
//   return function (...args: any) {
//     const context = this
//     const callNow = immediate && !timer
//     clearTimeout(timer)
//     timer = setTimeout(() => {
//       timer = null
//       if (!immediate) func.apply(context, args)
//     }, delay)
//     if (callNow) func.apply(context, args)
//   }
// }


// export function debounce1(func, wait) {
//   var timeout, value
//   return function () {
//     if (!timeout) value = func.apply(this, arguments)
//     clearTimeout(timeout)
//     timeout = setTimeout(() => { timeout = value = null }, wait)
//     return value
//   }
// }

// export function debounce2(func, wait) {
//   var timeout
//   const never = new Promise(resolve => { /* do nothing */ })
//   return function () {
//     const result = timeout ? never : func.apply(this, arguments)
//     clearTimeout(timeout)
//     timeout = setTimeout(() => { timeout = null }, wait)
//     return result
//   }
// }

// export function debounce3(func, wait) {
//   var timeout
//   return function () {
//     return new Promise(resolve => {
//       if (!timeout) resolve(func.apply(this, arguments))
//       clearTimeout(timeout)
//       timeout = setTimeout(() => { timeout = null }, wait)
//     })
//   }
// }

// export function debounce4(func, wait) {
//   var timeout
//   return function () {
//     const result = timeout
//       ? Promise.reject(new Error('called during debounce period'))
//       : Promise.resolve(func.apply(this, arguments))
//     clearTimeout(timeout)
//     timeout = setTimeout(() => { timeout = null }, wait)
//     return result
//   }
// }

export { };