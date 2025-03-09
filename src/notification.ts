import type { WebSocketMessage, WebSocketMessageHandler } from './message'

export const NOTIFICATION_TYPE = 'NOTIFICATION'

export type Severity = 'info' | 'success' | 'warn' | 'error'

export interface Notification extends WebSocketMessage {
	type: 'NOTIFICATION'
	target?: string
	severity?: Severity
	title?: string
	body: string
}

export class NotificationSender {
	constructor(private readonly webSocketMessageHandler: WebSocketMessageHandler) {}

	send(message: Omit<Notification, 'type'>) {
        message.severity ||= 'info'
		message.title ||= message.severity.toUpperCase()
		this.webSocketMessageHandler.send<Notification>({ ...message, type: NOTIFICATION_TYPE })
	}
}
