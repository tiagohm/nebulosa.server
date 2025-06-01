import type { Angle } from 'nebulosa/src/angle'
import type { FitsHeader } from 'nebulosa/src/fits'
import type { CfaPattern, ImageFormat, ImageMetadata } from 'nebulosa/src/image'
import type { PropertyState } from 'nebulosa/src/indi'
import type { PlateSolution } from 'nebulosa/src/platesolver'
import type { ConnectionStatus } from './connection'
import type { ImageAdjustment, ImageScnr, ImageStretch, ImageTransformation } from './image'

// Atlas

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

// File System

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

export interface ImageInfo {
	readonly path: string
	readonly width: number
	readonly height: number
	readonly mono: boolean
	readonly format: Exclude<ImageFormat, 'fits' | 'xisf'>
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
