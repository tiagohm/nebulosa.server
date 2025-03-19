import type { Connect, ConnectionStatus } from 'src/connection'

const DEFAULT_HEADERS: Record<string, string> = { 'Content-Type': 'application/json' }

async function GET<R>(path: string) {
	const url = new URL(path, location.href)
	const response = await fetch(url, { method: 'GET' })
	if (response.status < 300) return (await response.json()) as R
	else return undefined
}

async function POST<R>(path: string, body?: unknown) {
	const url = new URL(path, location.href)
	const response = await fetch(url, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined, headers: DEFAULT_HEADERS })
	if (response.status < 300) return (await response.json()) as R
	else return undefined
}

async function DELETE(path: string) {
	const url = new URL(path, location.href)
	const response = await fetch(url, { method: 'DELETE' })
	return response.status < 300
}

export function connections() {
	return GET<ConnectionStatus[]>('/connections')
}

export function connect(data: Connect) {
	return POST<ConnectionStatus | false>('/connections', data)
}

export function disconnect(id: string) {
	return DELETE(`/connections/${id}`)
}
