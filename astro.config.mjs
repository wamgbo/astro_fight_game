import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify'; // 這裡必須 import 進來
export default defineConfig({
    output: 'hybrid', // 使用混合模式
    adapter: netlify(),
});
