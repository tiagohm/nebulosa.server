import { parseArgs } from 'util'
import fovCameras from './data/cameras.json' with { type: 'json' }
import hipsSurveys from './data/hips-surveys.json' with { type: 'json' }
import fovTelescopes from './data/telescopes.json' with { type: 'json' }
// biome-ignore format:
import { altitudeChartOfMoon, altitudeChartOfPlanet, altitudeChartOfSatellite, altitudeChartOfSkyObject, altitudeChartOfSun, closeApproachesForMinorPlanets, earthSeasons, moonPhases, positionOfMoon, positionOfPlanet, positionOfSatellite, positionOfSkyObject, positionOfSun, searchMinorPlanet, searchSatellites, searchSkyObject, skyObjectTypes, twilight, } from './src/atlas'
import { frame } from './src/framing'
import { analyzeImage, annotateImage, closeImage, coordinateInterpolation, openImage, saveImage, statistics } from './src/image'

const ARGS = parseArgs({
	args: Bun.argv,
	options: {
		host: { type: 'string', short: 'h' },
		port: { type: 'string', short: 'p' },
	},
	strict: true,
	allowPositionals: true,
})

const PORT = parseInt(ARGS.values.port || '7000')
const HOSTNAME = ARGS.values.host || '0.0.0.0'

const CORS_HEADERS = {
	// 'Access-Control-Allow-Credentials': 'false',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': '*',
	'Access-Control-Expose-Headers': 'X-Image-Info',
}

const NO_RESPONSE = new Response()
const HIPS_SURVEYS_RESPONSE = json(hipsSurveys)
const FOV_CAMERAS_RESPONSE = json(fovCameras)
const FOV_TELESCOPES_RESPONSE = json(fovTelescopes)

const SERVER = Bun.serve({
	hostname: HOSTNAME,
	port: PORT,
	routes: {
		// Atlas
		'/atlas/sun/image': NO_RESPONSE, // TODO: Use server.reload(options) to update the image.
		'/atlas/sun/position': { POST: async (req) => json(await positionOfSun(await req.json())) },
		'/atlas/sun/altitude-chart': { POST: async (req) => json(altitudeChartOfSun(await req.json())) },
		'/atlas/earth/seasons': { POST: async (req) => json(earthSeasons()) },
		'/atlas/moon/position': { POST: async (req) => json(await positionOfMoon(await req.json())) },
		'/atlas/moon/altitude-chart': { POST: async (req) => json(altitudeChartOfMoon(await req.json())) },
		'/atlas/moon/phases': { POST: async (req) => json(moonPhases()) },
		'/atlas/twilight': { POST: async (req) => json(twilight()) },
		'/atlas/planets/:code/position': { POST: async (req) => json(await positionOfPlanet(req.params.code, await req.json())) },
		'/atlas/planets/:code/altitude-chart': { POST: async (req) => json(altitudeChartOfPlanet(req.params.code, await req.json())) },
		'/atlas/minor-planets': { POST: async (req) => json(searchMinorPlanet()) },
		'/atlas/minor-planets/close-approaches': { POST: async (req) => json(closeApproachesForMinorPlanets()) },
		'/atlas/sky-objects': { POST: async (req) => json(searchSkyObject()) },
		'/atlas/sky-objects/types': { POST: async (req) => json(skyObjectTypes()) },
		'/atlas/sky-objects/:id/position': { POST: async (req) => json(await positionOfSkyObject(await req.json(), req.params.id)) },
		'/atlas/sky-objects/:id/altitude-chart': { POST: async (req) => json(altitudeChartOfSkyObject(await req.json())) },
		'/atlas/satellites': { POST: async (req) => json(searchSatellites()) },
		'/atlas/satellites/:id/position': { POST: async (req) => json(await positionOfSatellite(await req.json(), req.params.id)) },
		'/atlas/satellites/:id/altitude-chart': { POST: async (req) => json(altitudeChartOfSatellite(await req.json())) },

		// Framing
		'/framing': { POST: async (req) => bytes(await frame(await req.json())) },
		'/framing/hips-surveys': HIPS_SURVEYS_RESPONSE,

		// Image
		'/image/open': { POST: async (req) => json(await openImage(await req.json())) },
		'/image/close': { POST: async (req) => json(closeImage(await req.json())) },
		'/image/save': { POST: (req) => json(saveImage()) },
		'/image/analyze': { POST: (req) => json(analyzeImage()) },
		'/image/annotate': { POST: (req) => json(annotateImage()) },
		'/image/coordinate-interpolation': { POST: () => json(coordinateInterpolation()) },
		'/image/statistics': { POST: () => json(statistics()) },
		'/image/fov-cameras': () => FOV_CAMERAS_RESPONSE,
		'/image/fov-telescopes': () => FOV_TELESCOPES_RESPONSE,

		// Fallback
		'/*': { OPTIONS: () => cors() },
	},
})

function json(data: unknown) {
	return Response.json(data)
}

function bytes(data: ArrayBuffer) {
	return new Response(data)
}

function cors() {
	return new Response(null, { headers: CORS_HEADERS })
}

console.info(`server is started at port: ${SERVER.port}`)
