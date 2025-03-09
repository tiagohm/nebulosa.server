import { parseArgs } from 'util'
import fovCameras from './data/cameras.json' with { type: 'json' }
import hipsSurveys from './data/hips-surveys.json' with { type: 'json' }
import fovTelescopes from './data/telescopes.json' with { type: 'json' }
// biome-ignore format:
import { altitudeChartOfMoon, altitudeChartOfPlanet, altitudeChartOfSatellite, altitudeChartOfSkyObject, altitudeChartOfSun, closeApproachesForMinorPlanets, earthSeasons, moonPhases, positionOfMoon, positionOfPlanet, positionOfSatellite, positionOfSkyObject, positionOfSun, searchMinorPlanet, searchSatellites, searchSkyObject, skyObjectTypes, twilight } from './src/atlas'
import { ConfirmationService } from './src/confirmation'
import { ConnectionService } from './src/connection'
import { frame } from './src/framing'
import { analyzeImage, annotateImage, closeImage, coordinateInterpolation, openImage, saveImage, statistics } from './src/image'
import { IndiService } from './src/indi'
import { WebSocketMessageHandler } from './src/message'
import { detectStars } from './src/star-detection'

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

const noResponse = new Response()
const corsResponse = new Response(null, { headers: corsHeaders })
const hipsSurveysResponse = Response.json(hipsSurveys)
const fovCameraResponse = Response.json(fovCameras)
const fovTelescopeResponse = Response.json(fovTelescopes)

const webSocketMessageHandler = new WebSocketMessageHandler()

const indi = new IndiService({
	// TODO: Handle close event to remove clients
	cameraUpdated: (device, property) => {
		webSocketMessageHandler.send({ type: 'CAMERA.UPDATED', device })
	},
	cameraAdded: (device) => {
		webSocketMessageHandler.send({ type: 'CAMERA.ADDED', device })
	},
	cameraRemoved: (device) => {
		webSocketMessageHandler.send({ type: 'CAMERA.REMOVED', device })
	},
})

const connection = new ConnectionService(indi)
const confirmation = new ConfirmationService(webSocketMessageHandler)

// @ts-ignore
const server = Bun.serve({
	hostname,
	port,
	routes: {
		// Connection
		'/connections': { POST: async (req) => Response.json(await connection.connect(await req.json())), GET: () => Response.json(connection.list()) },
		'/connections/:id': { GET: (req) => Response.json(connection.status(req.params.id)), DELETE: (req) => Response.json(connection.disconnect(req.params.id)) },

		// Confirmation
		'/confirmation': { POST: async (req) => Response.json(confirmation.confirm(await req.json())) },

		// INDI
		'/indi/:id/connect': { POST: (req) => Response.json(indi.deviceConnect(connection.client!, req.params.id)) },
		'/indi/:id/disconnect': { POST: (req) => Response.json(indi.deviceDisconnect(connection.client!, req.params.id)) },

		// Atlas
		'/atlas/sun/image': noResponse, // TODO: Use server.reload(options) to update the image.
		'/atlas/sun/position': { POST: async (req) => Response.json(await positionOfSun(await req.json())) },
		'/atlas/sun/altitude-chart': { POST: async (req) => Response.json(altitudeChartOfSun(await req.json())) },
		'/atlas/earth/seasons': { POST: async (req) => Response.json(earthSeasons()) },
		'/atlas/moon/position': { POST: async (req) => Response.json(await positionOfMoon(await req.json())) },
		'/atlas/moon/altitude-chart': { POST: async (req) => Response.json(altitudeChartOfMoon(await req.json())) },
		'/atlas/moon/phases': { POST: async (req) => Response.json(moonPhases()) },
		'/atlas/twilight': { POST: async (req) => Response.json(twilight()) },
		'/atlas/planets/:code/position': { POST: async (req) => Response.json(await positionOfPlanet(req.params.code, await req.json())) },
		'/atlas/planets/:code/altitude-chart': { POST: async (req) => Response.json(altitudeChartOfPlanet(req.params.code, await req.json())) },
		'/atlas/minor-planets': { POST: async (req) => Response.json(searchMinorPlanet()) },
		'/atlas/minor-planets/close-approaches': { POST: async (req) => Response.json(closeApproachesForMinorPlanets()) },
		'/atlas/sky-objects': { POST: async (req) => Response.json(searchSkyObject()) },
		'/atlas/sky-objects/types': { POST: async (req) => Response.json(skyObjectTypes()) },
		'/atlas/sky-objects/:id/position': { POST: async (req) => Response.json(await positionOfSkyObject(await req.json(), req.params.id)) },
		'/atlas/sky-objects/:id/altitude-chart': { POST: async (req) => Response.json(altitudeChartOfSkyObject(await req.json())) },
		'/atlas/satellites': { POST: async (req) => Response.json(searchSatellites()) },
		'/atlas/satellites/:id/position': { POST: async (req) => Response.json(await positionOfSatellite(await req.json(), req.params.id)) },
		'/atlas/satellites/:id/altitude-chart': { POST: async (req) => Response.json(altitudeChartOfSatellite(await req.json())) },

		// Framing
		'/framing': { POST: async (req) => new Response(await frame(await req.json())) },
		'/framing/hips-surveys': hipsSurveysResponse,

		// Image
		'/image/open': { POST: async (req) => Response.json(await openImage(await req.json())) },
		'/image/close': { POST: async (req) => Response.json(closeImage(await req.json())) },
		'/image/save': { POST: (req) => Response.json(saveImage()) },
		'/image/analyze': { POST: (req) => Response.json(analyzeImage()) },
		'/image/annotate': { POST: (req) => Response.json(annotateImage()) },
		'/image/coordinate-interpolation': { POST: () => Response.json(coordinateInterpolation()) },
		'/image/statistics': { POST: () => Response.json(statistics()) },
		'/image/fov-cameras': () => fovCameraResponse,
		'/image/fov-telescopes': () => fovTelescopeResponse,

		// Star Detection
		'/star-detection': { POST: async (req) => Response.json(await detectStars(await req.json())) },

		// CORS
		'/*': { OPTIONS: () => corsResponse },
	},
	error: (e) => {
		return Response.json({ message: e.message }, { status: 500 })
	},
	fetch: (req, server) => {
		const url = new URL(req.url)

		if (url.pathname === '/ws') {
			if (server.upgrade(req)) {
				return undefined
			}

			return new Response('WebSocket Upgrade Error', { status: 500 })
		}

		return new Response(null, { status: 404 })
	},
	websocket: {
		open: (socket) => webSocketMessageHandler.open(socket),
		message: (socket, message) => webSocketMessageHandler.message(socket, message),
		close: (socket, code, reason) => webSocketMessageHandler.close(socket, code, reason),
	},
})

console.info(`server is started at port: ${server.port}`)
