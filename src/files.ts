// --- FILE INPUT & UPLOAD UTILITIES ---

interface InputOptions {
  multiple?: boolean;
  accept?: string;
  webkitdirectory?: boolean;
}

/**
 * Creates a raw HTML file input element with specified options.
 * @param opts Configuration options for the input element.
 * @returns The created HTMLInputElement.
 */
export const createFileInputElement = (opts: InputOptions = {}): HTMLInputElement => {
  const _opts: Required<InputOptions> = {
    multiple: false,
    accept: '*',
    webkitdirectory: false,
    ...opts,
  };
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = _opts.multiple;
  input.accept = _opts.accept;
  // @ts-ignore: webkitdirectory is non-standard but widely used
  input.webkitdirectory = _opts.webkitdirectory;
  return input;
};

/**
 * Uploads a file using the XMLHttpRequest (XHR) mechanism.
 * Note: This function always resolves true after the request is sent,
 * but does NOT wait for the server response (resolve, reject, progress).
 * Use fetch/axios for production-ready upload handling.
 * @param url The target upload URL.
 * @param file The File object to upload.
 * @param onLoad Optional callback for when the FileReader finishes reading the file.
 * @returns A Promise that resolves immediately after the request is SENT.
 */
export const XMLHttpRequestUploadFile = (url: string, file: File, onLoad?: (event: ProgressEvent<FileReader>) => void): Promise<boolean> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (onLoad) onLoad(e);

      const buffer = e.target?.result as ArrayBuffer;
      const blob = new Blob([buffer], { type: file.type });
      const formData = new FormData();

      // Use the file's original name for better compatibility
      formData.append("webmasterfile", blob, file.name);

      const request = new XMLHttpRequest();
      request.open("POST", url);
      request.send(formData);

      // Resolves after send() is called, not on server completion
      resolve(true);
    };
  });
};

/**
 * Converts a File object into a base64 string (Data URL).
 * @param file The File object.
 * @returns A Promise resolving with the base64 Data URL string.
 */
export const getBase64InputFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      resolve(e.target?.result as string);
    };

    reader.onerror = (e: ProgressEvent<FileReader>) => {
      reject(new Error(`Error reading file ${file.name}: ${e.target?.error}`));
    };

    reader.readAsDataURL(file);
  });
};


// --- IMAGE PROCESSING UTILITIES ---

/**
 * Converts an HTMLImageElement to a base64 Data URL using a Canvas.
 * This is useful for redrawing/resizing images or ensuring a specific format (e.g., 'image/png').
 * @param img The HTMLImageElement to convert.
 * @param mimeType The desired output MIME type. Defaults to 'image/png'.
 * @returns The base64 Data URL string.
 */
export const getBase64Image = (img: HTMLImageElement, mimeType: string = 'image/png'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width; // Use natural dimensions for accuracy
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0);

  // Use toDataURL for conversion
  return canvas.toDataURL(mimeType);
};

/**
 * Reads a File object and converts it to either an HTMLImageElement or a base64 string
 * after processing through getBase64Image.
 * @param file The File object.
 * @param returnImage If true, resolves with the HTMLImageElement; otherwise, resolves with the processed base64 string.
 * @returns A Promise resolving with an HTMLImageElement or a base64 string.
 */
export const getFileImage = (file: File, returnImage: boolean): Promise<HTMLImageElement | string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // 1. Read the file as Data URL
    reader.readAsDataURL(file);

    reader.onload = () => {
      const img = document.createElement('img');
      img.src = reader.result as string;

      // 2. Wait for the image to load before resolving or processing
      img.onload = () => {
        if (returnImage) {
          resolve(img);
        } else {
          // Processed image (defaults to image/png base64)
          resolve(getBase64Image(img));
        }
      };

      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Alias for getFileImage(file, false) that processes the image to base64.
 * @param file The File object.
 * @returns A Promise resolving with the base64 string (processed through Canvas).
 */
export function GetImage(file: File): Promise<string> {
  return getFileImage(file, false) as Promise<string>;
}

/**
 * Alias for getBase64Image, renamed for clarity.
 * @param img The HTMLImageElement.
 * @returns The base64 Data URL string from the Canvas conversion.
 */
export function GetBase64Image(img: HTMLImageElement): string {
  return getBase64Image(img);
}

// Simple background style generator
export function getBackgroundImage(img: string | null): string | null {
  if (!img) return null;
  // Use CSS custom properties or return style string
  return `background-size:cover;background-position:50% 50%;background-image:url("${img}")`;
}


// --- FILE PATH & EXTENSION UTILITIES ---

interface FilePathInfo {
  fullPath: string;
  dirPath: string | null;
  fileName: string | null;
  fileNameNoExt: string | null;
  extension: string | null;
}

/**
 * Parses a file path (local or remote URL) into its components.
 * @param path The file path string.
 * @returns An object containing the path components, or null if the path is invalid.
 */
export const parseFilePath = (path: string | null): FilePathInfo | null => {
  if (!path) return null;

  try {
    // 1. Sanitize the path for URL query parameters (important for remote files)
    const cleanPath = path.split('?')[0];

    // 2. Normalize and split by / or \
    const parts = cleanPath.split(/[/\\]/);

    // Pop the last part (potential filename)
    const fileName = parts.pop() || null;

    // Rejoin the rest for directory path
    const dirPath = parts.length > 0 && parts[parts.length - 1] !== '' ? parts.join("/") : null;

    if (!fileName) {
      return { fullPath: path, dirPath, fileName: null, fileNameNoExt: null, extension: null };
    }

    // 3. Separate name and extension using a safer regex
    const extIndex = fileName.lastIndexOf('.');

    if (extIndex <= 0) { // No extension (e.g., ".bashrc" or "README")
      return {
        fullPath: path,
        dirPath,
        fileName,
        fileNameNoExt: fileName,
        extension: null
      };
    }

    const fileNameNoExt = fileName.slice(0, extIndex);
    // Remove the leading dot from the extension
    const extension = fileName.slice(extIndex + 1) || null;

    return {
      fullPath: path,
      dirPath,
      fileName,
      fileNameNoExt,
      extension
    };
  } catch (e) {
    console.error("[parseFilePath] Error:", e);
    return null;
  }
};

/**
 * Extracts the full file name (including extension) from a path.
 * @param path The file path string.
 * @returns The file name or null.
 */
export const getFileName = (path: string | null): string | null => {
  const info = parseFilePath(path);
  return info?.fileName || null;
};

/**
 * Extracts the file name without its extension from a path.
 * @param path The file path string.
 * @returns The file name without extension or null.
 */
export const getFileNameWithoutExtention = (path: string | null): string | null => {
  const info = parseFilePath(path);
  return info?.fileNameNoExt || null;
};

/**
 * Extracts the file extension from a path or file name.
 * @param file The file path or name string.
 * @param dot If true, includes the leading dot (e.g., '.png').
 * @param lower If true, returns the extension in lowercase.
 * @returns The file extension string or null.
 */
export function getExtension(file: string | null, dot: boolean = true, lower: boolean = true): string | null {
  if (!file) return null;

  // Use parseFilePath for robust extraction
  const info = parseFilePath(file);
  let ext = info?.extension;

  if (!ext) return dot ? '' : null; // Return '' if dot is true, otherwise null for no extension

  if (lower) {
    ext = ext.toLowerCase();
  }

  return dot ? `.${ext}` : ext;
}

/**
 * Alias for getFileName.
 */
export function getNameFilePath(fileName: string | null): string | null {
  return getFileName(fileName);
}


// --- FILE TYPE CHECKERS ---

// Standardized list of common extensions for better maintainability

export const extensionPatterns = {
  image: /\.(gif|jpg|jpe?g|tiff|png|img|ico|jfif|webp|bmp|svg)$/i, // Added svg
  audio: /\.(mp3|wav|wave|ogg|m4a|3ga|4mp|aa3|flac|aac)$/i, // Added flac, aac
  video: /\.(3g2|3gp|3gp2|3gpp|3gpp2|amv|flv|gom|mp4|mov|mpe|mpeg|mpg|kmv|mkv|wvm|wmv|webm)$/i, // Added webm
  pdf: /\.(pdf)$/i,
  doc: /\.(doc|docx|odt)$/i, // Added odt
  sheet: /\.(xls|xlsx|csv|ods)$/i, // Added csv, ods
  flash: /\.(swf)$/i,
  code: /\.(sql|json|js|ts|jsx|tsx|html|css|scss|less|xml|py|java|c|cpp|php)$/i, // Expanded code list
  text: /\.(txt|rtf|md|log|ini|cfg)$/i // Added common text formats
};

const checkFileType = (value: string | null, pattern: RegExp): boolean => {
  if (!value) return false;
  // Get extension from the path, then test against the pattern
  const ext = getExtension(value, true, true); // Get lowercase extension with dot
  if (!ext) return false;
  return pattern.test(ext);
};

export function isImage(value: string | null): boolean {
  return checkFileType(value, extensionPatterns.image);
}
export function isAudio(value: string | null): boolean {
  return checkFileType(value, extensionPatterns.audio);
}
export function isVideo(value: string | null): boolean {
  return checkFileType(value, extensionPatterns.video);
}
export function isPdf(value: string | null): boolean {
  return checkFileType(value, extensionPatterns.pdf);
}
export function isDoc(value: string | null): boolean {
  return checkFileType(value, extensionPatterns.doc);
}
export function isSheet(value: string | null): boolean {
  return checkFileType(value, extensionPatterns.sheet);
}
export function isFlash(value: string | null): boolean {
  return checkFileType(value, extensionPatterns.flash);
}
export function isCode(value: string | null): boolean {
  return checkFileType(value, extensionPatterns.code);
}
export function isText(value: string | null): boolean {
  return checkFileType(value, extensionPatterns.text);
}


// --- ASYNC FILE PROCESSING ---

interface UploadedFileInfo {
  originalName: string;
  fileName: string;
  url: string; // Base64 Data URL
}

/**
 * Processes files from a FormData object, converting them to Base64 Data URLs.
 * @param formData The FormData object containing files.
 * @param field The field name where the files are stored (e.g., 'photos').
 * @returns A Promise resolving to an array of processed file info objects.
 */
export async function uploadFormData(formData: FormData, field: string): Promise<UploadedFileInfo[]> {
  const files = formData.getAll(field) as File[];

  // Filter out any non-File entries that might be in the FormData (though rare)
  const filePromises = files
    .filter((f): f is File => f instanceof File)
    .map(async (file) => {
      try {
        const base64 = await getBase64InputFile(file);
        return {
          originalName: file.name,
          fileName: file.name,
          url: base64, // base64 string
        };
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error);
        return null; // Return null for failed files
      }
    });

  const results = await Promise.all(filePromises);
  // Filter out any null results from failed file processing
  return results.filter((r): r is UploadedFileInfo => r !== null);
}

export { };