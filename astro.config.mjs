import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify'; // 這裡必須 import 進來
export default defineConfig({
    output: 'server', // 使用混合模式
    adapter: netlify(),

});
