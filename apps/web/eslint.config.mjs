import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: ["**/*.md", "JPC_DESIGN_SYSTEM.md", "JPC_PALETTE.md"],
  },
];
