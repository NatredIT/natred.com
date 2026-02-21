import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://natred.com',
  build: {
    assets: 'assets'
  },
  vite: {
    build: {
      cssMinify: true
    }
  }
});
