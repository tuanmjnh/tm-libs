export const pathNormalize = (path: string) => {
  return path.replace(/\\/g, "/");
}

/**
* 🔤 Normalize and remove Vietnamese accents using Unicode normalization
* → Keep the text format, only remove Vietnamese accents
*/
export function viNormalize(str: string = ""): string {
  return str
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * 🧭 Remove Vietnamese accents manually (fallback if normalize() unavailable)
 */
export function viRemoveAccents(str: string = ""): string {
  const accentsMap = [
    "aàảãáạăằẳẵắặâầẩẫấậ",
    "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
    "dđ", "DĐ",
    "eèẻẽéẹêềểễếệ",
    "EÈẺẼÉẸÊỀỂỄẾỆ",
    "iìỉĩíị", "IÌỈĨÍỊ",
    "oòỏõóọôồổỗốộơờởỡớợ",
    "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
    "uùủũúụưừửữứự",
    "UÙỦŨÚỤƯỪỬỮỨỰ",
    "yỳỷỹýỵ", "YỲỶỸÝỴ",
  ];

  for (const map of accentsMap) {
    const base = map[0];
    const regex = new RegExp("[" + map.slice(1) + "]", "g");
    str = str.replace(regex, base);
  }

  return str;
}

/**
* 🔠 Convert accented string → lowercase ASCII (snake_case, remove specials)
* Example: "Điện Thoại iPhone 15 Pro!" → "dien_thoai_iphone_15_pro"
*/
export function viToAscii(str: string = ""): string {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_");
}

/**
 * 🌐 Convert to SEO-friendly slug
 * Example: "I Love Việt Nam!" → "i-love-viet-nam"
 */
export function viToSlug(str: string = ""): string {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD') // Separate accents from characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[đĐ]/g, 'd') // Convert đ -> d
    .replace(/([^0-9a-z-\s])/g, '') // Remove special characters
    .replace(/(\s+)/g, '-') // Convert spaces to dashes
    .replace(/-+/g, '-') // Remove excess dashes
    .replace(/^-+|-+$/g, ''); // Remove terminal dashes
}

/**
 * 🚫 Remove all special characters (keep letters, numbers, and spaces)
 */
export function removeSpecialChars(str: string = ""): string {
  return str.replace(/[~`!@#$%^&*()\[\]{}\\|:'",<>./?]/g, "");
}

/**
 * 🚫 Remove invalid folder characters (Windows-safe filenames)
 */
export function removeInvalidPathChars(str: string = ""): string {
  // < > : " / \ | ? *
  return str.replace(/[<>:"/\\|?*]/g, "");
}

/**
 * 🧱 Convert an HTML string to DOM Element
 */
export function htmlToElement(html: string): HTMLElement | null {
  if (!html) return null;
  const el = document.createElement("div");
  el.innerHTML = html.trim();
  return el.firstElementChild as HTMLElement;
}

/**
 * ✂️ Trim specific characters from the end of a string
 * Example: trimEndChars("abc,", ",") → "abc"
 */
export function trimEndChars(str: string = "", char: string): string {
  const regx = new RegExp(`${char}+$`);
  return str.replace(regx, "");
}

/**
 * 🔍 Extract content within square brackets
 * @param include - whether to include the brackets themselves
 * Example: splitBrackets("abc [123] def", false) → ["123"]
 */
export function extractSquareBrackets(val: string = "", include = false): string[] {
  try {
    const pattern = include ? /\[[^\]]*\]/g : /(?<=\[)[^\]\[\r\n]*(?=\])/g;
    return val.trim().match(pattern) ?? [];
  } catch {
    return [];
  }
}

/**
 * 🧩 Capitalize the first character
 */
export function toUpperCaseFirst(str: string = ""): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

/**
 * 🔡 Lowercase the first character
 */
export function toLowerCaseFirst(str: string = ""): string {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : str;
}

/**
 * 🧠 Capitalize each word (Title Case)
 */
export function toUpperCaseWords(str: string = ""): string {
  return str
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * 🔠 Lowercase each word (first letter only lowercase)
 */
export function toLowerCaseWords(str: string = ""): string {
  return str
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toLowerCase() + word.slice(1))
    .join(" ");
}

export { };