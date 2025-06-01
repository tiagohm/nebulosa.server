import { cors } from '@elysiajs/cors'
import { cron } from '@elysiajs/cron'
import { staticPlugin } from '@elysiajs/static'
import Elysia from 'elysia'
import type { PropertyState } from 'nebulosa/src/indi'
import { AtlasService, atlas } from './atlas'
import { ConfirmationService, confirmation } from './confirmation'
import { ConnectionService, connection } from './connection'
import { FileSystemService, fileSystem } from './file-system'
import { FramingService, framing } from './framing'
import { ImageService, image } from './image'
import { type IndiDeviceEventHandler, IndiService, cameras, guideOutputs, indi, thermometers } from './indi'
import { WebSocketMessageHandler } from './message'
import { PlateSolverService, plateSolver } from './platesolver'
import { StarDetectionService, starDetection } from './stardetection'
import type { Device, DeviceType, SubDeviceType } from './types'
import { X_IMAGE_INFO_HEADER } from './types'

export class IndiDeviceEventHandlers implements IndiDeviceEventHandler {
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

	.use(
		cors({
			exposeHeaders: [X_IMAGE_INFO_HEADER],
		}),
	)

	// Cron

	.use(
		cron({
			name: 'heartbeat',
			pattern: '0 */15 * * * *',
			run() {
				console.log('Heartbeat')
			},
		}),
	)

	// Vue

	.use(staticPlugin({ assets: 'app', prefix: '/', indexHTML: true }))

	// Error Handling

	.onError(({ code, error }) => {
		return Response.json({ message: `${error}`, code })
	})

	// Endpoints

	.use(connection(connectionService, indiService))
	.use(confirmation(confirmationService))
	.use(indi(indiService, connectionService))
	.use(cameras(indiService))
	.use(thermometers(indiService))
	.use(guideOutputs(indiService, connectionService))
	.use(atlas(atlasService))
	.use(image(imageService))
	.use(framing(framingService))
	.use(starDetection(starDetectionService))
	.use(plateSolver(plateSolverService))
	.use(fileSystem(fileSystemService))

	// WebSocket

	.ws('/ws', {
		open: (socket) => webSocketMessageHandler.open(socket.raw),
		// message: (socket, message) => webSocketMessageHandler.message(socket.raw, message),
		close: (socket, code, reason) => webSocketMessageHandler.close(socket.raw, code, reason),
	})

export type App = typeof app

export default app
