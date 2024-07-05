import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mc-3d-path-map/',
  build: {
    target: 'esnext' //browsers can handle the latest ES features
  }
});
