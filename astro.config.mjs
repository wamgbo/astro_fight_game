import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
    output: 'server', // 強制全站使用伺服器渲染
    adapter: node({
        mode: 'standalone',
    }),
});