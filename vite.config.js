import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mc-3d-path-map/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'pages/worlds/bunnysnek.html'),
        bunnysnek: resolve(__dirname, 'pages/worlds/bunnysnek.html'),
        chocolatebnuuy: resolve(__dirname, 'pages/worlds/chocolatebnuuy.html'),
      }
    }
  }
});
