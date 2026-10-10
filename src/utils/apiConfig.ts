// API configuration helper for multi-environment support (Vercel, Preview, Dev, Custom Domains)

export const LIVE_BACKEND_URL = '';

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Always use same-origin relative endpoint for both local preview and Vercel serverless functions
  return cleanEndpoint;
}

