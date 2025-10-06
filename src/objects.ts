/**
 * Converts all property keys of an object to lowercase.
 * @param obj The input object.
 * @returns A new object with keys converted to lowercase.
 */
export const toLowerCaseObj = <T extends Record<string, any>>(obj: T): Record<string, T[keyof T]> => {
  const result: Record<string, T[keyof T]> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key.toLowerCase()] = obj[key];
    }
  }
  return result;
};

/**
 * Converts all property keys of an object to uppercase.
 * @param obj The input object.
 * @returns A new object with keys converted to uppercase.
 */
export const toUpperCaseObj = <T extends Record<string, any>>(obj: T): Record<string, T[keyof T]> => {
  const result: Record<string, T[keyof T]> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key.toUpperCase()] = obj[key];
    }
  }
  return result;
};

/**
 * Filters and returns properties from the 'source' object that match the keys present in the 'whitelist' object.
 * This is typically used to sanitize request bodies by only accepting fields defined in a schema/default object.
 * * @param whitelist An object whose keys determine which properties to include (e.g., a schema or default object).
 * @param source The object to extract properties from (e.g., a request body).
 * @returns A new object containing only the properties from 'source' whose keys exist in 'whitelist'.
 */
export const getBody = <T extends Record<string, any>, S extends Record<string, any>>(
  whitelist: T,
  source: S
): Partial<S> => {
  const result: Partial<S> = {};

  // Use keys from the whitelist object
  Object.keys(whitelist).forEach(key => {
    // Check if the key exists in the source object (body)
    // We explicitly check for 'undefined' to include values like null or 0.
    if (source && source[key] !== undefined) {
      // Cast is necessary because TypeScript can't guarantee the key T is compatible with S, 
      // but structurally, we are copying source[key] to result[key].
      result[key as keyof S] = source[key];
    }
  });

  return result;
};
/*
// Whitelist defines the allowed keys
const allowedFields = { name: null, email: null, role: null, ignored: null };

// Source is the incoming data (request body)
const requestBody = {
  name: "Alice",
  email: "alice@example.com",
  age: 30, // Extra field
  role: undefined // Undefined value is filtered out
};

// Filtered object only contains 'name' and 'email' (since 'role' was undefined in the source)
const filteredBody = getBody(allowedFields, requestBody);
// console.log(filteredBody); // { name: "Alice", email: "alice@example.com" }
*/
export { };