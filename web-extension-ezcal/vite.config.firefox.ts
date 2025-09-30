import { resolve } from 'path';
import { mergeConfig, defineConfig } from 'vite';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import baseConfig, { baseBuildOptions } from './vite.config.base'
import firefoxManifest from './manifest.firefox.json';
import devManifest from './manifest.dev.json';
import pkg from './package.json';

const isDev = process.env.__DEV__ === 'true';
const outDir = resolve(__dirname, 'dist_firefox');

const firefoxFullManifest = {
  ...firefoxManifest,
  version: pkg.version,
  ...(isDev ? devManifest : {} as ManifestV3Export)
} as ManifestV3Export;

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      crx({
        manifest: firefoxFullManifest,
        browser: 'firefox',
      })
    ],
    build: {
      ...baseBuildOptions,
      rollupOptions: {
        ...(baseBuildOptions?.rollupOptions || {}),
        input: {
          ...(typeof baseBuildOptions?.rollupOptions?.input === 'object' && baseBuildOptions?.rollupOptions?.input !== null ? baseBuildOptions.rollupOptions.input : {}),
          // Explicitly include panel for Firefox
          panel: resolve(__dirname, 'src/pages/panel/index.html'),
        }
      },
      outDir
    },
    publicDir: resolve(__dirname, 'public'),
  })
)
