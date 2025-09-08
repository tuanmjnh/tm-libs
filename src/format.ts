type Primitive = string | number | boolean;

// Overload signatures
export function format(template: string, ...args: Primitive[]): string;
export function format(template: string, values: Record<string, Primitive>): string;
export function format(template: string, ...args: [...Primitive[], Record<string, Primitive>]): string;

// Implementation
export function format(
  template: string,
  ...args: (Primitive | Record<string, Primitive>)[]
): string {
  let result = template;
  // If the last parameter is object → use for {key}
  const lastArg = args[args.length - 1];
  const hasObject = lastArg && typeof lastArg === "object" && !Array.isArray(lastArg);

  if (hasObject) {
    const obj = lastArg as Record<string, Primitive>;
    for (const key in obj) {
      const regexp = new RegExp(`\\{${key}\\}`, "gi");
      result = result.replace(regexp, String(obj[key]));
    }
    args = args.slice(0, -1); // remove object from args
  }

  // Replace {0}, {1}, ...
  result = result.replace(/{(\d+)}/g, (match, index) => {
    const i = Number(index);
    return i < args.length ? String(args[i]) : match;
  });

  // Replace %s in order
  for (const value of args) {
    result = result.replace(/%s/, String(value));
  }

  return result;
}
/**
✅ Use %s
const a = format("Hello %s, you have %s messages", "Jonh", 5);

✅ Use {0}, {1}
const b = format("Hello {0}, you have {1} messages", "Jonh", 5);

✅ Use {key}
const c = format("Hello {name}, age {age}", { name: "Jonh", age: 25 });

✅ Mix %s + {key} + {0}
const d = format("User: %s, Age: {age}, Msg: {0}", "Jonh", "ignored", { age: 25 });

❌ False (TypeScript will report an error)
const e = format("Hello {name}", "Jonh");
*/

export function formatArray(
  templates: string[],
  ...args: (Primitive | Record<string, Primitive>)[]
): string[] {
  return templates.map(tpl => format(tpl, ...(args as any)));
}
/**
const arr = [
  "Hello %s!",
  "User {name} has interest {hobbies}",
  "List: {0}"
];

console.log(
  formatArray(arr, "Jonh", { name: "Jonh", hobbies: ["Game", "Code"] })
);
 */

export function sprintf(format: string, ...args: (string | number)[]): string {
  let i = 0;

  return format.replace(/%(%|(\d+)?(\.\d+)?[sdf])/g, (match, type) => {
    if (type === "%") return "%"; // handle %% → %

    const val = args[i++];
    const widthMatch = match.match(/%(\d+)/);
    const precisionMatch = match.match(/\.(\d+)/);

    const width = widthMatch ? parseInt(widthMatch[1], 10) : undefined;
    const precision = precisionMatch ? parseInt(precisionMatch[1], 10) : undefined;

    let str: string;

    if (match.endsWith("d")) {
      const num = parseInt(String(val), 10);
      str = isNaN(num) ? "0" : String(num);
    } else if (match.endsWith("f")) {
      const num = parseFloat(String(val));
      if (isNaN(num)) {
        str = "0";
      } else {
        str = precision !== undefined ? num.toFixed(precision) : String(num);
      }
    } else {
      str = String(val); // %s
    }

    // Padding if width
    if (width && str.length < width) {
      const padChar = match.includes("0") && !match.includes(".") ? "0" : " ";
      str = padChar.repeat(width - str.length) + str;
    }

    return str;
  });
}

/**
console.log(sprintf("Hello %s, you are %d years old", "Jonh", 25));
// 👉 "Hello Jonh, you are 25 years old"

console.log(sprintf("Progress: 10%% complete"));
// 👉 "Progress: 10% complete"

console.log(sprintf("Pi ≈ %.2f", Math.PI));
// 👉 "Pi ≈ 3.14"

console.log(sprintf("Padded number: %05d", 42));
// 👉 "Padded number: 00042"

console.log(sprintf("Align: %8s!", "Hi"));
// 👉 "Align:       Hi!"
 */


/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) return bytes + ' B'

  const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return bytes.toFixed(dp) + ' ' + units[u]
}
