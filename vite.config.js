import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The app calls /api on its own address and Vite passes it on to the .NET API.
    // That way a phone on the same Wi-Fi (npm run dev:lan) reaches the API through this
    // computer, instead of looking for "localhost" on the phone itself.
    proxy: {
      '/api': 'http://localhost:5041',
    },
  },
})
