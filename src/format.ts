type Primitive = string | number | boolean | null | undefined;
type FormatArg = Primitive | Record<string, Primitive>;

// Overload signatures
export function format(template: string, ...args: Primitive[]): string;
export function format(template: string, values: Record<string, Primitive>): string;
export function format(template: string, ...args: [...Primitive[], Record<string, Primitive>]): string;

// Implementation
/**
 * Formats a string template using positional (%s, {0}, {1}) and key-based ({key}) placeholders.
 * Key-based placeholders are prioritized.
 * @param template The string template.
 * @param args Positional arguments or an object for key-based replacement (if last argument).
 * @returns The formatted string.
 */
export function format(
  template: string,
  ...args: FormatArg[]
): string {
  let result = template;
  let positionalArgs: FormatArg[] = [...args];

  // Identify the last argument for key-based replacement
  const lastArg = args[args.length - 1];

  // Check if the last argument is a plain object (not null, not array)
  const isPlainObject = typeof lastArg === "object" && lastArg !== null && !Array.isArray(lastArg);

  if (isPlainObject) {
    const obj = lastArg as Record<string, Primitive>;

    // 1. Replace {key} placeholders
    for (const key in obj) {
      // Use RegExp constructor for global and case-insensitive replacement
      const regexp = new RegExp(`\\{${key}\\}`, "gi");
      result = result.replace(regexp, String(obj[key] ?? '')); // Use ?? '' for null/undefined safety
    }

    // Remove the object from the positional arguments array
    positionalArgs = args.slice(0, -1);
  }

  // 2. Replace {0}, {1}, ... positional placeholders
  result = result.replace(/{(\d+)}/g, (match, index) => {
    const i = Number(index);
    // Convert to string and use nullish coalescing for safety
    return i < positionalArgs.length ? String(positionalArgs[i] ?? '') : match;
  });

  // 3. Replace %s in order
  for (const value of positionalArgs) {
    // Note: This replaces only the FIRST instance of %s in each iteration
    result = result.replace(/%s/, String(value ?? ''));
  }

  return result;
}

/* --- FORMAT USAGE EXAMPLES --- */
const a = format("Hello %s, you have %s messages", "Jonh", 5);
// console.log(`[Example a] ${a}`); // Hello Jonh, you have 5 messages

const b = format("Hello {0}, you have {1} messages", "Jonh", 5);
// console.log(`[Example b] ${b}`); // Hello Jonh, you have 5 messages

const c = format("Hello {name}, age {age}", { name: "Jonh", age: 25 });
// console.log(`[Example c] ${c}`); // Hello Jonh, age 25

const d = format("User: %s, Age: {age}, Msg: {0}", "Jonh", "ignored_arg", { age: 25 });
// console.log(`[Example d] ${d}`); // User: Jonh, Age: 25, Msg: ignored_arg


// --- ARRAY FORMATTING ---

/**
 * Applies the format function to an array of templates.
 * @param templates An array of string templates.
 * @param args Arguments passed directly to the format function.
 * @returns An array of formatted strings.
 */
export function formatArray(
  templates: string[],
  ...args: FormatArg[]
): string[] {
  return templates.map(tpl => format(tpl, ...(args as any)));
}

/* --- FORMAT ARRAY USAGE EXAMPLE --- */
const arr = [
  "Hello %s!",
  "User {name} has interests {hobbies}",
  "List: {0}"
];

// const arrayResult = formatArray(arr, "Jonh", { name: "Jonh", hobbies: ["Game", "Code"] });
/*
arrayResult:
[
  "Hello Jonh!",
  "User Jonh has interests Game,Code",
  "List: Jonh"
]
*/

/**
 * C-style string formatting function. Supports %s, %d, %f with optional width and precision modifiers.
 * NOTE: This implementation does not support argument reordering (e.g., %2$s).
 * @param format The format string.
 * @param args Values for the format specifiers.
 * @returns The formatted string.
 */
export function sprintf(format: string, ...args: (string | number)[]): string {
  let i = 0;

  // Regex matches: %% or % [width] [.precision] [s|d|f]
  return format.replace(/%(%|(\d+)?(\.\d+)?[sdf])/g, (match, type) => {
    if (type === "%") return "%"; // handle %% → %

    const val = args[i++];
    const widthMatch = match.match(/%(\d+)/);
    const precisionMatch = match.match(/\.(\d+)/);

    const width = widthMatch ? parseInt(widthMatch[1], 10) : undefined;
    const precision = precisionMatch ? parseInt(precisionMatch[1], 10) : undefined;

    let str: string;

    if (match.endsWith("d")) { // %d (Integer)
      const num = parseInt(String(val), 10);
      str = isNaN(num) ? "0" : String(num);
    } else if (match.endsWith("f")) { // %f (Float)
      const num = parseFloat(String(val));
      if (isNaN(num)) {
        str = "0";
      } else {
        // Apply precision (toFixed automatically rounds)
        str = precision !== undefined ? num.toFixed(precision) : String(num);
      }
    } else { // %s (String, default)
      str = String(val);
    }

    // Padding if width is specified
    if (width && str.length < width) {
      // Pad with '0' if '0' is specified (e.g., %05d) and it's not a float, otherwise pad with ' '
      const padChar = match.includes("0") && !match.includes("f") ? "0" : " ";
      str = padChar.repeat(width - str.length) + str;
    }

    return str;
  });
}

/* --- SPRINTF USAGE EXAMPLES --- */
// console.log(sprintf("Hello %s, you are %d years old", "Jonh", 25)); // Hello Jonh, you are 25 years old
// console.log(sprintf("Progress: 10%% complete")); // Progress: 10% complete
// console.log(sprintf("Pi ≈ %.2f", Math.PI)); // Pi ≈ 3.14
// console.log(sprintf("Padded number: %05d", 42)); // Padded number: 00042
// console.log(sprintf("Align: %8s!", "Hi")); // Align:        Hi!

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units (powers of 1000). False to use
 * binary (IEC) units (powers of 1024).
 * @param dp Number of decimal places to display.
 *
 * @returns Formatted string (e.g., "1.2 MB" or "1.2 MiB").
 */
export function humanFileSize(bytes: number, si = false, dp = 1): string {
  const thresh = si ? 1000 : 1024;

  // Handle zero, negative, and small values
  if (Math.abs(bytes) < thresh) return bytes + ' B';

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  let u = -1;
  const r = 10 ** dp; // Multiplier for rounding

  do {
    bytes /= thresh;
    ++u;
    // The core logic ensures rounding is done at the current level before checking the next threshold
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
}

/* --- FILE SIZE USAGE EXAMPLES --- */
// console.log(humanFileSize(1234567, true));  // 1.2 MB (SI)
// console.log(humanFileSize(1234567, false)); // 1.2 MiB (IEC)
// console.log(humanFileSize(1023));          // 1023 B
// console.log(humanFileSize(1024, false));    // 1.0 KiB
// console.log(humanFileSize(1234567890123));  // 1.2 TB (SI default)

export { };