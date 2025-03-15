#!/usr/bin/env bun
import { build } from 'bun'
import TailwindPlugin from 'bun-plugin-tailwind'
import path from 'path'

const start = performance.now()

// Build all the HTML files
const result = await build({
	entrypoints: ['./web/index.html'],
	outdir: 'public',
	plugins: [TailwindPlugin],
	minify: true,
	target: 'browser',
	sourcemap: 'linked',
	external: ['react', 'react-dom'],
	define: {
		'process.env.NODE_ENV': JSON.stringify('production'),
	},
})

// Print the results
const end = performance.now()

const outputTable = result.outputs.map((output) => ({
	File: path.relative(process.cwd(), output.path),
	Type: output.kind,
	Size: `${output.size} B`,
}))

console.table(outputTable)
const buildTime = (end - start).toFixed(3)

console.log(`\n✅ Build completed in ${buildTime} ms\n`)
