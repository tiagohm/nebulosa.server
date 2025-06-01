import { parseArgs } from 'util'
import app from './src/app'

const args = parseArgs({
	args: Bun.argv,
	options: {
		host: { type: 'string', short: 'h' },
		port: { type: 'string', short: 'p' },
	},
	strict: true,
	allowPositionals: true,
})

const hostname = args.values.host || '0.0.0.0'
const port = parseInt(args.values.port || '7000')

// Start!

app.listen({ hostname, port })

console.info(`server is started at port: ${app.server!.port}`)
