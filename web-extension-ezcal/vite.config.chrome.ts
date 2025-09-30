import { resolve } from 'path';
import { mergeConfig, defineConfig } from 'vite';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import baseConfig, { baseBuildOptions } from './vite.config.base'
import chromeManifest from './manifest.chrome.json';
import devManifest from './manifest.dev.json';
import pkg from './package.json';

const isDev = process.env.__DEV__ === 'true';
const outDir = resolve(__dirname, 'dist_chrome');

const chromeFullManifest = {
  ...chromeManifest,
  version: pkg.version,
  ...(isDev ? devManifest : {} as ManifestV3Export)
} as ManifestV3Export;

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      crx({
        manifest: chromeFullManifest,
        browser: 'chrome',
      })
    ],
    build: {
      ...baseBuildOptions,
      // ⬇️ on complète les inputs existants du baseBuildOptions
      rollupOptions: {
        ...(baseBuildOptions?.rollupOptions || {}),
        input: {
          ...((typeof baseBuildOptions?.rollupOptions?.input === 'object' && baseBuildOptions?.rollupOptions?.input !== null) ? baseBuildOptions.rollupOptions.input : {}),
        }
      },
      outDir,
    },
  })
)
