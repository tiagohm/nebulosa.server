import Elysia, { t, type Static } from 'elysia'
import type { WebSocketMessage, WebSocketMessageHandler } from './message'

const ConfirmBody = t.Object({
	key: t.String(),
	accepted: t.Boolean(),
})

export type Confirm = Static<typeof ConfirmBody>

export interface Confirmation extends WebSocketMessage {
	readonly type: 'CONFIRMATION'
	readonly key: string
	readonly message: string
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
			this.webSocketMessageHandler.send<Confirmation>({ ...message, type: 'CONFIRMATION' })
			setTimeout(() => resolve(false), timeout)
		})

		return confirmation.finally(() => this.confirmations.delete(message.key))
	}
}

export function confirmation(confirmationService: ConfirmationService) {
	return (
		new Elysia({ prefix: '/confirmation' })
			// Confirmation
			.post('/', ({ body }) => confirmationService.confirm(body), { body: ConfirmBody })
	)
}
