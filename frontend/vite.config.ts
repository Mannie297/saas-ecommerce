import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Debug: Log environment variables and paths
  /*
  console.log('Vite Config - Debug:', {
    STRIPE_KEY: env.VITE_STRIPE_PUBLISHABLE_KEY,
    NODE_ENV: mode,
    CWD: process.cwd(),
    ENV_FILE_PATH: path.resolve(process.cwd(), '.env'),
    ENV_KEYS: Object.keys(env).filter(key => key.startsWith('VITE_'))
  });
  */
 
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    // Expose env variables to the client
    define: {
      'process.env': env
    },
    // Ensure environment variables are loaded
    envDir: process.cwd(),
    envPrefix: 'VITE_'
  }
})
