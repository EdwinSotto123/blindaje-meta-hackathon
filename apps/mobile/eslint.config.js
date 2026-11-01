// ESLint de la app (proyecto npm aparte del workspace): reglas de Expo, React y hooks.
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["android/*", "ios/*", "dist/*", ".expo/*", "src/shared/*"],
  },
  {
    // Esquema de zod y su tipo con el mismo nombre: TypeScript ya detecta las redeclaraciones reales.
    rules: { "@typescript-eslint/no-redeclare": "off" },
  },
  {
    // En los tests, jest.mock va antes de los import y sus fábricas usan require.
    files: ["test/**"],
    rules: { "import/first": "off", "@typescript-eslint/no-require-imports": "off" },
  },
]);
