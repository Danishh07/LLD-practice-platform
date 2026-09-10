import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Minimal config on purpose — no path aliases, no env wiring, nothing
// beyond what this MVP actually needs. Add config here only when a
// later phase has a concrete reason to.
export default defineConfig({
  plugins: [react()],
})
