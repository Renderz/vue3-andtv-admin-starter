import { createProxy, wrapperEnv } from 'build/utils';
import { resolve } from 'path';
import type { PluginOption } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import dayjs from 'dayjs';
import pkg from './package.json';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

export default defineConfig(({ mode }) => {
  const root = process.cwd();

  const env = loadEnv(mode, root);

  const { VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY, VITE_DROP_CONSOLE, VITE_HTTPS } = wrapperEnv(env);

  // const isBuild = command === 'build';

  const plugins: (PluginOption | PluginOption[])[] = [];

  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: [
        // @/xxxx => src/xxxx
        {
          find: /@\//,
          replacement: pathResolve('src') + '/',
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
