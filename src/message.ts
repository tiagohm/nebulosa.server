import type { WebSocketHandler } from 'bun'

export interface WebSocketMessage {
	type: string
}

export interface WebSocket {
	sendText: (data: string) => void
}

export class WebSocketMessageHandler implements WebSocketHandler {
	private readonly sockets = new Set<WebSocket>()

	open(socket: WebSocket) {
		if (!this.sockets.has(socket)) {
			this.sockets.add(socket)
			console.info('WebSocket connected')
		}
	}

	message(socket: WebSocket, message: string | Buffer) {
		//
	}

	close(socket: WebSocket, code: number, reason: string) {
		if (this.sockets.has(socket)) {
			console.info('WebSocket closed: ', code, reason)
			this.sockets.delete(socket)
		}
	}

	send<T extends WebSocketMessage>(message: T) {
		if (this.sockets.size) {
			const data = JSON.stringify(message)

			this.sockets.forEach((socket) => {
				socket.sendText(data)
			})
		}
	}
}
