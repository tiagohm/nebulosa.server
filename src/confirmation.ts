import Elysia from 'elysia'
import type { WebSocketMessageHandler } from './message'
import type { Confirm, Confirmation } from './types'

const CONFIRMATION_TYPE = 'CONFIRMATION'

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

export function confirmation(confirmationService: ConfirmationService) {
	const app = new Elysia({ prefix: '/confirmation' })

	app.post('/', ({ body }) => {
		confirmationService.confirm(body as never)
	})

	return app
}
