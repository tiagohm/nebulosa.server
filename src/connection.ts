import { IndiClient } from 'nebulosa/src/indi'
import type { IndiService } from './indi'

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
	private clientId = ''

	constructor(private readonly indi: IndiService) {}

	// TODO: Allow multiple clients by passing id
	get client() {
		return this.clients.get(this.clientId)
	}

	async connect(req: Connect): Promise<ConnectionStatus | false> {
		const id = Bun.MD5.hash(`${req.host}:${req.port}:${req.type}`, 'hex')

		if (this.clients.has(id)) return this.status(id)!

		if (req.type === 'INDI') {
			const client = new IndiClient({ protocol: this.indi })
			await client.connect(req.host, req.port)
			this.clients.set(id, client)
			this.clientId = id
			return this.status(id)!
		}

		return false
	}

	disconnect(id: string) {
		this.clients.get(id)?.close()
		this.clients.delete(id)
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
