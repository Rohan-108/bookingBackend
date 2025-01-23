import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.node } },
  {
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // Warns for unused variables, except those starting with "_"
    },
  },
  pluginJs.configs.recommended,
];
