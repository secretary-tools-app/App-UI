declare global {
  interface Window {
    __APP_CONFIG__?: {
      apiUrl?: string;
    };
  }
}

const runtimeApiUrl = typeof window !== 'undefined' ? window.__APP_CONFIG__?.apiUrl : undefined;

export const environment = {
  production: false,
  apiUrl: runtimeApiUrl || 'https://localhost:65380/api',
};
