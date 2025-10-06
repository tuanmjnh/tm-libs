// Assuming 'random' utility is available, which generates an integer between min (inclusive) and max (inclusive).
import { random } from './number.js';

/**
 * Creates a Promise that resolves after a specified number of milliseconds.
 * This is the modern, promise-based equivalent of setTimeout.
 * @param ms The delay time in milliseconds.
 * @returns A Promise that resolves after the delay.
 */
export const delay = (ms: number): Promise<void> => {
  // Use Math.max(0, ms) to ensure the delay is not negative.
  const safeMs = Math.max(0, ms);
  return new Promise(res => setTimeout(res, safeMs));
};

/**
 * Creates a Promise that resolves after a random delay time between msMin and msMax (inclusive).
 * @param msMin The minimum delay time in milliseconds (inclusive).
 * @param msMax The maximum delay time in milliseconds (inclusive).
 * @returns A Promise that resolves after the random delay.
 */
export const delayRandom = (msMin: number, msMax: number): Promise<void> => {
  // Ensure the random function is used correctly for an inclusive range.
  const randomDelay = random(msMin, msMax);

  return new Promise(res => setTimeout(res, randomDelay));
};

// If you don't have './number.js' available, you'd need the random utility here:
// const random = (min: number, max: number): number => {
//   const minCeiled = Math.ceil(min);
//   const maxFloored = Math.floor(max);
//   return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
// };

export { };

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