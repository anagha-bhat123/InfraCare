const host = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "127.0.0.1";
export const apiUrl = import.meta.env.VITE_API_URL || `http://${host}:8000`;
