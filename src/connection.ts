import { IndiClient } from 'nebulosa/src/indi'
import { IndiService } from './indi'
import type { WebSocketMessageHandler } from './message'

export type ConnectionType = 'INDI' | 'ALPACA'

export interface Connect {
	host: string
	port: number
	type: ConnectionType
}

export interface ConnectionStatus {
	id: string
	type: ConnectionType
	host: string
	port: number
	ip?: string
}

export class ConnectionService {
	private readonly clients = new Map<string, IndiClient>()
	private readonly indi = new IndiService({
		// TODO: Handle close event to remove clients
		cameraUpdated: (device) => {
			this.webSocketMessageHandler.send({ type: 'CAMERA.UPDATED', device })
		},
		cameraAdded: (device) => {
			this.webSocketMessageHandler.send({ type: 'CAMERA.ADDED', device })
		},
		cameraRemoved: (device) => {
			this.webSocketMessageHandler.send({ type: 'CAMERA.REMOVED', device })
		},
	})

	constructor(private readonly webSocketMessageHandler: WebSocketMessageHandler) {}

	async connect(req: Connect): Promise<ConnectionStatus | false> {
		const id = Bun.MD5.hash(`${req.host}:${req.port}:${req.type}`, 'hex')

		if (this.clients.has(id)) return this.status(id)!

		if (req.type === 'INDI') {
			const client = new IndiClient({ protocol: this.indi })
			await client.connect(req.host, req.port)
			this.clients.set(id, client)
			return this.status(id)!
		}

		return false
	}

	disconnect(id: string) {
		this.clients.get(id)?.close()
	}

	status(id: string): ConnectionStatus | false {
		const client = this.clients.get(id)

		if (client instanceof IndiClient) {
			return { type: 'INDI', id, host: client.host!, port: client.port! }
		}

		return false
	}

	list() {
		return Array.from(this.clients.keys().map((e) => this.status(e))).filter(Boolean)
	}
}
