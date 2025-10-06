/**
 * ✅ Check if the path is an external link (starts with http(s), mailto, or tel protocol).
 * @param path The string path to check.
 * @returns True if the path is external.
 */
export const isExternal = (path: string): boolean => /^(https?:|mailto:|tel:)/i.test(path);

/**
 * 🔒 Check if the username is valid (example: admin, editor).
 * @param str The username string to validate.
 * @returns True if the username matches one of the valid predefined users.
 */
export const validUsername = (str: string): boolean => {
  const validUsers = ['admin', 'editor'];
  // Ensure case-insensitivity might be needed depending on requirement, but here matches original intent.
  return validUsers.includes(str.trim());
};

/**
 * 🌐 Validate if a string is a valid URL (using the safe and simple isUrl implementation).
 * @param url The string to validate.
 * @returns True if the string is a valid URL.
 */
export const validURL = (url: string): boolean => {
  // Prefer the modern URL constructor check for robustness
  return isUrl(url);
};

/**
 * 🔡 Validate if the string contains only lowercase letters (a-z).
 * @param str The string to validate.
 * @returns True if the string consists entirely of lowercase alphabetic characters.
 */
export const validLowerCase = (str: string): boolean => /^[a-z]+$/.test(str);

/**
 * 🔠 Validate if the string contains only uppercase letters (A-Z).
 * @param str The string to validate.
 * @returns True if the string consists entirely of uppercase alphabetic characters.
 */
export const validUpperCase = (str: string): boolean => /^[A-Z]+$/.test(str);

/**
 * 🔤 Validate if the string contains only alphabetic characters (A-Z, a-z).
 * @param str The string to validate.
 * @returns True if the string consists entirely of alphabetic characters.
 */
export const validAlphabets = (str: string): boolean => /^[A-Za-z]+$/.test(str);

/**
 * 📧 Validate if the string is a valid email address.
 * Note: The provided regex is robust for most common cases.
 * @param email The string to validate.
 * @returns True if the string is a valid email address.
 */
export const validEmail = (email: string): boolean => {
  // Use a slightly more relaxed but commonly accepted email regex pattern
  const reg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email.trim()); // Trim for better robustness
};

/**
 * 🌍 Check if a string is a valid URL (safe and simple implementation using native URL constructor).
 * @param val The string to check.
 * @returns True if the string can be parsed as a URL.
 */
export const isUrl = (val: string): boolean => {
  // Handle empty or non-string inputs early, though TypeScript enforces string input.
  if (!val) return false;

  try {
    // The URL constructor throws an error if the URL is invalid.
    new URL(val);
    return true;
  } catch {
    return false;
  }
};

/**
 * 🔠 Check if a value is a string.
 * @param val The value to check.
 * @returns True if the value is a string primitive or String object.
 */
export const isString = (val: unknown): val is string =>
  typeof val === 'string' || val instanceof String;

/**
 * 🧱 Check if a value is an array.
 * @param val The value to check.
 * @returns True if the value is an array.
 */
export const isArray = (val: unknown): val is any[] => Array.isArray(val);

/**
 * ✅ Check if a value is a boolean.
 * @param val The value to check.
 * @returns True if the value is a boolean primitive or Boolean object.
 */
export const isBoolean = (val: unknown): val is boolean =>
  typeof val === 'boolean' || val instanceof Boolean;

/**
 * 🔢 Check if a value is a number (and not NaN).
 * @param val The value to check.
 * @returns True if the value is a number primitive and not NaN.
 */
export const isNumber = (val: unknown): val is number =>
  typeof val === 'number' && !isNaN(val) && isFinite(val); // Added isFinite to exclude Infinity

/**
 * 🧩 Check if a value is a plain JavaScript object (excluding arrays, null, etc.).
 * @param val The value to check.
 * @returns True if the value is a plain object.
 */
export const isObject = (val: unknown): val is Record<string, any> =>
  Object.prototype.toString.call(val) === '[object Object]';

/**
 * 🚫 Check if a value is considered empty.
 * Empty is defined as: null, undefined, '', ' ', [], {}, or NaN.
 * @param val The value to check.
 * @returns True if the value is considered empty.
 */
export const isEmpty = (val: unknown): boolean => {
  // null or undefined
  if (val == null) return true;

  // NaN check (NaN is the only value not equal to itself)
  if (typeof val === 'number' && isNaN(val)) return true;

  // String check (empty or only whitespace)
  if (isString(val)) return val.trim().length === 0;

  // Array check (empty array)
  if (isArray(val)) return val.length === 0;

  // Plain object check (empty object)
  if (isObject(val)) return Object.keys(val).length === 0;

  // For all other types (numbers, functions, Dates, etc.), it's not empty
  return false;
};

export { };