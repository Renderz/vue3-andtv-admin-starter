declare interface ViteEnv {
  VITE_PORT: number;
  VITE_PUBLIC_PATH: string;
  VITE_PROXY: [string, string][];
  VITE_APP_TITLE: string;
  VITE_DROP_CONSOLE: boolean;
  VITE_LEGACY: boolean;
  VITE_HTTPS: boolean;
  VITE_API_URL: string;
}
