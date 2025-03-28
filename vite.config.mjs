import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { URL, fileURLToPath } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), Components({ resolvers: [PrimeVueResolver()] }), tailwindcss()],
	base: './',
	publicDir: 'web/public',
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./web', import.meta.url)),
		},
	},
	build: {
		outDir: 'app',
		emptyOutDir: true,
		chunkSizeWarningLimit: 2048,
		assetsInlineLimit: 0,
		reportCompressedSize: false,
		rollupOptions: {
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: '[name].[hash].js',
				assetFileNames: '[name][extname]',
			},
		},
	},
})
