import Elysia from 'elysia'
import { IndiClient, type IndiClientHandler } from 'nebulosa/src/indi'

export type ConnectionType = 'INDI' | 'ALPACA'

export interface Connect {
	host: string
	port: number
	type: ConnectionType
}

export interface ConnectionStatus extends Connect {
	id: string
	ip?: string
}

export class ConnectionService {
	private readonly clients = new Map<string, IndiClient>()

	client(id?: string): IndiClient | undefined {
		if (!id) return this.clients.values().next().value
		else return this.clients.get(id)
	}

	async connect(req: Connect, indiClientHandler: IndiClientHandler): Promise<ConnectionStatus | undefined> {
		for (const [, client] of this.clients) {
			if (client.localPort === req.port && (client.remoteHost === req.host || client.remoteIp === req.host)) {
				return this.status(client)
			}
		}

		if (req.type === 'INDI') {
			const client = new IndiClient({ protocol: indiClientHandler })

			if (await client.connect(req.host, req.port)) {
				const id = Bun.MD5.hash(`${client.remoteIp}:${client.remotePort}:INDI`, 'hex')
				this.clients.set(id, client)
				return this.status(client)
			}
		}

		return undefined
	}

	disconnect(id: string) {
		const client = this.clients.get(id)

		if (client) {
			client.close()
			this.clients.delete(id)
		}
	}

	status(key: string | IndiClient): ConnectionStatus | undefined {
		if (typeof key === 'string') {
			const client = this.clients.get(key)

			if (client) {
				return { type: 'INDI', id: key, ip: client.remoteIp, host: client.remoteHost!, port: client.remotePort! }
			}
		} else {
			for (const [id, client] of this.clients) {
				if (client === key) {
					return { type: 'INDI', id, ip: key.remoteIp, host: key.remoteHost!, port: key.remotePort! }
				}
			}
		}

		return undefined
	}

	list() {
		return Array.from(this.clients.values())
			.map((e) => this.status(e))
			.filter(Boolean)
	}
}

export function connection(connectionService: ConnectionService, indiClientHandler: IndiClientHandler) {
	const app = new Elysia({ prefix: '/connections' })

	app.get('/', () => {
		return connectionService.list()
	})

	app.post('/', async ({ body }) => {
		return await connectionService.connect(body as never, indiClientHandler)
	})

	app.get('/:id', ({ params }) => {
		return connectionService.status(params.id)
	})

	app.delete('/:id', ({ params }) => {
		connectionService.disconnect(params.id)
	})

	return app
}
