import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const DOM_TEST_GLOB = "src/features/form-preview/**/*.test.ts";

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "logic",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: [DOM_TEST_GLOB],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: [DOM_TEST_GLOB],
        },
      },
    ],
  },
});
