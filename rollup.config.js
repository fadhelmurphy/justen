// rollup.config.cjs
import terser from "@rollup/plugin-terser";
import { readdirSync, existsSync, mkdirSync } from "fs";
import path from "path";

const folder = process.env.FOLDER;
const packagePath = path.resolve();

if (!folder) {
  throw new Error('Environment variable "FOLDER" is not set.\nUsage: FOLDER=react yarn single');
}

if (!existsSync(packagePath)) {
  throw new Error(`Package folder "${packagePath}" does not exist in ./packages`);
}

const entryFile =
  readdirSync(packagePath).find((f) => f === "index.ts") ||
  readdirSync(packagePath).find((f) => f === "index.js");

if (!entryFile) {
  throw new Error(`No entry file (index.ts or index.js) found in package "${packagePath}"`);
}

const input = path.join(packagePath, entryFile);
const distDir = path.join(packagePath, "dist");

if (!existsSync(distDir)) {
  mkdirSync(distDir);
}

export default {
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
      name: `JustenStore_${folder}`,
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
        vue: "Vue",
      },
      sourcemap: true,
    },
  ],
  external: (id) => ["react", "react-dom", "vue"].includes(id),
  plugins: [terser()],
};
