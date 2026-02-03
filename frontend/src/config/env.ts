/**
 * Environment configuration
 * Centralizes all environment variables with proper typing
 */

interface Config {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
