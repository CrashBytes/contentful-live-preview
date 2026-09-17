import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const flatCompat = new FlatCompat({
  baseDir: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

const eslintConfig = [
  js.configs.recommended,
  ...flatCompat.config(require("eslint-config-next/core-web-vitals.js")),
  ...flatCompat.config(require("eslint-config-next/typescript.js")),
  {
    // Project rule preferences, mirrored from the original .eslintrc.json which
    // intentionally treated `any` and unused vars as non-blocking warnings.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // CommonJS config files and tests may use require().
    files: ["**/*.config.js", "**/__tests__/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "coverage/**",
      "**/*.d.ts",
    ],
  },
];

export default eslintConfig;
