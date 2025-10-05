"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = exports.normalizePath = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/*
\ (backslash)
/ (forward slash)
*/
const normalizePath = (path) => {
    return path.replace(/\\/g, "/");
};
exports.normalizePath = normalizePath;
// ================= Helpers =================
function normalizeExtensions(extensions) {
    if (!extensions)
        return undefined;
    return extensions.map((e) => e.startsWith(".") ? e.toLowerCase() : `.${e.toLowerCase()}`);
}
function matchExtension(file, extensions) {
    if (!extensions || extensions.length === 0)
        return true;
    const ext = path.extname(file).toLowerCase();
    return extensions.includes(ext);
}
// ================= FileManager =================
class FileManager {
    // ===== buildStat =====
    static buildStat(fullPath, isSlashPath) {
        const stat = fs.statSync(fullPath);
        return {
            name: path.basename(fullPath),
            fullPath: isSlashPath ? (0, exports.normalizePath)(fullPath) : fullPath,
            isFile: stat.isFile(),
            isDirectory: stat.isDirectory(),
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            birthtime: stat.birthtime,
        };
    }
    static buildStatFromStat(fullPath, stat, isSlashPath) {
        return {
            name: path.basename(fullPath),
            fullPath: isSlashPath ? (0, exports.normalizePath)(fullPath) : fullPath,
            isFile: stat.isFile(),
            isDirectory: stat.isDirectory(),
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            birthtime: stat.birthtime,
        };
    }
    // ===== File operations (sync) =====
    static readFile(filePath, encoding = "utf-8") {
        return fs.readFileSync(filePath, { encoding });
    }
    static writeFile(filePath, data, encoding = "utf-8") {
        fs.writeFileSync(filePath, data, { encoding });
    }
    static appendFile(filePath, data, encoding = "utf-8") {
        fs.appendFileSync(filePath, data, { encoding });
    }
    static exists(filePath) {
        return fs.existsSync(filePath);
    }
    static deleteFile(filePath) {
        if (this.exists(filePath))
            fs.unlinkSync(filePath);
    }
    static readJSON(filePath) {
        try {
            const content = this.readFile(filePath);
            return JSON.parse(content);
        }
        catch (_a) {
            return null;
        }
    }
    static writeJSON(filePath, obj, space = 2) {
        const json = JSON.stringify(obj, null, space);
        this.writeFile(filePath, json);
    }
    static createFolder(dirPath) {
        if (!this.exists(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    static rename(oldPath, newPath) {
        fs.renameSync(oldPath, newPath);
    }
    static copyFile(src, dest) {
        fs.copyFileSync(src, dest);
    }
    static copyFolder(src, dest) {
        this.createFolder(dest);
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                this.copyFolder(srcPath, destPath);
            }
            else {
                this.copyFile(srcPath, destPath);
            }
        }
    }
    // ===== getTree (sync) =====
    static getTree(dirPath, options, currentDepth = 1) {
        const { extensions, exclude, depth = 2 } = options || {};
        const stat = this.buildStat(dirPath, options === null || options === void 0 ? void 0 : options.isSlashPath);
        const baseName = path.basename(dirPath);
        if (exclude && exclude.includes(baseName))
            return null;
        const node = Object.assign(Object.assign({}, stat), { type: stat.isDirectory ? "folder" : "file" });
        if (stat.isDirectory && (depth === 0 || currentDepth < depth)) {
            const items = fs.readdirSync(dirPath);
            node.children = items
                .map((item) => this.getTree(path.join(dirPath, item), options, currentDepth + 1))
                .filter((child) => {
                if (!child)
                    return false;
                if (child.type === "file") {
                    return matchExtension(child.fullPath, normalizeExtensions(extensions));
                }
                return true;
            });
        }
        return node;
    }
    // ===== flatten helper =====
    static flattenTree(node) {
        if (!node)
            return [];
        const result = [node];
        if (node.type === "folder" && node.children) {
            result.push(...node.children.flatMap((child) => this.flattenTree(child)));
        }
        return result;
    }
    // ===== list methods (sync) =====
    static listFiles(dirPath, options) {
        return this.flattenTree(this.getTree(dirPath, options)).filter((n) => n.type === "file");
    }
    static listFolders(dirPath, options) {
        return this.flattenTree(this.getTree(dirPath, options)).filter((n) => n.type === "folder");
    }
    static listAll(dirPath, options) {
        return this.flattenTree(this.getTree(dirPath, options));
    }
    static listFileNames(dirPath, options) {
        return this.listFiles(dirPath, options).map((n) => n.name);
    }
    static listFolderNames(dirPath, options) {
        return this.listFolders(dirPath, options).map((n) => n.name);
    }
    static listAllNames(dirPath, options) {
        return this.listAll(dirPath, options).map((n) => n.name);
    }
    // ===== listFlat (sync) =====
    static listFlat(dirPath, options) {
        return this.listAll(dirPath, options);
    }
    // ===== Async versions =====
    static readFileAsync(filePath_1) {
        return __awaiter(this, arguments, void 0, function* (filePath, encoding = "utf-8") {
            return yield fs.promises.readFile(filePath, { encoding });
        });
    }
    static writeFileAsync(filePath_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (filePath, data, encoding = "utf-8") {
            yield fs.promises.writeFile(filePath, data, { encoding });
        });
    }
    static appendFileAsync(filePath_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (filePath, data, encoding = "utf-8") {
            yield fs.promises.appendFile(filePath, data, { encoding });
        });
    }
    static existsAsync(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.promises.access(filePath);
                return true;
            }
            catch (_a) {
                return false;
            }
        });
    }
    static deleteFileAsync(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.existsAsync(filePath)) {
                yield fs.promises.unlink(filePath);
            }
        });
    }
    static readJSONAsync(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield this.readFileAsync(filePath);
                return JSON.parse(content);
            }
            catch (_a) {
                return null;
            }
        });
    }
    static writeJSONAsync(filePath_1, obj_1) {
        return __awaiter(this, arguments, void 0, function* (filePath, obj, space = 2) {
            const json = JSON.stringify(obj, null, space);
            yield this.writeFileAsync(filePath, json);
        });
    }
    static createFolderAsync(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.existsAsync(dirPath))) {
                yield fs.promises.mkdir(dirPath, { recursive: true });
            }
        });
    }
    static renameAsync(oldPath, newPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.promises.rename(oldPath, newPath);
        });
    }
    static copyFileAsync(src, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.promises.copyFile(src, dest);
        });
    }
    static copyFolderAsync(src, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createFolderAsync(dest);
            const entries = yield fs.promises.readdir(src, { withFileTypes: true });
            for (const entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);
                if (entry.isDirectory()) {
                    yield this.copyFolderAsync(srcPath, destPath);
                }
                else {
                    yield this.copyFileAsync(srcPath, destPath);
                }
            }
        });
    }
    // ===== getTreeAsync =====
    static getTreeAsync(dirPath_1, options_1) {
        return __awaiter(this, arguments, void 0, function* (dirPath, options, currentDepth = 1) {
            const { extensions, exclude, depth = 2 } = options || {};
            const stat = yield fs.promises.stat(dirPath);
            const baseName = path.basename(dirPath);
            if (exclude && exclude.includes(baseName))
                return null;
            const node = Object.assign({ type: stat.isDirectory() ? "folder" : "file" }, this.buildStatFromStat(dirPath, stat, options === null || options === void 0 ? void 0 : options.isSlashPath));
            if (stat.isDirectory() && (depth === 0 || currentDepth < depth)) {
                const items = yield fs.promises.readdir(dirPath);
                const children = yield Promise.all(items.map((item) => this.getTreeAsync(path.join(dirPath, item), options, currentDepth + 1)));
                node.children = children.filter((child) => {
                    if (!child)
                        return false;
                    if (child.type === "file") {
                        return matchExtension(child.fullPath, normalizeExtensions(extensions));
                    }
                    return true;
                });
            }
            return node;
        });
    }
    // ===== list methods (async) =====
    static listFilesAsync(dirPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.flattenTree(yield this.getTreeAsync(dirPath, options)).filter((n) => n.type === "file");
        });
    }
    static listFoldersAsync(dirPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.flattenTree(yield this.getTreeAsync(dirPath, options)).filter((n) => n.type === "folder");
        });
    }
    static listAllAsync(dirPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.flattenTree(yield this.getTreeAsync(dirPath, options));
        });
    }
    static listFileNamesAsync(dirPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.listFilesAsync(dirPath, options)).map((n) => n.name);
        });
    }
    static listFolderNamesAsync(dirPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.listFoldersAsync(dirPath, options)).map((n) => n.name);
        });
    }
    static listAllNamesAsync(dirPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.listAllAsync(dirPath, options)).map((n) => n.name);
        });
    }
    // ===== listFlatAsync =====
    static listFlatAsync(dirPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.listAllAsync(dirPath, options));
        });
    }
}
exports.FileManager = FileManager;
