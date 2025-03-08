import type { ServerWebSocket, WebSocketHandler } from 'bun'

const sockets = new Set<ServerWebSocket>()

export const webSocketMessageHandler: WebSocketHandler = {
	open: (socket) => {
		if (!sockets.has(socket)) {
			sockets.add(socket)
			console.info('WebSocket connected: ', socket.remoteAddress)
		}
	},
	message: (socket, data) => {},
	close: (socket, code, reason) => {
		if (sockets.has(socket)) {
			console.info('WebSocket closed: ', code, reason)
			sockets.delete(socket)
		}
	},
}

export interface WebSocketMessage {
	type: string
}

export function sendMessage(message: WebSocketMessage) {
	const data = JSON.stringify(message)

	sockets.forEach((socket) => {
		socket.sendText(data)
	})
}
