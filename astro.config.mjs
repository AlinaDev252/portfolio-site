import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://alina-goiea.com',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    vue(),
    sitemap({
      filter: (page) => page.endsWith('/') && !/\/(404|work)(\/|$)/.test(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
