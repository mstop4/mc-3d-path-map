import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mc-3d-path-map/',
  resolve: {
    alias: {
      find: 'three',
      replacement: '/node_modules/three/src/Three'
    }
  }
});
