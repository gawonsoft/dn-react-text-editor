import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/view.tsx", "src/sanitizer.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  clean: true,
  external: ["*.css"],
});
