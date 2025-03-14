import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    globals: true,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      ignoreEmptyLines: true,
      exclude: [
        ".next/**/*",
        "node_modules/**/*",
        "coverage/**/*",
        "**/*.d.ts",
      ],
    },
  },
});
