import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React Three Fiber is an imperative WebGL paradigm: the render loop
    // (`useFrame`) MUTATES meshes, cameras and materials every frame, and
    // geometry/particle setup legitimately seeds with `Math.random()` inside
    // `useMemo`. The new React-Compiler lint rules (purity / immutability /
    // use-memo) are designed for pure render code and conflict with this by
    // design, so we relax them for the 3D layer only.
    files: ["components/three/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
