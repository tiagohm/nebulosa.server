import type { Angle } from 'nebulosa/src/angle'
import type { FitsHeader } from 'nebulosa/src/fits'
import type { CfaPattern, ImageChannel, ImageMetadata } from 'nebulosa/src/image'
import type { PropertyState } from 'nebulosa/src/indi'
import type { Parity, PlateSolution, PlateSolveOptions } from 'nebulosa/src/platesolver'

// Atlas

export interface PositionOfBody {
	readonly dateTime: string
	readonly longitude: number
	readonly latitude: number
	readonly elevation: number
}

export interface AltitudeChartOfBody {
	readonly dateTime: string
	readonly stepSize: number
}

export interface BodyPosition {
	readonly rightAscensionJ2000: number
	readonly declinationJ2000: number
	readonly rightAscension: number
	readonly declination: number
	readonly azimuth: number
	readonly altitude: number
	readonly magnitude: number
	readonly constellation: string
	readonly distance: number
	readonly distanceUnit: string
	readonly illuminated: number
	readonly elongation: number
	readonly leading: boolean
}

// Confirmation

export interface Confirm {
	readonly key: string
	readonly accepted: boolean
}

export interface Confirmation extends WebSocketMessage {
	readonly type: 'CONFIRMATION'
	readonly key: string
	readonly message: string
}

// Connection

export type ConnectionType = 'INDI' | 'ALPACA'

export interface Connect {
	readonly host: string
	readonly port: number
	readonly type: ConnectionType
}

export interface ConnectionStatus extends Connect {
	readonly id: string
	readonly ip?: string
}

// File System

export interface ListDirectory {
	readonly path?: string
	readonly filter?: string
	readonly directoryOnly?: boolean
}

export interface CreateDirectory {
	readonly path: string
	readonly name: string
	readonly recursive?: boolean | undefined
	readonly mode?: string | number | undefined
}

export interface DirectoryEntry {
	readonly name: string
	readonly path: string
}

export interface FileEntry extends DirectoryEntry {
	readonly directory: boolean
	readonly size: number
	readonly updatedAt: number
}

export interface FileSystem {
	readonly path: string
	readonly tree: DirectoryEntry[]
	readonly entries: FileEntry[]
}

// Framing

export interface Framing {
	readonly hipsSurvey: string
	readonly rightAscension: string | Angle
	readonly declination: string | Angle
	readonly width: number
	readonly height: number
	fov: number // deg
	rotation: number // deg
}

// Image

export interface ImageStretch {
	auto: boolean
	shadow: number // 0 - 65536
	highlight: number // 0 - 65536
	midtone: number // 0 - 65536
	meanBackground?: number
}

export interface ImageScnr {
	readonly channel?: ImageChannel
	readonly amount: number
	readonly method: 'MAXIMUM_MASK' | 'ADDITIVE_MASK' | 'AVERAGE_NEUTRAL' | 'MAXIMUM_NEUTRAL' | 'MINIMUM_NEUTRAL'
}

export interface ImageAdjustment {
	readonly enabled: boolean
	readonly normalize: boolean
	readonly brightness: number
	readonly gamma: number
	readonly saturation: number
}

export interface ImageTransformation {
	readonly calibrationGroup?: string
	debayer: boolean
	readonly stretch: ImageStretch
	horizontalMirror: boolean
	verticalMirror: boolean
	invert: boolean
	readonly scnr: ImageScnr
	readonly useJPEG: boolean
	readonly adjustment: ImageAdjustment
}

export interface OpenImage {
	readonly path?: string
	readonly camera?: string
	readonly transformation: ImageTransformation
}

export interface CloseImage {
	readonly id: string
}

export interface ImageInfo {
	readonly path: string
	readonly width: number
	readonly height: number
	readonly mono: boolean
	readonly metatada: ImageMetadata
	readonly transformation: ImageTransformation
	readonly rightAscension?: Angle
	readonly declination?: Angle
	readonly headers: FitsHeader
	readonly solution?: PlateSolution
}

// INDI

export type DeviceType = 'CAMERA' | 'MOUNT' | 'WHEEL' | 'FOCUSER' | 'ROTATOR' | 'GPS' | 'DOME' | 'GUIDE_OUTPUT' | 'LIGHT_BOX' | 'DUST_CAP'

export type SubDeviceType = 'GUIDE_OUTPUT' | 'THERMOMETER' | 'GPS'

export type GuideDirection = 'NORTH' | 'SOUTH' | 'WEST' | 'EAST'

export interface DriverInfo {
	readonly executable: string
	readonly version: string
}

export interface Device {
	type: DeviceType
	id: string
	name: string
	connected: boolean
	driver: DriverInfo
	client: ConnectionStatus
}

export interface Thermometer extends Device {
	hasThermometer: boolean
	temperature: number
}

export interface GuideOutput extends Device {
	canPulseGuide: boolean
	pulseGuiding: boolean
}

export interface Camera extends GuideOutput, Thermometer {
	hasCoolerControl: boolean
	coolerPower: number
	cooler: boolean
	hasDewHeater: boolean
	dewHeater: boolean
	frameFormats: string[]
	canAbort: boolean
	cfa: {
		offsetX: number
		offsetY: number
		type: CfaPattern
	}
	exposure: {
		time: number
		min: number
		max: number
		state: PropertyState
	}
	hasCooler: boolean
	canSetTemperature: boolean
	canSubFrame: boolean
	frame: {
		x: number
		minX: number
		maxX: number
		y: number
		minY: number
		maxY: number
		width: number
		minWidth: number
		maxWidth: number
		height: number
		minHeight: number
		maxHeight: number
	}
	canBin: boolean
	bin: {
		maxX: number
		maxY: number
		x: number
		y: number
	}
	gain: {
		value: number
		min: number
		max: number
	}
	offset: {
		value: number
		min: number
		max: number
	}
	pixelSize: {
		x: number
		y: number
	}
}

export interface GuidePulse {
	readonly direction: GuideDirection
	readonly duration: number
}

// Message

export interface WebSocketMessage {
	readonly type: string
}

// Notification

export type Severity = 'info' | 'success' | 'warn' | 'error'

export interface Notification extends WebSocketMessage {
	readonly type: 'NOTIFICATION'
	readonly target?: string
	readonly severity?: Severity
	readonly title?: string
	readonly body: string
}

// Plate Solver

export type PlateSolverType = 'ASTAP' | 'PIXINSIGHT' | 'ASTROMETRY_NET' | 'NOVA_ASTROMETRY_NET' | 'SIRIL'

export interface PlateSolveStart extends Omit<Readonly<PlateSolveOptions>, 'ra' | 'dec'> {
	readonly id: string
	readonly type: PlateSolverType
	readonly executable: string
	readonly path: string
	readonly focalLength: number
	readonly pixelSize: number
	readonly apiUrl?: string
	readonly apiKey?: string
	readonly slot?: number
	readonly blind: boolean
	readonly ra: string | number // hours
	readonly dec: string | number // deg
}

export interface PlateSolveStop {
	readonly id: string
}

export interface PlateSolved {
	readonly solved: boolean
	readonly orientation?: number
	readonly scale?: number
	readonly rightAscension?: Angle
	readonly declination?: Angle
	readonly width?: number
	readonly height?: number
	readonly radius?: number
	readonly parity?: Parity
}

// Star Detection

export type StarDetectionType = 'ASTAP'

export interface StarDetection {
	readonly type: StarDetectionType
	readonly executable?: string
	readonly path: string
	readonly timeout: number
	readonly minSNR: number
	readonly maxStars: number
	readonly slot: number
}

// Misc

export interface Point {
	x: number
	y: number
}

export const DEFAULT_CAMERA: Camera = {
	hasCoolerControl: false,
	coolerPower: 0,
	cooler: false,
	hasDewHeater: false,
	dewHeater: false,
	frameFormats: [],
	canAbort: false,
	cfa: {
		offsetX: 0,
		offsetY: 0,
		type: 'RGGB',
	},
	exposure: {
		time: 0,
		min: 0,
		max: 0,
		state: 'Idle',
	},
	hasCooler: false,
	canSetTemperature: false,
	canSubFrame: false,
	frame: {
		x: 0,
		minX: 0,
		maxX: 0,
		y: 0,
		minY: 0,
		maxY: 0,
		width: 0,
		minWidth: 0,
		maxWidth: 0,
		height: 0,
		minHeight: 0,
		maxHeight: 0,
	},
	canBin: false,
	bin: {
		maxX: 0,
		maxY: 0,
		x: 0,
		y: 0,
	},
	gain: {
		value: 0,
		min: 0,
		max: 0,
	},
	offset: {
		value: 0,
		min: 0,
		max: 0,
	},
	pixelSize: {
		x: 0,
		y: 0,
	},
	canPulseGuide: false,
	pulseGuiding: false,
	type: 'CAMERA',
	id: '',
	name: '',
	connected: false,
	driver: {
		executable: '',
		version: '',
	},
	client: {
		id: '',
		type: 'INDI',
		host: '',
		port: 0,
	},
	hasThermometer: false,
	temperature: 0,
}

export function isCamera(device: Device): device is Camera {
	return device.type === 'CAMERA'
}

export function isThermometer(device: Device): device is Thermometer {
	return 'hasThermometer' in device && device.hasThermometer !== undefined
}

export function isGuideOutput(device: Device): device is GuideOutput {
	return 'canPulseGuide' in device && device.canPulseGuide !== undefined
}

export const X_IMAGE_INFO_HEADER = 'X-Image-Info'

export const DEFAULT_IMAGE_STRETCH: ImageStretch = {
	auto: true,
	shadow: 0,
	highlight: 65536,
	midtone: 32768,
	meanBackground: 0.25,
}

export const DEFAULT_IMAGE_SCNR: ImageScnr = {
	channel: 'GREEN',
	amount: 0,
	method: 'MAXIMUM_MASK',
}

export const DEFAULT_IMAGE_ADJUSTMENT: ImageAdjustment = {
	enabled: false,
	normalize: false,
	brightness: 1,
	gamma: 1,
	saturation: 1,
}

export const DEFAULT_IMAGE_TRANSFORMATION: ImageTransformation = {
	debayer: true,
	stretch: DEFAULT_IMAGE_STRETCH,
	horizontalMirror: false,
	verticalMirror: false,
	invert: false,
	scnr: DEFAULT_IMAGE_SCNR,
	useJPEG: true,
	adjustment: DEFAULT_IMAGE_ADJUSTMENT,
}
