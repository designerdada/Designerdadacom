/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_API_URL: string;
  readonly VITE_R2_PUBLIC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
