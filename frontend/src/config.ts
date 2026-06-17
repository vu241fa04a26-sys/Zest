const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_BASE_URL = rawApiUrl.replace(/\/$/, '');

export const WS_BASE_URL = (process.env.NEXT_PUBLIC_WS_URL || API_BASE_URL.replace(/^http/, 'ws')).replace(/\/$/, '');
