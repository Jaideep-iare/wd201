import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    // Ignore certain directories
    ignores: ["migrations/", "models/"],
    languageOptions: { sourceType: "commonjs" },
  },
  // { languageOptions: { globals: globals.browser, ...globals.node, ...globals.jest  } },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.jest },
    },
  },
  pluginJs.configs.recommended,
];
