import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify'; // 這裡必須 import 進來
import react from '@astrojs/react';
export default defineConfig({
  // 使用混合模式
  output: 'server',

  adapter: netlify(),
  integrations: [react()],
});