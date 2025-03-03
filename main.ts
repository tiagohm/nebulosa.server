import { Elysia } from 'elysia'
import { parseArgs } from 'util'
import { atlas } from './src/atlas'
import { framing } from './src/framing'
import { image } from './src/image'

const { values } = parseArgs({
	args: Bun.argv,
	options: {
		port: {
			type: 'string',
		},
	},
	strict: true,
	allowPositionals: true,
})

const port = parseInt(values.port || '3000')

const app = new Elysia().use(atlas()).use(framing()).use(image()).listen(port)

console.info(`server is started at port: ${app.server?.port}`)
