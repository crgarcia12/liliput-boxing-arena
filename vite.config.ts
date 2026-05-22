import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' 
    ? '/dev/crgarcia12/liliput-boxing-arena/liliput-task-3f7b5285/'
    : '/',
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
