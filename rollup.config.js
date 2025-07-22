import terser from "@rollup/plugin-terser";
import { readdirSync } from "fs";
import path from "path";

const packagesDir = path.resolve("./packages");

const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => {
    const packageName = dirent.name;
    const packagePath = path.join(packagesDir, packageName);
    const files = readdirSync(packagePath);
    const entryFile = files.find((f) => f.endsWith(".js") || f.endsWith(".ts"));
    return {
      name: packageName,
      input: path.join("packages", packageName, entryFile),
    };
  })
  .filter((pkg) => pkg.input);

export default packages.map(({ name, input }) => ({
  input,
  output: [
    {
      file: `packages/${name}/dist/index.js`,
      format: "esm",
      sourcemap: true,
    },
    {
      file: `packages/${name}/dist/index.cjs`,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: `packages/${name}/dist/index.iife.js`,
      format: "iife",
      name: `JustenStore_${name}`,
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
        vue: "Vue",
      },
      sourcemap: true,
    },
  ],
  external: (id) => id !== 'react' && id !== 'react-dom' && id !== 'vue',
  plugins: [terser()],
}));
