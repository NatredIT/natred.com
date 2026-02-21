import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://NatredIT.github.io',
  base: '/natred.com',
  build: {
    assets: 'assets'
  },
  vite: {
    build: {
      cssMinify: true
    }
  }
});
