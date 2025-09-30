import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, BuildOptions } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'
import { stripDevIcons, crxI18n } from './custom-vite-plugins';


const isDev = process.env.__DEV__ === 'true';
// set this flag to true, if you want localization support
const localize = false;

export const baseBuildOptions: BuildOptions = {
  sourcemap: isDev,
  emptyOutDir: !isDev
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    react(),
    stripDevIcons(isDev),
    crxI18n({ localize, src: './src/locales' }),
  ],
  publicDir: resolve(__dirname, 'public'),
});
