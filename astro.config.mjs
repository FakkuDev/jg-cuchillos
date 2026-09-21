import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://jg-cuchillos.pages.dev',
  output: 'static',
  integrations: [preact(), tailwind()]
});
