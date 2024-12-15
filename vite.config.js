import { defineConfig } from "vite";
import preact from '@preact/preset-vite'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    server: {
        watch: {
            ignored: ["dist", "node_modules"],
            include: "public/**"
        },
    },
    plugins: [
        preact({
            include: ['public/content.js']
        }),
        viteStaticCopy({
            targets: [
                {
                    src: 'public/*',
                    dest: '.',
                },
                {
                    src: 'src/assets/*',
                    dest: '.',
                }
            ],
        })
    ],
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                main: "index.html",
            },
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
            },
        },
        minify: 'esbuild',
        sourcemap: false,
    },
});
