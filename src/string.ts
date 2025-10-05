/**
* Standardize and remove Vietnamese accents (using Unicode Normalization)
*/
export function normalize(str: string = ""): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
* Manually remove Vietnamese accents (suitable when you don't want to use normalize)
*/
export function removeAccents(str: string = ""): string {
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
* Convert accented string -> ASCII (underscore, remove special characters)
*/
export function convertToAscii(arg: string = ""): string {
  return arg
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[áàãạảâầấậẫẩăằắẵặẳ]/g, "a")
    .replace(/[èéẹẽẻêếềễểệ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i") // ⚙ sửa lỗi gốc bạn ghi nhầm 'e'
    .replace(/[òóõọỏôỗộồốổơỡờớợỡở]/g, "o")
    .replace(/[ùúụũủưừứựữử]/g, "u")
    .replace(/[ýỳỹỷỵ]/g, "y")
    .replace(/[đ]/g, "d")
    .replace(/[~`!@#$%^&*()\[\]{}\\|:'"<>.,?/”“‘’„‰‾–—]/g, "");
}

/**
* Converts a string with accents and special characters into a friendly slug (SEO-friendly)
*
* @example
* toSlug("I Love Vietnam!") → "toi-yeu-viet-nam"
*/
export function toSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize("NFD")                  // Separate Vietnamese accents
    .replace(/[\u0300-\u036f]/g, "")   // Remove the combination mark
    .replace(/đ/g, "d")                // Move →
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")      // Delete special characters
    .trim()
    .replace(/\s+/g, "-")              // Change spaces to "-"
    .replace(/-+/g, "-")               // Remove duplicate tiles
    .replace(/^-|-$/g, "");            // Cut the tiles at the beginning/end
}

/**
* Remove special characters (keep only letters, numbers and spaces)
*/
export function removeChars(arg: string = ""): string {
  return arg.replace(/[~`!@#$%^&*()\[\]{}\\|:'",<>./?]/g, "");
}

/**
* Convert HTML string to DOM Element (using document.createElement)
*/
export function toHtml(arg: string): HTMLElement | null {
  if (!arg) return null;
  const el = document.createElement("div");
  el.innerHTML = arg.trim();
  return el;
}

/**
* Trim specific characters from the end of a string (e.g. trimChars("abc,", ",") → "abc")
*/
export function trimChars(arg: string = "", char: string): string {
  const regx = new RegExp(char + "$", "g");
  return arg.replace(regx, "");
}

/**
* Split string in square brackets [...]:
* - include = true: return both "[a]" (including brackets)
* - include = false: return only "a"
*/
export function splitBrackets(val: string = "", include = false): string[] {
  try {
    const pattern = include ? /\[[^\]]*\]/g : /(?<=\[)[^\]\[\r\n]*(?=\])/g;
    const result = val.trim().match(pattern);
    return result ?? [];
  } catch {
    return [];
  }
}

export { };
