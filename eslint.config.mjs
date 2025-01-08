import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import _import from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
   baseDirectory: __dirname,
   recommendedConfig: js.configs.recommended,
   allConfig: js.configs.all,
});

const config = [
   {
      ignores: ["components/ui/**/*"],
   },
   ...fixupConfigRules(
      compat.extends(
         "next/core-web-vitals",
         "next/typescript",
         "standard",
         "plugin:tailwindcss/recommended",
         "plugin:import/typescript",
         "prettier"
      )
   ),
   {
      plugins: {
         import: fixupPluginRules(_import),
      },

      settings: {
         "import/resolver": {
            typescript: true,
            node: true,
         },

         "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
         },
      },

      rules: {
         "import/order": [
            "error",
            {
               groups: [
                  "builtin",
                  "external",
                  "internal",
                  ["parent", "sibling"],
                  "index",
                  "object",
               ],

               "newlines-between": "always",

               pathGroups: [
                  {
                     pattern: "@app/**",
                     group: "external",
                     position: "after",
                  },
               ],

               pathGroupsExcludedImportTypes: ["builtin"],

               alphabetize: {
                  order: "asc",
                  caseInsensitive: true,
               },
            },
         ],
      },
   },
   {
      files: ["**/*.ts", "**/*.tsx"],

      rules: {
         "no-undef": "off",
      },
   },
];

export default config;
