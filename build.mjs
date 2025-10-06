// build.mjs
import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { execSync } from "child_process"; // 👈 Thêm để chạy lệnh tsc

const require = createRequire(import.meta.url);
// ❌ Loại bỏ npm-dts: const { Generator } = require("npm-dts");

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const { dependencies = {} } = pkg;

// 🧹 Xóa dist cũ
if (fs.existsSync("./dist")) {
  fs.rmSync("./dist", { recursive: true, force: true });
  console.log("🧹 Removed old dist folder");
}

const sharedConfig = {
  bundle: true,
  minify: true,
  sourcemap: false,
  target: "esnext",
  platform: "node", // 👈 FIX 1: Đổi sang "node"
  format: "esm",
  external: Object.keys(dependencies),
};

// 📦 Build từng file .ts
async function buildFile(entry) {
  const srcPath = `src/${entry}.ts`;
  if (!fs.existsSync(srcPath)) return;

  const outFile = `dist/${entry}.js`;
  console.log(`📦 Building: ${entry}.ts`);

  await build({
    ...sharedConfig,
    entryPoints: [srcPath],
    outfile: outFile,
  });

  console.log(`✅ Built: ${entry}.js`);
}

// 📂 Quét toàn bộ file .ts trong src/
function getSourceFiles() {
  return fs
    .readdirSync("./src")
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.replace(/\.ts$/, ""));
}

// 🧩 Build toàn bộ
async function buildAll() {
  fs.mkdirSync("./dist", { recursive: true });

  const libs = getSourceFiles();

  // 🏗 Build từng file riêng
  for (const lib of libs) {
    await buildFile(lib);
  }

  // 🧱 Tạo index.js & index.d.ts tự động
  generateIndexFile(libs);

  // 📝 Cập nhật package.json
  updatePackageJson();

  // ⚙️ FIX 2: Tạo tất cả file .d.ts bằng TSC
  console.log("⚙️ Generating declaration files (.d.ts) with TSC...");
  execSync("tsc --emitDeclarationOnly", { stdio: "inherit" });
  console.log("✅ Declarations generated successfully.");

  // 📝 FIX 3: Copy package.json vào dist cho lệnh publish:lib
  // fs.copyFileSync("./package.json", "./dist/package.json");
  // console.log("📋 Copied package.json to dist/");
  // (Bạn có thể thêm copy README.md tại đây nếu cần)

  console.log("🎉 Build hoàn tất!");
}

// 🧱 Tạo index.js và index.d.ts
function generateIndexFile(modules) {
  const jsContent = modules
    .map((name) => `export * as ${camelCase(name)} from "./${name}.js";`)
    .join("\n");

  // Index.d.ts sẽ được tạo đầy đủ bởi TSC, đây là template
  const dtsContent = modules
    .map((name) => `export * from "./${name}";`)
    .join("\n");

  fs.writeFileSync("./dist/index.js", jsContent);
  fs.writeFileSync("./dist/index.d.ts", dtsContent);
  console.log("🧩 Generated index.js & index.d.ts (template)");
}

// 📝 Cập nhật package.json (cần thiết nếu script bị đổi)
function updatePackageJson() {
  const pkgPath = "./package.json";
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  pkg.files = ["dist", "README.md"];
  pkg.main = "dist/index.js";
  pkg.module = "dist/index.js";
  pkg.types = "dist/index.d.ts";

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("📦 Updated package.json → main/module/types");
}

// 🐪 camelCase helper
function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// 🚀 Run
await buildAll();