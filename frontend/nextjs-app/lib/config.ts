const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || 'dev').toLowerCase();

const apiUrls: Record<string, string | undefined> = {
  dev: process.env.NEXT_PUBLIC_API_URL_DEV,
  staging: process.env.NEXT_PUBLIC_API_URL_STAGING,
  prod: process.env.NEXT_PUBLIC_API_URL_PROD,
};

export const API_URL = apiUrls[appEnv] || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';
