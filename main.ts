import type { BunRequest, WebSocketHandler } from 'bun'
import { parseArgs } from 'util'
import fovCameras from './data/cameras.json' with { type: 'json' }
import hipsSurveys from './data/hips-surveys.json' with { type: 'json' }
import fovTelescopes from './data/telescopes.json' with { type: 'json' }
import { AtlasService } from './src/atlas'
import { ConfirmationService } from './src/confirmation'
import { ConnectionService } from './src/connection'
import { ImageService } from './src/image'
import { IndiService } from './src/indi'
import { WebSocketMessageHandler } from './src/message'
import { StarDetectionService } from './src/star-detection'

type RouteWith<T extends string> = `${string}:${T}${string}`

const args = parseArgs({
	args: Bun.argv,
	options: {
		host: { type: 'string', short: 'h' },
		port: { type: 'string', short: 'p' },
	},
	strict: true,
	allowPositionals: true,
})

const port = parseInt(args.values.port || '7000')
const hostname = args.values.host || '0.0.0.0'

const corsHeaders = {
	// 'Access-Control-Allow-Credentials': 'false',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': '*',
	'Access-Control-Expose-Headers': 'X-Image-Info',
}

// Responses

const noResponse = new Response()
const corsResponse = new Response(null, { headers: corsHeaders })
const hipsSurveysResponse = Response.json(hipsSurveys)
const fovCameraResponse = Response.json(fovCameras)
const fovTelescopeResponse = Response.json(fovTelescopes)
const deviceNotFoundResponse = Response.json('Device not found', { status: 404 })

// Services

const webSocketMessageHandler = new WebSocketMessageHandler()

const indi = new IndiService({
	// TODO: Handle close event to remove clients
	deviceUpdated: (device, property) => {
		console.log('updated:', property, (device as never)[property])
		webSocketMessageHandler.send({ type: 'CAMERA.UPDATED', device })
	},
	deviceAdded: (device) => {
		console.log('added:', device.name)
		webSocketMessageHandler.send({ type: 'CAMERA.ADDED', device })
	},
	deviceRemoved: (device) => {
		console.log('removed:', device.name)
		webSocketMessageHandler.send({ type: 'CAMERA.REMOVED', device })
	},
})

const connection = new ConnectionService(indi)
const confirmation = new ConfirmationService(webSocketMessageHandler)
const atlas = new AtlasService()
const image = new ImageService()
const starDetection = new StarDetectionService()

// Connection

async function connect(req: BunRequest<string>) {
	return Response.json(await connection.connect(await req.json()))
}

function disconnect(req: BunRequest<RouteWith<'id'>>) {
	return Response.json(connection.disconnect(req.params.id))
}

function connectionList() {
	return Response.json(connection.list())
}

function connectionStatus(req: BunRequest<RouteWith<'id'>>) {
	return Response.json(connection.status(req.params.id))
}

// Confirmation

async function confirm(req: BunRequest<string>) {
	return Response.json(confirmation.confirm(await req.json()))
}

// INDI

function indiDevice(req: BunRequest<RouteWith<'id'>>) {
	return Response.json(indi.device(req.params.id))
}

function indiDeviceConnect(req: BunRequest<RouteWith<'id'>>) {
	const device = indi.device(req.params.id)
	if (!device) return deviceNotFoundResponse
	return Response.json(indi.deviceConnect(connection.client!, device))
}

function indiDeviceDisconnect(req: BunRequest<RouteWith<'id'>>) {
	const device = indi.device(req.params.id)
	if (!device) return deviceNotFoundResponse
	return Response.json(indi.deviceDisconnect(connection.client!, device))
}

function indiDeviceProperties(req: BunRequest<RouteWith<'id'>>) {
	return Response.json(indi.deviceProperties(req.params.id))
}

// Atlas

async function positionOfSun(req: BunRequest<string>) {
	return Response.json(await atlas.positionOfSun(await req.json()))
}

async function altitudeChartOfSun(req: BunRequest<string>) {
	return Response.json(atlas.altitudeChartOfSun(await req.json()))
}

async function positionOfMoon(req: BunRequest<string>) {
	return Response.json(await atlas.positionOfMoon(await req.json()))
}

async function altitudeChartOfMoon(req: BunRequest<string>) {
	return Response.json(atlas.altitudeChartOfMoon(await req.json()))
}

async function positionOfPlanet(req: BunRequest<RouteWith<'code'>>) {
	return Response.json(await atlas.positionOfPlanet(req.params.code, await req.json()))
}

async function altitudeChartOfPlanet(req: BunRequest<RouteWith<'code'>>) {
	return Response.json(atlas.altitudeChartOfPlanet(req.params.code, await req.json()))
}

// Image

async function imageOpen(req: BunRequest<string>) {
	return Response.json(image.open(await req.json()))
}

async function imageClose(req: BunRequest<string>) {
	return Response.json(image.close(await req.json()))
}

// Star Detection

async function detectStars(req: BunRequest<string>) {
	return Response.json(await starDetection.detectStars(await req.json()))
}

// @ts-ignore
const server = Bun.serve({
	hostname,
	port,
	routes: {
		// Connection
		'/connections': { POST: (req) => connect(req), GET: () => connectionList() },
		'/connections/:id': { GET: (req) => connectionStatus(req), DELETE: (req) => disconnect(req) },

		// Confirmation
		'/confirmation': { POST: (req) => confirm(req) },

		// INDI
		'/indi/:id': { GET: (req) => indiDevice(req) },
		'/indi/:id/connect': { POST: (req) => indiDeviceConnect(req) },
		'/indi/:id/disconnect': { POST: (req) => indiDeviceDisconnect(req) },
		'/indi/:id/properties': { GET: (req) => indiDeviceProperties(req) },

		// Atlas
		'/atlas/sun/image': noResponse, // TODO: Use server.reload(options) to update the image.
		'/atlas/sun/position': { POST: (req) => positionOfSun(req) },
		'/atlas/sun/altitude-chart': { POST: (req) => altitudeChartOfSun(req) },
		// '/atlas/earth/seasons': { POST: (req) => Response.json(earthSeasons()) },
		'/atlas/moon/position': { POST: (req) => positionOfMoon(req) },
		'/atlas/moon/altitude-chart': { POST: (req) => altitudeChartOfMoon(req) },
		// '/atlas/moon/phases': { POST: (req) => Response.json(moonPhases()) },
		// '/atlas/twilight': { POST: (req) => Response.json(twilight()) },
		'/atlas/planets/:code/position': { POST: (req) => positionOfPlanet(req) },
		'/atlas/planets/:code/altitude-chart': { POST: (req) => altitudeChartOfPlanet(req) },
		// '/atlas/minor-planets': { POST: (req) => Response.json(searchMinorPlanet()) },
		// '/atlas/minor-planets/close-approaches': { POST: (req) => Response.json(closeApproachesForMinorPlanets()) },
		// '/atlas/sky-objects': { POST: (req) => Response.json(searchSkyObject()) },
		// '/atlas/sky-objects/types': { POST: (req) => Response.json(skyObjectTypes()) },
		// '/atlas/sky-objects/:id/position': { POST: (req) => Response.json(await positionOfSkyObject(await req.json(), req.params.id)) },
		// '/atlas/sky-objects/:id/altitude-chart': { POST: (req) => Response.json(altitudeChartOfSkyObject(await req.json())) },
		// '/atlas/satellites': { POST: (req) => Response.json(searchSatellites()) },
		// '/atlas/satellites/:id/position': { POST: (req) => Response.json(await positionOfSatellite(await req.json(), req.params.id)) },
		//'/atlas/satellites/:id/altitude-chart': { POST: (req) => Response.json(altitudeChartOfSatellite(await req.json())) },

		// Framing
		// '/framing': { POST: (req) => new Response(await frame(await req.json())) },
		'/framing/hips-surveys': hipsSurveysResponse,

		// Image
		'/image/open': { POST: (req) => imageOpen(req) },
		'/image/close': { POST: (req) => imageClose(req) },
		// '/image/save': { POST: (req) => Response.json(saveImage()) },
		// '/image/analyze': { POST: (req) => Response.json(analyzeImage()) },
		// '/image/annotate': { POST: (req) => Response.json(annotateImage()) },
		// '/image/coordinate-interpolation': { POST: () => Response.json(coordinateInterpolation()) },
		// '/image/statistics': { POST: () => Response.json(statistics()) },
		'/image/fov-cameras': () => fovCameraResponse,
		'/image/fov-telescopes': () => fovTelescopeResponse,

		// Star Detection
		'/star-detection': { POST: (req) => detectStars(req) },

		// WebSocket
		// @ts-ignore
		'/ws': (req, server) => {
			if (!server.upgrade(req)) {
				return new Response('WebSocket connection required', { status: 400 })
			}
		},

		// CORS
		'/*': { OPTIONS: () => corsResponse },
	},
	error: (e) => {
		return Response.json({ message: e.message }, { status: 500 })
	},
	websocket: {
		open: (socket) => webSocketMessageHandler.open(socket),
		message: (socket, message) => webSocketMessageHandler.message(socket, message),
		close: (socket, code, reason) => webSocketMessageHandler.close(socket, code, reason),
	} as WebSocketHandler,
})

console.info(`server is started at port: ${server.port}`)
