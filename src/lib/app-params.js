/**
 * app-params.js — replaces the base44 version.
 * Reads only from Vite env vars now.
 */
export const appParams = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
};
