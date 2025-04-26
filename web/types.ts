import type { Connect, ConnectionStatus } from '../src/types'

export interface Connection extends Connect {
	id: number
	name: string
	connectedAt?: number
	status?: ConnectionStatus
}

export const DEFAULT_CONNECTION: Connection = {
	id: Date.now(),
	name: 'Local',
	host: 'localhost',
	port: 7624,
	type: 'INDI',
}
