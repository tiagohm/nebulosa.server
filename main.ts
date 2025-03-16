import { cors } from '@elysiajs/cors'
import { cron } from '@elysiajs/cron'
import Elysia from 'elysia'
import { parseArgs } from 'util'
import { AtlasService, atlas } from './src/atlas'
import { ConfirmationService, confirmation } from './src/confirmation'
import { ConnectionService, connection } from './src/connection'
import { FramingService, framing } from './src/framing'
import { ImageService, image } from './src/image'
import { IndiService, cameras, indi } from './src/indi'
import { WebSocketMessageHandler } from './src/message'
import { StarDetectionService, starDetection } from './src/star-detection'

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

// Services

const webSocketMessageHandler = new WebSocketMessageHandler()

const indiService = new IndiService({
	// TODO: Handle close event to remove clients
	deviceUpdated: (device, property) => {
		console.log('updated:', property, JSON.stringify((device as never)[property]))
		webSocketMessageHandler.send({ type: 'CAMERA.UPDATED', device })
	},
	deviceAdded: (device, type) => {
		console.log('added:', type, device.name)
		webSocketMessageHandler.send({ type: 'CAMERA.ADDED', device })
	},
	deviceRemoved: (device) => {
		console.log('removed:', device.name)
		webSocketMessageHandler.send({ type: 'CAMERA.REMOVED', device })
	},
})

const connectionService = new ConnectionService(indiService)
const confirmationService = new ConfirmationService(webSocketMessageHandler)
const atlasService = new AtlasService()
const imageService = new ImageService()
const framingService = new FramingService()
const starDetectionService = new StarDetectionService()

const app = new Elysia()

// CORS

app.use(
	cors({
		exposeHeaders: ['X-Image-Info'],
	}),
)

// Cron

app.use(
	cron({
		name: 'heartbeat',
		pattern: '*/10 * * * * *',
		run() {
			console.log('Heartbeat')
		},
	}),
)

// Services

app.use(connection(connectionService))
app.use(confirmation(confirmationService))
app.use(indi(indiService, connectionService))
app.use(cameras(indiService))
app.use(atlas(atlasService))
app.use(image(imageService))
app.use(framing(framingService))
app.use(starDetection(starDetectionService))

// WebSocket

app.ws('/ws', {
	open: (socket) => webSocketMessageHandler.open(socket.raw),
	// message: (socket, message) => webSocketMessageHandler.message(socket.raw, message),
	close: (socket, code, reason) => webSocketMessageHandler.close(socket.raw, code, reason),
})

// Start!

app.listen({ hostname, port })

console.info(`server is started at port: ${app.server!.port}`)
