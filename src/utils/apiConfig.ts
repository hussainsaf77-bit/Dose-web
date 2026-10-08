// API configuration helper for multi-environment support (Vercel, Preview, Dev, Custom Domains)

export const LIVE_BACKEND_URL = 'https://ais-pre-od4aemezdgaeup2ncw76si-295455119343.europe-west2.run.app';

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (typeof window === 'undefined') {
    return cleanEndpoint;
  }

  const hostname = window.location.hostname;
  
  // If running locally or on AI Studio run.app preview, use relative URL
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('run.app')) {
    return cleanEndpoint;
  }

  // When deployed to external static hosting (e.g. web-dose.vercel.app or GitHub Pages)
  return `${LIVE_BACKEND_URL}${cleanEndpoint}`;
}
