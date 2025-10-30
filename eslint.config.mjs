import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("next/typescript"),

  // ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/__tests__/**"
    ],
  },

  // Plugins and rules
  {
    plugins: {
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      // Disallow relative imports within the source tree. Use the '@/*' alias
      // (which maps to 'src/*' in tsconfig.json) for local imports instead.
      // This prevents mixed import styles and makes large refactors safer.
      // Use an override below so tests and config files can continue to use
      // relative imports where needed.
    },
  },
  // Enforce the use of the '@' path alias for local imports inside src/**.
  // This will cause ESLint to report errors wherever a relative import is
  // used inside the source code. Convert files using the codemod or the
  // automated script we discussed to update imports to '@/**'.
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            "./*",
            "../*"
          ]
        }
      ]
    }
  },
  // Allow certain relaxations for test files. Tests often use helpers and mocks
  // that are convenient to type with `any`. Keep source files strict.
  {
    files: [
      "**/__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];

export default eslintConfig;
