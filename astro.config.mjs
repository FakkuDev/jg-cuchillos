import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    preact(),
    tailwind(),
    sitemap({
      // Excluimos el panel de admin del sitemap
      filter: (page) => !page.includes('/admin/')
    })
  ],
  output: 'static',
  // Usá la URL que te dio Cloudflare (ej: https://jg-cuchillos.pages.dev)
  // o tu dominio propio cuando lo tengas.
  site: 'https://jg-cuchillos.pages.dev',
});
