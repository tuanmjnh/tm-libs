// build.mjs
import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { Generator } = require("npm-dts");

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const { dependencies = {} } = pkg;

const sharedConfig = {
  bundle: true,
  minify: true,
  sourcemap: false,
  target: "esnext",
  external: Object.keys(dependencies),
};

// 📦 Build từng file .ts
async function buildFile(entry, options = {}) {
  const srcPath = `src/${entry}.ts`;
  if (!fs.existsSync(srcPath)) return;

  const outFile = `dist/${entry}.js`;
  console.log(`📦 Building: ${entry}.ts`);

  await build({
    ...sharedConfig,
    entryPoints: [srcPath],
    outfile: outFile,
    platform: options.platform || "neutral",
    format: options.format || "esm",
  });

  await new Generator({
    entry: srcPath,
    output: `dist/${entry}.d.ts`,
  }).generate();

  console.log(`✅ Built: ${entry}.js + ${entry}.d.ts`);
}

// 📂 Quét toàn bộ file .ts trong src/
function getSourceFiles() {
  return fs
    .readdirSync("./src")
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.replace(/\.ts$/, ""));
}

// 🧩 Build toàn bộ lib
async function buildAll() {
  fs.mkdirSync("./dist", { recursive: true });

  const libs = getSourceFiles();

  // 🏗 Nếu có index.ts → build riêng
  if (libs.includes("index")) {
    await buildFile("index", { platform: "neutral", format: "esm" });

    await build({
      ...sharedConfig,
      entryPoints: ["src/index.ts"],
      outfile: "dist/index.cjs",
      platform: "node",
      format: "cjs",
    });
  } else {
    // 🚀 Nếu KHÔNG có index.ts → Tự sinh file index.js + index.d.ts
    await generateIndexFile(libs);
  }

  // ⚙️ Build từng module riêng
  for (const lib of libs.filter((f) => f !== "index")) {
    await buildFile(lib, { platform: "node", format: "cjs" });
  }

  // 🧪 Tạo file test.ts
  createTestFile(libs);

  // 📝 Cập nhật package.json
  updatePackageJson();

  // 📘 Copy README.md
  // copyReadme();

  console.log("🎉 Build hoàn tất!");
}

// 🧪 Tạo test file
function createTestFile(modules) {
  fs.mkdirSync("./test", { recursive: true });

  const importLines = modules
    .map((name) => `import * as ${camelCase(name)} from "../dist/${name}.js";`)
    .join("\n");

  const exportLines = modules.map((name) => `  ${camelCase(name)},`).join("\n");

  const content = `// ⚡️ Auto-generated test file
${importLines}

console.log("✅ Test loaded modules:", {
${exportLines}
});
`;

  fs.writeFileSync("./test/test.ts", content);
  console.log("🧪 Generated test.ts for quick import testing");
}

// 🧱 Tự sinh file index.js và index.d.ts
function generateIndexFile(modules) {
  const imports = modules
    .map((name) => `export * as ${camelCase(name)} from "./${name}.js";`)
    .join("\n");

  const dts = modules
    .map((name) => `export * as ${camelCase(name)} from "./${name}.js";`)
    .join("\n");

  fs.writeFileSync("./dist/index.js", imports);
  fs.writeFileSync("./dist/index.d.ts", dts);

  console.log("🧩 Auto-generated index.js & index.d.ts");
}

// 📝 Cập nhật package.json
function updatePackageJson() {
  const pkgPath = "./package.json";
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  const distFiles = fs
    .readdirSync("./dist")
    .filter((f) => f.endsWith(".js") || f.endsWith(".d.ts"))
    .map((f) => `dist/${f}`);

  pkg.files = Array.from(new Set(["dist", "README.md"])).sort(); //...distFiles,
  pkg.main = "dist/index.cjs";
  pkg.module = "dist/index.js";
  pkg.types = "dist/index.d.ts";

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("📦 Updated package.json → files, main/module/types");
}

// 📋 Copy README.md
// function copyReadme() {
//   const src = "./README.md";
//   const dest = "./dist/README.md";
//   if (fs.existsSync(src)) {
//     fs.copyFileSync(src, dest);
//     console.log("📘 Copied README.md → dist/");
//   } else {
//     console.warn("⚠️ README.md not found, skipped copy.");
//   }
// }

// 🐪 camelCase helper
function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// 🚀 Run
await buildAll();
