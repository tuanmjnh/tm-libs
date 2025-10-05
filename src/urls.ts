/**
 * ✅ Parse URL string → URL object (safe)
 */
export const getUrl = (val: string): URL | null => {
  try {
    return new URL(val);
  } catch {
    return null;
  }
};

/**
* 🔍 Match component URL (protocol, host, path, query, hash)
*/
export const matchUrl = (val: string): RegExpMatchArray | null => {
  if (!val) return null;
  const regex =
    /^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/;
  return val.match(regex);
};

/**
* 🔗 Find all URLs in string
*/
export const matchUrls = (val: string): string[] | null => {
  if (!val) return null;
  const regex = /\bhttps?:\/\/[^\s"'<>]+/gi;
  return val.match(regex);
};

/**
* 📁 Change local or remote path → canonical URL
* - Keep if schema (http, file, data) already exists
* - Change `C:\path\to\file` → `file:///C:/path/to/file`
*/
export const toURL = (path: string): string => {
  if (!path) return "";
  if (/^(file|https?|data):/.test(path)) return path;
  return "file://" + path.replace(/\\/g, "/");
};

/**
* 🧱 Convert system file path → safe URL (encoded)
* - Preserve `#`, `?`, spaces... in filenames
* - Support `C:\`, `D:\`, `/home/...`
*/
export const toFileURL = (filePath: string): string => {
  if (!filePath) return "";

  // Replace backslashes with slashes
  let urlPath = filePath.replace(/\\/g, "/");

  // If it is a Windows path (C:/...) then add "/"
  if (/^[a-zA-Z]:\//.test(urlPath)) {
    urlPath = "/" + urlPath;
  }

  const parts = urlPath.split("/");
  const fileName = parts.pop() || "";
  const safeFileName = encodeURIComponent(fileName);

  return "file://" + parts.join("/") + "/" + safeFileName;
};

export { };
