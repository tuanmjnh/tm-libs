/**
 * ✅ Check if the path is an external link
 */
export const isExternal = (path: string): boolean => /^(https?:|mailto:|tel:)/.test(path);

/**
 * 🔒 Check if the username is valid (example: admin, editor)
 */
export const validUsername = (str: string): boolean => {
  const validUsers = ['admin', 'editor'];
  return validUsers.includes(str.trim());
};

/**
 * 🌐 Validate if a string is a valid URL
 */
export const validURL = (url: string): boolean => {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d?)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:[0-9]+)?(\/[^\s]*)?$/;
  return reg.test(url);
};

/**
 * 🔡 Validate if the string contains only lowercase letters
 */
export const validLowerCase = (str: string): boolean => /^[a-z]+$/.test(str);

/**
 * 🔠 Validate if the string contains only uppercase letters
 */
export const validUpperCase = (str: string): boolean => /^[A-Z]+$/.test(str);

/**
 * 🔤 Validate if the string contains only alphabetic characters (A-Z, a-z)
 */
export const validAlphabets = (str: string): boolean => /^[A-Za-z]+$/.test(str);

/**
 * 📧 Validate if the string is a valid email address
 */
export const validEmail = (email: string): boolean => {
  const reg =
    /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/;
  return reg.test(email);
};

/**
 * 🔠 Check if a value is a string
 */
export const isString = (val: unknown): val is string =>
  typeof val === 'string' || val instanceof String;

/**
 * 🧱 Check if a value is an array
 */
export const isArray = (val: unknown): val is any[] => Array.isArray(val);

/**
 * ✅ Check if a value is a boolean
 */
export const isBoolean = (val: unknown): val is boolean =>
  typeof val === 'boolean' || val instanceof Boolean;

/**
 * 🔢 Check if a value is a number
 */
export const isNumber = (val: unknown): val is number =>
  typeof val === 'number' && !isNaN(val);

/**
 * 🧩 Check if a value is a plain object
 */
export const isObject = (val: unknown): val is Record<string, any> =>
  Object.prototype.toString.call(val) === '[object Object]';

/**
 * 🚫 Check if a value is empty (null, undefined, '', [], {})
 */
export const isEmpty = (val: unknown): boolean => {
  if (val == null) return true;
  if (typeof val === 'string') return val.trim().length === 0;
  if (Array.isArray(val)) return val.length === 0;
  if (isObject(val)) return Object.keys(val).length === 0;
  return false;
};

/**
 * 🌍 Check if a string is a valid URL (safe and simple)
 */
export const isUrl = (val: string): boolean => {
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
};

export { };
