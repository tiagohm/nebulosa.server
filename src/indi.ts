// biome-ignore format:
import { type DefBlobVector, type DefNumber, type DefNumberVector, type DefSwitchVector, type DefTextVector, type DefVector, type IndiClient, type IndiClientHandler, type OneNumber, PropertyPermission, PropertyState, type SetBlobVector, type SetNumberVector, type SetSwitchVector, type SetTextVector, type SetVector } from 'nebulosa/src/indi'

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

export interface IndiDeviceEventHandler {
	readonly deviceUpdated?: (device: Device, property: string, state?: PropertyState) => void
	readonly deviceAdded?: (device: Device) => void
	readonly deviceRemoved?: (device: Device) => void
	readonly cameraUpdated?: (camera: Camera, property: keyof Camera, state?: PropertyState) => void
	readonly cameraAdded?: (camera: Camera) => void
	readonly cameraRemoved?: (camera: Camera) => void
	readonly thermometerUpdated?: (thermometer: Thermometer, property: keyof Thermometer, state?: PropertyState) => void
	readonly thermometerAdded?: (thermometer: Thermometer) => void
	readonly thermometerRemoved?: (thermometer: Thermometer) => void
}

const EMPTY_CAMERA: Camera = {
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
		state: PropertyState.IDLE,
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
	hasThermometer: false,
	temperature: 0,
}

export function isCamera(device: Device): device is Camera {
	return device.type === 'CAMERA'
}

const THERMOMETER_PROPERTIES = ['termometer']

export class IndiService implements IndiClientHandler {
	private readonly cameras = new Map<string, Camera>()
	private readonly thermometers = new Map<string, Camera>()
	private readonly enqueuedMessages: [string, DefVector | SetVector][] = []
	private readonly properties = new Map<string, Record<string, DefVector>>()
	private readonly rejectedDevices = new Set<string>()

	constructor(private readonly handler: IndiDeviceEventHandler) {}

	switchVector(client: IndiClient, message: DefSwitchVector | SetSwitchVector, tag: string) {
		const device = this.device(message.device)

		if (!device) {
			this.enqueueMessage(message, tag)
			return
		}

		this.addProperty(device, message, tag)

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
				if (isCamera(device)) {
					if (tag[0] === 'd') {
						device.hasCoolerControl = true
						this.deviceUpdated(device, 'hasCoolerControl', message.state)
					}

					const cooler = message.elements.COOLER_ON?.value === true

					if (cooler !== device.cooler) {
						device.cooler = cooler
						this.deviceUpdated(device, 'cooler', message.state)
					}
				}

				return
			}
			case 'CCD_CAPTURE_FORMAT': {
				if (isCamera(device)) {
					if (tag[0] === 'd') {
						device.frameFormats = Object.keys(message.elements)
						this.deviceUpdated(device, 'frameFormats', message.state)
					}
				}

				return
			}
			case 'CCD_ABORT_EXPOSURE': {
				if (isCamera(device)) {
					if (tag[0] === 'd') {
						const canAbort = (message as DefSwitchVector).permission !== PropertyPermission.READ_ONLY
						device.canAbort = canAbort
						this.deviceUpdated(device, 'canAbort', message.state)
					}
				}

				return
			}
		}
	}

	textVector(client: IndiClient, message: DefTextVector | SetTextVector, tag: string) {
		switch (message.name) {
			case 'DRIVER_INFO': {
				const type = parseInt(message.elements.DRIVER_INTERFACE.value)
				const executable = message.elements.DRIVER_EXEC.value
				const version = message.elements.DRIVER_VERSION.value

				let reject = true

				if (isInterfaceType(type, DeviceInterfaceType.CCD)) {
					reject = false

					if (!this.cameras.has(message.device)) {
						const camera: Camera = { ...structuredClone(EMPTY_CAMERA), id: message.device, name: message.device, driver: { executable, version } }
						this.cameras.set(camera.name, camera)
						this.addProperty(camera, message, tag)
						this.processEnqueuedMessages(client, camera)
						this.handler.cameraAdded?.(camera)
						this.handler.deviceAdded?.(camera)
					}
				} else if (this.cameras.has(message.device)) {
					const camera = this.cameras.get(message.device)!
					this.removeCamera(camera)
				}

				if (reject) {
					this.rejectedDevices.add(message.device)
				}

				return
			}
		}

		const device = this.device(message.device)

		if (!device) {
			this.enqueueMessage(message, tag)
			return
		}

		this.addProperty(device, message, tag)

		switch (message.name) {
			case 'CCD_CFA': {
				if (isCamera(device)) {
					device.cfa.offsetX = parseInt(message.elements.CFA_OFFSET_X.value)
					device.cfa.offsetY = parseInt(message.elements.CFA_OFFSET_Y.value)
					device.cfa.type = message.elements.CFA_TYPE.value as CfaPattern
					this.deviceUpdated(device, 'cfa', message.state)
				}

				return
			}
		}
	}

	numberVector(client: IndiClient, message: DefNumberVector | SetNumberVector, tag: string) {
		const device = this.device(message.device)

		if (!device) {
			this.enqueueMessage(message, tag)
			return
		}

		this.addProperty(device, message, tag)

		switch (message.name) {
			case 'CCD_INFO': {
				if (isCamera(device)) {
					const x = message.elements.CCD_PIXEL_SIZE_X?.value ?? 0
					const y = message.elements.CCD_PIXEL_SIZE_Y?.value ?? 0

					if (device.pixelSize.x !== x || device.pixelSize.y !== y) {
						device.pixelSize.x = x
						device.pixelSize.y = y
						this.deviceUpdated(device, 'pixelSize', message.state)
					}
				}

				return
			}
			case 'CCD_EXPOSURE': {
				if (isCamera(device)) {
					const value = message.elements.CCD_EXPOSURE_VALUE
					let update = false

					if (tag[0] === 'd') {
						const { min, max } = value as DefNumber
						device.exposure.min = min
						device.exposure.max = max
						update = true
					}

					if (message.state && message.state !== device.exposure.state) {
						device.exposure.state = message.state
						update = true
					}

					if (device.exposure.state === PropertyState.BUSY || device.exposure.state === PropertyState.OK) {
						device.exposure.time = Math.trunc(value.value * 1000000)
						update = true
					}

					if (update) {
						this.deviceUpdated(device, 'exposure', message.state)
					}
				}

				return
			}
			case 'CCD_COOLER_POWER': {
				if (isCamera(device)) {
					const coolerPower = message.elements.CCD_COOLER_POWER?.value ?? 0

					if (device.coolerPower !== coolerPower) {
						device.coolerPower = coolerPower
						this.deviceUpdated(device, 'coolerPower', message.state)
					}
				}

				return
			}
			case 'CCD_TEMPERATURE': {
				if (isCamera(device)) {
					if (tag[0] === 'd') {
						if (!device.hasCooler) {
							device.hasCooler = true
							this.deviceUpdated(device, 'hasCooler', message.state)
						}

						const canSetTemperature = (message as DefNumberVector).permission !== PropertyPermission.READ_ONLY

						if (device.canSetTemperature !== canSetTemperature) {
							device.canSetTemperature = canSetTemperature
							this.deviceUpdated(device, 'canSetTemperature', message.state)
						}

						if (!device.hasThermometer) {
							device.hasThermometer = true
							this.thermometers.set(device.name, device)
						}
					}

					const temperatue = message.elements.CCD_TEMPERATURE_VALUE.value

					if (device.temperature !== temperatue) {
						device.temperature = temperatue
						this.deviceUpdated(device, 'temperature', message.state)
					}
				}

				return
			}
			case 'CCD_FRAME': {
				if (isCamera(device)) {
					const x = message.elements.X
					const y = message.elements.Y
					const width = message.elements.WIDTH
					const height = message.elements.HEIGHT

					if (tag[0] === 'd') {
						const canSubFrame = (message as DefNumberVector).permission !== PropertyPermission.READ_ONLY

						if (device.canSubFrame !== canSubFrame) {
							device.canSubFrame = canSubFrame
							this.deviceUpdated(device, 'canSubFrame', message.state)
						}

						device.frame.minX = (x as DefNumber).min
						device.frame.maxX = (x as DefNumber).max
						device.frame.minY = (y as DefNumber).min
						device.frame.maxY = (y as DefNumber).max
						device.frame.minWidth = (width as DefNumber).min
						device.frame.maxWidth = (width as DefNumber).max
						device.frame.minHeight = (height as DefNumber).min
						device.frame.maxHeight = (height as DefNumber).max
					}

					device.frame.x = x.value
					device.frame.y = y.value
					device.frame.width = width.value
					device.frame.height = height.value

					this.deviceUpdated(device, 'frame', message.state)
				}

				return
			}
			case 'CCD_BINNING': {
				if (isCamera(device)) {
					const binX = message.elements.HOR_BIN
					const binY = message.elements.VER_BIN

					if (tag[0] === 'd') {
						const canBin = (message as DefNumberVector).permission !== PropertyPermission.READ_ONLY

						if (device.canBin !== canBin) {
							device.canBin = canBin
							this.deviceUpdated(device, 'canBin', message.state)
						}

						device.bin.maxX = (binX as DefNumber).max
						device.bin.maxY = (binY as DefNumber).max
					}

					device.bin.x = binX.value
					device.bin.y = binY.value

					this.deviceUpdated(device, 'bin', message.state)
				}

				return
			}
			// ZWO ASI, SVBony, etc
			case 'CCD_CONTROLS': {
				if (isCamera(device)) {
					const gain = message.elements.Gain

					if (gain) {
						this.processGain(device.gain, gain, tag)
						this.deviceUpdated(device, 'gain', message.state)
					}

					const offset = message.elements.Offset

					if (offset) {
						this.processOffset(device.offset, offset, tag)
						this.deviceUpdated(device, 'offset', message.state)
					}
				}

				return
			}
			// CCD Simulator
			case 'CCD_GAIN': {
				if (isCamera(device)) {
					const gain = message.elements.GAIN

					if (gain) {
						this.processGain(device.gain, gain, tag)
						this.deviceUpdated(device, 'gain', message.state)
					}
				}

				return
			}
			case 'CCD_OFFSET': {
				if (isCamera(device)) {
					const offset = message.elements.OFFSET

					if (offset) {
						this.processGain(device.offset, offset, tag)
						this.deviceUpdated(device, 'offset', message.state)
					}
				}

				return
			}
		}
	}

	blobVector(client: IndiClient, message: DefBlobVector | SetBlobVector, tag: string) {
		const device = this.device(message.device)

		if (!device) {
			this.enqueueMessage(message, tag)
			return
		}

		this.addProperty(device, message, tag)
	}

	device(id: string): Device | undefined {
		return this.cameras.get(id)
	}

	deviceProperties(id: string) {
		return this.properties.get(id)
	}

	deviceConnect(client: IndiClient, device: Device) {
		if (!device.connected) {
			client.sendSwitch({ device: device.name, name: 'CONNECTION', elements: { CONNECT: true } })
		}
	}

	deviceDisconnect(client: IndiClient, device: Device) {
		if (device.connected) {
			client.sendSwitch({ device: device.name, name: 'CONNECTION', elements: { DISCONNECT: true } })
		}
	}

	cameraDeviceList() {
		return Array.from(this.cameras.values())
	}

	cameraDevice(id: string) {
		return this.cameras.get(id)
	}

	cameraCooler(client: IndiClient, camera: Camera, value: boolean) {
		if (camera.hasCoolerControl && camera.cooler !== value) {
			client.sendSwitch({ device: camera.name, name: 'CCD_COOLER', elements: { [value ? 'COOLER_ON' : 'COOLER_OFF']: true } })
		}
	}

	cameraTemperature(client: IndiClient, camera: Camera, value: number) {
		if (camera.canSetTemperature) {
			client.sendNumber({ device: camera.name, name: 'CCD_TEMPERATURE', elements: { CCD_TEMPERATURE_VALUE: value } })
		}
	}

	cameraFrameFormat(client: IndiClient, camera: Camera, value: string) {
		if (value && camera.frameFormats.includes(value)) {
			client.sendSwitch({ device: camera.name, name: 'CCD_CAPTURE_FORMAT', elements: { value: true } })
		}
	}

	cameraFrame(client: IndiClient, camera: Camera, X: number, Y: number, WIDTH: number, HEIGHT: number) {
		if (camera.canSubFrame) {
			client.sendNumber({ device: camera.name, name: 'CCD_FRAME', elements: { X, Y, WIDTH, HEIGHT } })
		}
	}

	cameraBin(client: IndiClient, camera: Camera, x: number, y: number) {
		if (camera.canBin) {
			client.sendNumber({ device: camera.name, name: 'CCD_BINNING', elements: { HOR_BIN: x, VER_BIN: y } })
		}
	}

	cameraGain(client: IndiClient, camera: Camera, value: number) {
		const properties = this.properties.get(camera.name)

		if (properties?.CCD_CONTROLS?.elements.Gain) {
			client.sendNumber({ device: camera.name, name: 'CCD_CONTROLS', elements: { Gain: value } })
		} else if (properties?.CCD_GAIN?.elements?.GAIN) {
			client.sendNumber({ device: camera.name, name: 'CCD_GAIN', elements: { GAIN: value } })
		}
	}

	cameraOffset(client: IndiClient, camera: Camera, value: number) {
		const properties = this.properties.get(camera.name)

		if (properties?.CCD_CONTROLS?.elements.Offset) {
			client.sendNumber({ device: camera.name, name: 'CCD_CONTROLS', elements: { Offset: value } })
		} else if (properties?.CCD_OFFSET?.elements?.OFFSET) {
			client.sendNumber({ device: camera.name, name: 'CCD_OFFSET', elements: { OFFSET: value } })
		}
	}

	private enqueueMessage(message: DefVector | SetVector, tag: string) {
		if (!this.rejectedDevices.has(message.device)) {
			this.enqueuedMessages.push([tag, message])
		}
	}

	private addProperty(device: Device, message: DefVector | SetVector, tag: string) {
		if (!this.properties.has(device.name)) {
			this.properties.set(device.name, {})
		}

		if (tag[0] === 'd') {
			this.properties.get(device.name)![message.name] = message as DefVector
		} else {
			// this.properties.get(device.name)![message.name]
			// TODO: Adicionar, atualizar e remover elementos
		}
	}

	private deviceUpdated<D extends Device>(device: D, property: keyof D & string, state?: PropertyState) {
		if (this.handler.cameraUpdated && this.cameras.has(device.name)) this.handler.cameraUpdated(device as never, property as keyof Camera, state)
		if (this.handler.thermometerUpdated && this.thermometers.has(device.name) && THERMOMETER_PROPERTIES.includes(property)) this.handler.thermometerUpdated(device as never, property as keyof Thermometer, state)
		this.handler.deviceUpdated?.(device, property as string, state)
	}

	private removeCamera(camera: Camera) {
		this.cameras.delete(camera.name)
		this.properties.delete(camera.name)

		this.handler.cameraRemoved?.(camera)
		this.handler.deviceRemoved?.(camera)
		this.removeThermometer(camera)
	}

	private removeThermometer(thermometer: Thermometer) {
		if (this.thermometers.has(thermometer.name)) {
			this.thermometers.delete(thermometer.name)

			thermometer.hasThermometer = false
			this.handler.thermometerRemoved?.(thermometer)
			this.handler.deviceRemoved?.(thermometer)
		}
	}

	private processGain(gain: Camera['gain'], element: DefNumber | OneNumber, tag: string) {
		if (tag[0] === 'd') {
			gain.min = (element as DefNumber).min
			gain.max = (element as DefNumber).max
		}

		gain.value = element.value
	}

	private processOffset(offset: Camera['offset'], element: DefNumber | OneNumber, tag: string) {
		if (tag[0] === 'd') {
			offset.min = (element as DefNumber).min
			offset.max = (element as DefNumber).max
		}

		offset.value = element.value
	}

	private processEnqueuedMessages(client: IndiClient, device: Device) {
		for (let i = 0; i < this.enqueuedMessages.length; i++) {
			const [tag, message] = this.enqueuedMessages[i]

			if (message.device === device.name) {
				this.enqueuedMessages.splice(i--, 1)

				if (tag.includes('Switch')) {
					this.switchVector(client, message as never, tag)
				} else if (tag.includes('Text')) {
					this.textVector(client, message as never, tag)
				} else if (tag.includes('Number')) {
					this.numberVector(client, message as never, tag)
				} else if (tag.includes('BLOB')) {
					this.blobVector(client, message as never, tag)
				}
			}
		}
	}
}

export function ask(client: IndiClient, device: Device) {
	client.getProperties({ device: device.name })
}

export function isInterfaceType(value: number, type: DeviceInterfaceType) {
	return (value & type) !== 0
}
