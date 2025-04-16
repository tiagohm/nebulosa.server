import { cors } from '@elysiajs/cors'
import { cron } from '@elysiajs/cron'
import { staticPlugin } from '@elysiajs/static'
import Elysia from 'elysia'
import type { PropertyState } from 'nebulosa/src/indi'
import { parseArgs } from 'util'
import { AtlasService, atlas } from './src/atlas'
import { ConfirmationService, confirmation } from './src/confirmation'
import { ConnectionService, connection } from './src/connection'
import { FileSystemService, fileSystem } from './src/file-system'
import { FramingService, framing } from './src/framing'
import { ImageService, X_IMAGE_INFO_HEADER, image } from './src/image'
import { type Device, type DeviceType, type IndiDeviceEventHandler, IndiService, type SubDeviceType, cameras, guideOutputs, indi, thermometers } from './src/indi'
import { WebSocketMessageHandler } from './src/message'
import { PlateSolverService, plateSolver } from './src/platesolver'
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

class IndiDeviceEventHandlers implements IndiDeviceEventHandler {
	private readonly handlers: IndiDeviceEventHandler[] = []

	constructor(private readonly webSocketMessageHandler: WebSocketMessageHandler) {}

	// TODO: Handle close event to remove clients

	addHandler(handler: IndiDeviceEventHandler) {
		this.handlers.push(handler)
	}

	deviceUpdated(device: Device, property: string, state?: PropertyState) {
		console.debug('updated:', property, JSON.stringify((device as never)[property]))
		this.webSocketMessageHandler.send({ type: 'CAMERA.UPDATED', device })
		this.handlers.forEach((e) => e.deviceUpdated?.(device, property, state))
	}

	deviceAdded(device: Device, type: DeviceType | SubDeviceType) {
		console.debug('added:', type, device.name)
		this.webSocketMessageHandler.send({ type: 'CAMERA.ADDED', device })
		this.handlers.forEach((e) => e.deviceAdded?.(device, type))
	}

	deviceRemoved(device: Device, type: DeviceType | SubDeviceType) {
		console.debug('removed:', type, device.name)
		this.webSocketMessageHandler.send({ type: 'CAMERA.REMOVED', device })
		this.handlers.forEach((e) => e.deviceRemoved?.(device, type))
	}
}

// Services

const webSocketMessageHandler = new WebSocketMessageHandler()
const indiDeviceEventHandlers = new IndiDeviceEventHandlers(webSocketMessageHandler)
const connectionService = new ConnectionService()
const indiService = new IndiService(indiDeviceEventHandlers, connectionService)
const confirmationService = new ConfirmationService(webSocketMessageHandler)
const atlasService = new AtlasService()
const imageService = new ImageService()
const framingService = new FramingService()
const fileSystemService = new FileSystemService()
const starDetectionService = new StarDetectionService()
const plateSolverService = new PlateSolverService()

const app = new Elysia()

// CORS

app.use(
	cors({
		exposeHeaders: [X_IMAGE_INFO_HEADER],
	}),
)

// Cron

app.use(
	cron({
		name: 'heartbeat',
		pattern: '0 */15 * * * *',
		run() {
			console.log('Heartbeat')
		},
	}),
)

// Vue

app.use(staticPlugin({ assets: 'app', prefix: '/', indexHTML: true }))

// Error Handling

app.onError(({ code, error }) => {
	return Response.json({ message: `${error}`, code })
})

// Endpoints

app.use(connection(connectionService, indiService))
app.use(confirmation(confirmationService))
app.use(indi(indiService, connectionService))
app.use(cameras(indiService))
app.use(thermometers(indiService))
app.use(guideOutputs(indiService, connectionService))
app.use(atlas(atlasService))
app.use(image(imageService))
app.use(framing(framingService))
app.use(starDetection(starDetectionService))
app.use(plateSolver(plateSolverService))
app.use(fileSystem(fileSystemService))

// WebSocket

app.ws('/ws', {
	open: (socket) => webSocketMessageHandler.open(socket.raw),
	// message: (socket, message) => webSocketMessageHandler.message(socket.raw, message),
	close: (socket, code, reason) => webSocketMessageHandler.close(socket.raw, code, reason),
})

// Start!

app.listen({ hostname, port })

console.info(`server is started at port: ${app.server!.port}`)
