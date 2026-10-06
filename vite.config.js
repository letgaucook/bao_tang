import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 700, // three.js chiếm phần lớn bundle sảnh
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        room: resolve(import.meta.dirname, 'room.html'),
        game: resolve(import.meta.dirname, 'game.html'),
      },
    },
  },
});
