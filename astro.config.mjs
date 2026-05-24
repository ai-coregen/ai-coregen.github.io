// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://naoki-gpt.github.io',
  base: '/ai-maximize-sales',
  vite: {
    plugins: [tailwindcss()]
  }
});
