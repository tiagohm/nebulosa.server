import { type DefSwitchVector, type DefTextVector, type IndiClient, type IndiClientHandler, PropertyState, type SetSwitchVector, type SetTextVector, type SwitchVector, type TextVector } from 'nebulosa/src/indi'

export type DeviceType = 'CAMERA' | 'MOUNT' | 'WHEEL' | 'FOCUSER' | 'ROTATOR' | 'GPS' | 'DOME' | 'SWITCH' | 'GUIDE_OUTPUT' | 'LIGHT_BOX' | 'DUST_CAP'

export type CfaPattern = 'RGGB' | 'BGGR' | 'GBRG' | 'GRBG' | 'GRGB' | 'GBGR' | 'RGBG' | 'BGRG'

export enum DeviceInterfaceType {
	TELESCOPE = 0x0001, // Telescope interface, must subclass INDI::Telescope.
	CCD = 0x0002, // CCD interface, must subclass INDI::CCD.
	GUIDER = 0x0004, // Guider interface, must subclass INDI::GuiderInterface.
	FOCUSER = 0x0008, // Focuser interface, must subclass INDI::FocuserInterface.
	FILTER = 0x0010, // Filter interface, must subclass INDI::FilterInterface.
	DOME = 0x0020, // Dome interface, must subclass INDI::Dome.
	GPS = 0x0040, // GPS interface, must subclass INDI::GPS.
	WEATHER = 0x0080, // Weather interface, must subclass INDI::Weather.
	AO = 0x0100, // Adaptive Optics Interface.
	DUSTCAP = 0x0200, // Dust Cap Interface.
	LIGHTBOX = 0x0400, // Light Box Interface.
	DETECTOR = 0x0800, // Detector interface, must subclass INDI::Detector.
	ROTATOR = 0x1000, // Rotator interface, must subclass INDI::RotatorInterface.
	SPECTROGRAPH = 0x2000, // Spectrograph interface.
	CORRELATOR = 0x4000, // Correlators (interferometers) interface.
	AUXILIARY = 0x8000, // Auxiliary interface.
	OUTPUT = 0x10000, // Digital Output (e.g. Relay) interface.
	INPUT = 0x20000, // Digital/Analog Input (e.g. GPIO) interface.
	POWER = 0x40000, // Auxiliary interface.
}

export interface DriverInfo {
	executable: string
	version: string
}

export interface Device {
	type: DeviceType
	id: string
	name: string
	connected: boolean
	driver: DriverInfo
}

export interface CompanionDevice<D extends Device> extends Device {
	main: D
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
	exposuring: boolean
	hasCoolerControl: boolean
	coolerPower: number
	cooler: boolean
	hasDewHeater: boolean
	dewHeater: boolean
	frameFormats: string[]
	canAbort: boolean
	cfaOffsetX: number
	cfaOffsetY: number
	cfaType: CfaPattern
	exposureMin: number
	exposureMax: number
	exposureState: PropertyState
	exposureTime: number
	hasCooler: boolean
	canSetTemperature: boolean
	canSubFrame: boolean
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
	canBin: boolean
	maxBinX: number
	maxBinY: number
	binX: number
	binY: number
	gain: number
	gainMin: number
	gainMax: number
	offset: number
	offsetMin: number
	offsetMax: number
	guideHead?: GuideHead
	pixelSizeX: number
	pixelSizeY: number
}

export interface GuideHead extends Exclude<Camera, 'guideHead'>, CompanionDevice<Camera> {}

export interface IndiDeviceEventHandler {
	readonly deviceUpdated?: (device: Device, property: string, state?: PropertyState) => void
	readonly cameraUpdated?: (camera: Camera, property: keyof Camera, state?: PropertyState) => void
	readonly cameraAdded?: (camera: Camera) => void
	readonly cameraRemoved?: (camera: Camera) => void
}

const EMPTY_CAMERA: Camera = {
	exposuring: false,
	hasCoolerControl: false,
	coolerPower: 0,
	cooler: false,
	hasDewHeater: false,
	dewHeater: false,
	frameFormats: [],
	canAbort: false,
	cfaOffsetX: 0,
	cfaOffsetY: 0,
	cfaType: 'RGGB',
	exposureMin: 0,
	exposureMax: 0,
	exposureState: PropertyState.IDLE,
	exposureTime: 0,
	hasCooler: false,
	canSetTemperature: false,
	canSubFrame: false,
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
	canBin: false,
	maxBinX: 0,
	maxBinY: 0,
	binX: 0,
	binY: 0,
	gain: 0,
	gainMin: 0,
	gainMax: 0,
	offset: 0,
	offsetMin: 0,
	offsetMax: 0,
	pixelSizeX: 0,
	pixelSizeY: 0,
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
	hasThermometer: false,
	temperature: 0,
}

export class IndiService implements IndiClientHandler {
	private readonly cameras = new Map<string, Camera>()
	private readonly enqueuedSwitchMessages: SwitchVector[] = []
	private readonly enqueuedTextMessages: TextVector[] = []

	constructor(private readonly handler: IndiDeviceEventHandler) {}

	switchVector(client: IndiClient, message: DefSwitchVector | SetSwitchVector) {
		const device = this.cameras.get(message.device)

		if (!device) {
			this.enqueuedSwitchMessages.push(message)
			return
		}

		switch (message.name) {
			case 'CONNECTION': {
				const connected = message.elements.CONNECT?.value === true

				if (connected !== device.connected) {
					device.connected = connected

					if (this.cameras.has(device.name)) this.handler.cameraUpdated?.(device, 'connected', message.state)
					this.handler.deviceUpdated?.(device, 'connected', message.state)

					// if (connected) ask(client, device)
				}

				return
			}
		}
	}

	textVector(client: IndiClient, message: DefTextVector | SetTextVector) {
		switch (message.name) {
			case 'DRIVER_INFO': {
				const type = parseInt(message.elements.DRIVER_INTERFACE?.value || '0')
				const executable = message.elements.DRIVER_EXEC?.value || ''
				const version = message.elements.DRIVER_VERSION?.value || ''

				if (isInterfaceType(type, DeviceInterfaceType.CCD)) {
					if (!this.cameras.has(message.device)) {
						const camera: Camera = { ...EMPTY_CAMERA, name: message.device, driver: { executable, version } }
						this.cameras.set(message.device, camera)
						this.handler.cameraAdded?.(camera)
					}
				} else if (this.cameras.has(message.device)) {
					const camera = this.cameras.get(message.device)!
					this.cameras.delete(message.device)
					this.handler.cameraRemoved?.(camera)
				}

				return
			}
		}

		const device = this.cameras.get(message.device)

		if (!device) {
			this.enqueuedTextMessages.push(message)
			return
		}
	}
}

export function ask(client: IndiClient, device: Device) {
	client.getProperties({ device: device.name })
}

export function isInterfaceType(value: number, type: DeviceInterfaceType) {
	return (value & type) !== 0
}
