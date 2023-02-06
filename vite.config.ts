import path from 'path';
import type { PluginOption } from 'vite';
import { defineConfig, loadEnv } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import legacy from '@vitejs/plugin-legacy';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import windiCSS from 'vite-plugin-windicss';
import Pages from 'vite-plugin-pages';
import { visualizer } from 'rollup-plugin-visualizer';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { createStyleImportPlugin } from 'vite-plugin-style-import';

import { createProxy, wrapperEnv } from './build/utils';
import AndDesignVueResolve from './build/antDesignVueResolve';

import dayjs from 'dayjs';
import pkg from './package.json';

const srcPath = path.resolve(__dirname, 'src');

const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

/**
 * Whether to generate package preview
 */
export function isReportMode(): boolean {
  return process.env.REPORT === 'true';
}

export default defineConfig(({ command, mode }) => {
  const root = process.cwd();

  const env = loadEnv(mode, root);

  const { VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY, VITE_DROP_CONSOLE, VITE_HTTPS, VITE_LEGACY } = wrapperEnv(env);

  const isBuild = command === 'build';

  const plugins: (PluginOption | PluginOption[])[] = [
    // essential
    vue(),
    // essential
    vueJsx(),
    // essential support setup syntax sugar
    vueSetupExtend(),
    windiCSS({
      // 关闭css reset，否则会和antd某些样式冲突
      preflight: false,
    }),
    // 基于目录结构的路由
    Pages({
      dirs: [{ dir: path.resolve(srcPath, 'pages'), baseRoute: '' }],
      exclude: ['**/components/*.vue'],
      extensions: ['vue', 'jsx', 'tsx'],
    }),
    // auto import components / does not support JSX/TSX
    AutoImport({
      resolvers: [AntDesignVueResolver()],
      dts: path.resolve(srcPath, 'auto-imports.d.ts'),
    }),
    Components({
      resolvers: [AntDesignVueResolver()],
      dts: path.resolve(srcPath, 'components.d.ts'),
    }),
    createStyleImportPlugin({
      resolves: [AndDesignVueResolve()],
    }),
  ];

  if (isBuild) {
    isReportMode() &&
      plugins.push(
        visualizer({
          filename: './node_modules/.cache/visualizer/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
      );

    VITE_LEGACY && plugins.push(legacy());
  }

  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: [
        // @/xxxx => src/xxxx
        {
          find: /@\//,
          replacement: srcPath + '/',
        },
      ],
    },
    server: {
      host: true,
      https: VITE_HTTPS,
      port: VITE_PORT,
      cors: true,
      proxy: createProxy(VITE_PROXY),
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
    },
    build: {
      target: 'es2015',
      cssTarget: 'chrome80',
      chunkSizeWarningLimit: 2000,
      outDir: 'dist',
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'font-size-base': '14px',
          },
          javascriptEnabled: true,
        },
      },
    },
    plugins: plugins,
  };
});
