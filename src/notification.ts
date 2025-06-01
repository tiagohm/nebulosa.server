import type { WebSocketMessage, WebSocketMessageHandler } from './message'

export type Severity = 'info' | 'success' | 'warn' | 'error'

export interface Notification extends WebSocketMessage {
	readonly type: 'NOTIFICATION'
	target?: string
	severity?: Severity
	title?: string
	body: string
}

export class NotificationSender {
	constructor(private readonly webSocketMessageHandler: WebSocketMessageHandler) {}

	send(message: Omit<Notification, 'type'>) {
		this.webSocketMessageHandler.send<Notification>({ ...message, type: 'NOTIFICATION' })
	}
}
