import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [preact(), tailwind(), sitemap()],
  output: 'static',
  site: 'https://URL_FINAL_DEL_SITIO',
  vite: {
    build: {
      rollupOptions: {
        external: ['exceljs']
      }
    }
  }
});
