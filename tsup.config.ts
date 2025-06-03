// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/ui/entry-client.tsx"],
  bundle: true,
  format: ["esm"], // We'll output an ES module
  outDir: "dist/client",
  splitting: false, // Keep it simple; no code-splitting
  minify: true,
  clean: true,
  // 1) noExternal ensures these packages are NOT left as bare imports
  // 2) If you omit this, tsup might treat them as externals
  noExternal: ["react", "react-dom", "react/jsx-runtime"],
  esbuildOptions(options) {
    options.define = {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    };
    // optional: rename the `.mjs` extension to `.js`
    options.outExtension = { ".js": ".js" };
  },
});
