// biome-ignore format:
import { type DefNumberVector, type DefSwitchVector, type DefTextVector, type IndiClient, type IndiClientHandler, type NumberVectorTag, PropertyPermission, PropertyState, type SetNumberVector, type SetSwitchVector, type SetTextVector, type SwitchVectorTag, type TextVectorTag } from 'nebulosa/src/indi'

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
	cfa: {
		offsetX: number
		offsetY: number
		type: CfaPattern
	}
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
	pixelSize: {
		x: number
		y: number
	}
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
	cfa: {
		offsetX: 0,
		offsetY: 0,
		type: 'RGGB',
	},
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
	hasThermometer: false,
	temperature: 0,
}

export class IndiService implements IndiClientHandler {
	private readonly cameras = new Map<string, Camera>()
	private readonly enqueuedSwitchMessages = new Map<string, [SwitchVectorTag, DefSwitchVector | SetSwitchVector]>()
	private readonly enqueuedTextMessages = new Map<string, [TextVectorTag, DefTextVector | SetTextVector]>()
	private readonly enqueuedNumberMessages = new Map<string, [NumberVectorTag, DefNumberVector | SetNumberVector]>()
	// private readonly deviceProperties = new Map<string, >()

	constructor(private readonly handler: IndiDeviceEventHandler) {}

	switchVector(client: IndiClient, message: DefSwitchVector | SetSwitchVector, tag: SwitchVectorTag) {
		const device = this.cameras.get(message.device)

		if (!device) {
			this.enqueuedSwitchMessages.set(message.name, [tag, message])
			return
		}

		switch (message.name) {
			case 'CONNECTION': {
				const connected = message.elements.CONNECT?.value === true

				if (connected !== device.connected) {
					device.connected = connected
					this.deviceUpdated(device, 'connected', message.state)
					// if (connected) ask(client, device)
				}

				return
			}
			case 'CCD_COOLER': {
				if (tag.startsWith('d')) {
					device.hasCoolerControl = true
					this.deviceUpdated(device, 'hasCoolerControl', message.state)
				}

				const cooler = message.elements.COOLER_ON?.value === true

				if (cooler !== device.cooler) {
					device.cooler = cooler
					this.deviceUpdated(device, 'cooler', message.state)
				}

				return
			}
			case 'CCD_CAPTURE_FORMAT': {
				if (tag.startsWith('d')) {
					device.frameFormats = Object.keys(message.elements)
					this.deviceUpdated(device, 'frameFormats', message.state)
				}

				return
			}
			case 'CCD_ABORT_EXPOSURE':
			case 'GUIDER_ABORT_EXPOSURE': {
				if (tag.startsWith('d')) {
					device.canAbort = (message as DefSwitchVector).permission !== PropertyPermission.READ_ONLY
					this.deviceUpdated(device, 'canAbort', message.state)
				}

				return
			}
		}
	}

	textVector(client: IndiClient, message: DefTextVector | SetTextVector, tag: TextVectorTag) {
		switch (message.name) {
			case 'DRIVER_INFO': {
				const type = parseInt(message.elements.DRIVER_INTERFACE.value)
				const executable = message.elements.DRIVER_EXEC.value
				const version = message.elements.DRIVER_VERSION.value

				if (isInterfaceType(type, DeviceInterfaceType.CCD)) {
					if (!this.cameras.has(message.device)) {
						const camera: Camera = { ...EMPTY_CAMERA, name: message.device, driver: { executable, version } }
						this.cameras.set(message.device, camera)
						this.processEnqueuedMessages(client, camera)
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
			this.enqueuedTextMessages.set(message.name, [tag, message])
			return
		}

		switch (message.name) {
			case 'CCD_CFA': {
				device.cfa.offsetX = parseInt(message.elements.CFA_OFFSET_X.value)
				device.cfa.offsetY = parseInt(message.elements.CFA_OFFSET_Y.value)
				device.cfa.type = message.elements.CFA_TYPE.value as CfaPattern
				this.deviceUpdated(device, 'cfa', message.state)
				return
			}
		}
	}

	numberVector(client: IndiClient, message: DefNumberVector | SetNumberVector, tag: NumberVectorTag) {
		const device = this.cameras.get(message.device)

		if (!device) {
			this.enqueuedNumberMessages.set(message.name, [tag, message])
			return
		}

		switch (message.name) {
			case 'CCD_INFO':
			case 'GUIDER_INFO': {
				device.pixelSize.x = message.elements.CCD_PIXEL_SIZE_X?.value ?? 0
				device.pixelSize.y = message.elements.CCD_PIXEL_SIZE_Y?.value ?? 0
				this.deviceUpdated(device, 'pixelSize', message.state)
				return
			}
		}
	}

	device(id: string): Device | undefined {
		return this.cameras.get(id)
	}

	deviceConnect(client: IndiClient, device: Device | string) {
		device = typeof device === 'string' ? this.device(device)! : device

		if (!device.connected) {
			client.switch({ device: device.name, name: 'CONNECTION', elements: { CONNECT: true } })
		}
	}

	deviceDisconnect(client: IndiClient, device: Device | string) {
		device = typeof device === 'string' ? this.device(device)! : device

		if (device.connected) {
			client.switch({ device: device.name, name: 'CONNECTION', elements: { DISCONNECT: true } })
		}
	}

	cameraCooler(client: IndiClient, camera: Camera | string, value: boolean) {
		camera = typeof camera === 'string' ? this.cameras.get(camera)! : camera

		if (camera.hasCoolerControl && camera.cooler !== value) {
			client.switch({ device: camera.name, name: 'CCD_COOLER', elements: { [value ? 'COOLER_ON' : 'COOLER_OFF']: true } })
		}
	}

	cameraTemperature(client: IndiClient, camera: Camera | string, value: number) {
		camera = typeof camera === 'string' ? this.cameras.get(camera)! : camera

		if (camera.canSetTemperature) {
			client.number({ device: camera.name, name: 'CCD_TEMPERATURE', elements: { CCD_TEMPERATURE_VALUE: value } })
		}
	}

	cameraFrameFormat(client: IndiClient, camera: Camera | string, value: string) {
		camera = typeof camera === 'string' ? this.cameras.get(camera)! : camera

		if (value && camera.frameFormats.includes(value)) {
			client.switch({ device: camera.name, name: 'CCD_CAPTURE_FORMAT', elements: { value: true } })
		}
	}

	cameraFrame(client: IndiClient, camera: Camera | string, X: number, Y: number, WIDTH: number, HEIGHT: number) {
		camera = typeof camera === 'string' ? this.cameras.get(camera)! : camera

		if (camera.canSubFrame) {
			client.number({ device: camera.name, name: 'CCD_FRAME', elements: { X, Y, WIDTH, HEIGHT } })
		}
	}

	cameraBin(client: IndiClient, camera: Camera | string, x: number, y: number) {
		camera = typeof camera === 'string' ? this.cameras.get(camera)! : camera

		if (camera.canBin) {
			client.number({ device: camera.name, name: 'CCD_BINNING', elements: { HOR_BIN: x, VER_BIN: y } })
		}
	}

	private deviceUpdated<D extends Device>(device: D, property: keyof D, state?: PropertyState) {
		if (this.cameras.has(device.name)) this.handler.cameraUpdated?.(device as unknown as Camera, property as keyof Camera, state)
		this.handler.deviceUpdated?.(device, property as string, state)
	}

	private processEnqueuedMessages(client: IndiClient, device: Device) {
		const switchMessages = this.enqueuedSwitchMessages.values().filter((e) => e[1].device === device.name)

		for (const [name, message] of switchMessages) {
			this.enqueuedSwitchMessages.delete(message.name)
			this.switchVector(client, message, name)
		}

		const textMessages = this.enqueuedTextMessages.values().filter((e) => e[1].device === device.name)

		for (const [name, message] of textMessages) {
			this.enqueuedTextMessages.delete(message.name)
			this.textVector(client, message, name)
		}

		const numberMessages = this.enqueuedNumberMessages.values().filter((e) => e[1].device === device.name)

		for (const [name, message] of numberMessages) {
			this.enqueuedTextMessages.delete(message.name)
			this.numberVector(client, message, name)
		}
	}
}

export function ask(client: IndiClient, device: Device) {
	client.getProperties({ device: device.name })
}

export function isInterfaceType(value: number, type: DeviceInterfaceType) {
	return (value & type) !== 0
}
