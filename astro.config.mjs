import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jg-cuchillos.pages.dev',
  output: 'static',
  integrations: [
    preact(),
    tailwind(),
    sitemap({
      filter: (page) => !page.includes('/admin/')
    })
  ]
});
