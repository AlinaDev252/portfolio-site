import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://alinadev252.github.io',
  base: '/portfolio-site',
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
});
