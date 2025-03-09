import type { ServerWebSocket, WebSocketHandler } from 'bun'

export interface WebSocketMessage {
	type: string
}

export class WebSocketMessageHandler implements WebSocketHandler {
	private readonly sockets = new Set<ServerWebSocket<unknown>>()

	open(socket: ServerWebSocket<unknown>) {
		if (!this.sockets.has(socket)) {
			this.sockets.add(socket)
			console.info('WebSocket connected: ', socket.remoteAddress)
		}
	}

	message(socket: ServerWebSocket<unknown>, message: string | Buffer) {
		//
	}

	close(socket: ServerWebSocket<unknown>, code: number, reason: string) {
		if (this.sockets.has(socket)) {
			console.info('WebSocket closed: ', code, reason)
			this.sockets.delete(socket)
		}
	}

	send<T extends WebSocketMessage>(message: T) {
		const data = JSON.stringify(message)

		this.sockets.forEach((socket) => {
			socket.sendText(data)
		})
	}
}
