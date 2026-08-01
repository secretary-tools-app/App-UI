declare global {
  interface Window {
    __APP_CONFIG__?: {
      apiUrl?: string;
    };
  }
}

const runtimeApiUrl = typeof window !== 'undefined' ? window.__APP_CONFIG__?.apiUrl : undefined;

export const environment = {
  production: true,
  apiUrl: runtimeApiUrl || 'https://<SEU-BACKEND-RAILWAY>.up.railway.app/api',
};
