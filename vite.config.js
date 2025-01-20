import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 10000,      // or any port Render expects
    host: '0.0.0.0',  // Ensures app is accessible from the network
    allowedHosts: ['mapdrawingapp.onrender.com', 'localhost'], // Add the allowed hosts here
  },
});
