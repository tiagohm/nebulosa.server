import type { WebSocketMessage, WebSocketMessageHandler } from './message'

export const CONFIRMATION_TYPE = 'CONFIRMATION'

export interface Confirm {
	key: string
	accepted: boolean
}

export interface Confirmation extends WebSocketMessage {
	type: 'CONFIRMATION'
	key: string
	message: string
}

export class ConfirmationService {
	private readonly confirmations = new Map<string, (value: boolean) => void>()

	constructor(private readonly webSocketMessageHandler: WebSocketMessageHandler) {}

	confirm(req: Confirm) {
		this.confirmations.get(req.key)?.(req.accepted)
	}

	ask(message: Omit<Confirmation, 'type'>, timeout: number = 30000) {
		const confirmation = new Promise<boolean>((resolve) => {
			this.confirmations.set(message.key, resolve)
			this.webSocketMessageHandler.send<Confirmation>({ ...message, type: CONFIRMATION_TYPE })
			setTimeout(() => resolve(false), timeout)
		})

		return confirmation.finally(() => this.confirmations.delete(message.key))
	}
}
