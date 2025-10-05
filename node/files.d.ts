export declare const HTMLInputElementFile: (opts: any) => HTMLInputElement;
export declare const XMLHttpRequestUploadFile: (url: string, file: File, onLoad?: Function) => Promise<unknown>;
export declare const getFileImage: (file: File, isImage: boolean) => Promise<unknown>;
export declare const getBase64InputFile: (file: File) => Promise<unknown>;
export declare const getBase64Image: (img: HTMLImageElement) => string;
interface FilePathInfo {
    fullPath: string;
    dirPath: string | null;
    fileName: string | null;
    fileNameNoExt: string | null;
    extension: string | null;
}
export declare const parseFilePath: (path: string | null) => FilePathInfo | null;
export declare const getFileName: (path: string | null) => string | null;
export declare const getFileNameWithoutExtention: (path: string | null) => string | null;
export declare function getExtension(file: string | null, dot?: boolean, lower?: boolean): string | null;
export declare function isImage(value: string | null): boolean;
export declare function isAudio(value: string | null): boolean;
export declare function isVideo(value: string | null): boolean;
export declare function isPdf(value: string | null): boolean;
export declare function isDoc(value: string | null): boolean;
export declare function isSheet(value: string | null): boolean;
export declare function isFlash(value: string | null): boolean;
export declare function isCode(value: string | null): boolean;
export declare function isText(value: string | null): boolean;
export declare function getNameFilePath(fileName: string | null): string | null;
export declare function getBackgroundImage(img: string | null): string | null;
export declare function GetImage(file: File): Promise<unknown>;
export declare function GetBase64Image(img: HTMLImageElement): string;
export declare function uploadFormData(formData: FormData, field: string): Promise<{
    originalName: string;
    fileName: string;
    url: unknown;
}[]>;
export {};
