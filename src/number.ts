import { max } from './array.js'
/**
 * Generates a random integer between min and max (both inclusive).
 * @param min The minimum integer value (inclusive).
 * @param max The maximum integer value (inclusive).
 * @returns A random integer.
 */
export const random = (min: number, max: number): number => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  // Formula: Math.floor(Math.random() * (max - min + 1) + min)
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};

/**
 * Generates a random integer between min (inclusive) and max (exclusive).
 * @param min The minimum integer value (inclusive).
 * @param max The maximum integer value (exclusive).
 * @returns A random integer.
 */
export const randomIn = (min: number, max: number): number => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  // Formula: Math.floor(Math.random() * (max - min) + min)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};
/**
 * Formats bytes as human-readable text.
 * This is identical to the humanFileSize function provided previously, ensuring consistency.
 *
 * @param bytes The number of bytes.
 * @param si True to use metric (SI, powers of 1000). False to use binary (IEC, powers of 1024).
 * @param dp Number of decimal places to display.
 * @returns Formatted string (e.g., "1.2 MB" or "1.2 MiB").
 */
export const formatFileSize = (bytes: number, si: boolean = true, dp: number = 1): string => {
  // Convert to integer (Math.abs ensures positive parsing, though bytes can be negative)
  const absBytes = Math.abs(bytes);
  const sign = bytes < 0 ? '-' : '';

  const thresh = si ? 1000 : 1024;

  if (absBytes < thresh) return `${sign}${absBytes} B`;

  const units = si ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  let currentBytes = absBytes;

  do {
    currentBytes /= thresh;
    ++u;
  } while (Math.round(currentBytes * r) / r >= thresh && u < units.length - 1);

  return `${sign}${currentBytes.toFixed(dp)} ${units[u]}`;
};

/**
 * Formats a number by inserting thousands separators (commas in standard English notation).
 * This uses regex manipulation for fast string replacement, compatible with numbers and strings.
 * @param val The number or number string to format.
 * @returns The formatted string (e.g., "1,234,567").
 */
export const toThousandFilter = (val: number | string): string => {
  // Coerce to a string and ensure a valid number (0) if input is falsy
  const s = String(+val || 0);

  // The regex finds the integer part (allowing optional leading '-')
  // and replaces every 3 digits that are NOT at the beginning of the number or followed by
  // a decimal point, inserting a comma.
  return s.replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','));
};

/**
 * Formats a number using the built-in Intl.NumberFormat for locale-specific formatting.
 * @param val The number to format.
 * @param language The locale string (e.g., 'en-US', 'de-DE'). Defaults to 'en-US'.
 * @returns The locale-formatted string (e.g., "1,234,567.89").
 */
export const numberFormat = (val: number | string, language: string = 'en-US'): string => {
  // Coerce to number. Use a direct comparison against NaN after conversion for robustness.
  const num = Number(val);
  if (isNaN(num)) return '0';

  // Use the number itself, not a parsed integer, to allow decimal formatting
  return new Intl.NumberFormat(language).format(num);
};
// Assume the dependency below is available and correctly typed:
// import { max } from './array.js'; 
// declare function max(arr: number[]): number; // Declaration for TS compilation

/**
 * Generates a new ID that is one greater than the current maximum ID found in an array of objects.
 * This is useful for sequential ID generation in client-side arrays.
 * @param options The array of objects containing the ID field.
 * @param key The property name (key) of the ID field. Defaults to 'id'.
 * @returns The next available ID number, or 1 if the array is empty.
 */
export const generatorIdType = (options: Array<Record<string, any>>, key: string = 'id'): number => {
  if (!options || options.length === 0) return 1;

  // Filter out any non-numeric IDs before mapping to ensure 'max' receives only numbers
  const keys = options
    .map(x => x[key])
    .filter((id): id is number => typeof id === 'number' && !isNaN(id));

  // If no valid keys are found (e.g., all were strings or null), start from 1
  if (keys.length === 0) return 1;

  // Utilize the imported max function
  const currentMax = max(keys);

  return currentMax + 1;
};
export { };