import type { WebSocketMessage, WebSocketMessageHandler } from './message'

export const NOTIFICATION_TYPE = 'NOTIFICATION'

export type Severity = 'info' | 'success' | 'warn' | 'error'

export interface Notification extends WebSocketMessage {
	readonly type: 'NOTIFICATION'
	readonly target?: string
	readonly severity?: Severity
	readonly title?: string
	readonly body: string
}

export class NotificationSender {
	constructor(private readonly webSocketMessageHandler: WebSocketMessageHandler) {}

	send(message: Omit<Notification, 'type'>) {
		this.webSocketMessageHandler.send<Notification>({ ...message, type: NOTIFICATION_TYPE })
	}
}
