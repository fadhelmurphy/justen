import terser from "@rollup/plugin-terser";
import { readdirSync, existsSync, mkdirSync, statSync } from "fs";
import path from "path";

const rootPackagesDir = path.resolve("./packages");
const folder = process.env.FOLDER;

function getEntryFile(packagePath) {
  const files = readdirSync(packagePath);
  return files.find((f) => f === "index.ts") || files.find((f) => f === "index.js");
}

function createConfig(packageName) {
  const isWindows = process.platform === "win32";
  const packagePath = isWindows
  ? path.join(rootPackagesDir, packageName)
  : path.resolve();

  if (!existsSync(packagePath)) {
    throw new Error(`Package folder "${packagePath}" does not exist.`);
  }

  const entryFile = getEntryFile(packagePath);
  if (!entryFile) {
    throw new Error(`No entry file (index.ts or index.js) found in "${packagePath}".`);
  }

  const input = path.join(packagePath, entryFile);
  const distDir = path.join(packagePath, "dist");
  if (!existsSync(distDir)) {
    mkdirSync(distDir);
  }

  return {
    input,
    output: [
      {
        file: path.join(distDir, "index.js"),
        format: "esm",
        sourcemap: true,
      },
      {
        file: path.join(distDir, "index.cjs"),
        format: "cjs",
        sourcemap: true,
      },
      {
        file: path.join(distDir, "index.iife.js"),
        format: "iife",
        name: `JustenStore_${packageName.replace(/[^a-zA-Z0-9]/g, "_")}`,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          vue: "Vue",
        },
        sourcemap: true,
      },
    ],
    external: ["react", "react-dom", "vue"],
    plugins: [terser()],
  };
}

let exporter = null

if (folder) {
  exporter =createConfig(folder);
} else {
  const packageDirs = readdirSync(rootPackagesDir).filter((dir) => {
    const fullPath = path.join(rootPackagesDir, dir);
    return statSync(fullPath).isDirectory() && getEntryFile(fullPath);
  });

  exporter = packageDirs.map(createConfig);
}

export default exporter