import Elysia from 'elysia'
import { IndiClient, type IndiClientHandler } from 'nebulosa/src/indi'

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
	private readonly clients: IndiClient[] = []

	constructor(private readonly protocol: IndiClientHandler) {}

	client(id?: string): IndiClient | undefined {
		return this.clients.find((e) => e.id === id) ?? this.clients[0]
	}

	async connect(req: Connect): Promise<ConnectionStatus | false> {
		if (req.type === 'INDI') {
			const client = new IndiClient({ protocol: this.protocol })

			if (await client.connect(req.host, req.port)) {
				this.clients.push(client)
				return this.status(client)!
			}
		}

		return false
	}

	disconnect(id: string) {
		const index = this.clients.findIndex((e) => e.id === id)

		if (index >= 0) {
			this.clients[index].close()
			this.clients.splice(index, 1)
		}
	}

	status(id: string | IndiClient): ConnectionStatus | false {
		const client = typeof id === 'string' ? this.client(id) : id

		if (client instanceof IndiClient) {
			return { type: 'INDI', id: client.id!, host: client.host!, port: client.port! }
		}

		return false
	}

	list() {
		return this.clients.map((e) => this.status(e)).filter(Boolean)
	}
}

export function connection(connectionService: ConnectionService) {
	const app = new Elysia({ prefix: '/connections' })

	app.get('/', () => {
		return connectionService.list()
	})

	app.post('/', async ({ body }) => {
		return await connectionService.connect(body as never)
	})

	app.get('/:id', ({ params }) => {
		return connectionService.status(params.id)
	})

	app.delete('/:id', ({ params }) => {
		connectionService.disconnect(params.id)
	})

	return app
}
