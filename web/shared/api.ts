import type { Connect, ConnectionStatus } from '../../src/connection'

export function connect(req: Connect) {
	return doPost<ConnectionStatus>('connections', req)
}

export function disconnect(id: string) {
	return doDelete(`connections/${id}`)
}

export function connections() {
	return doGet<ConnectionStatus[]>('connections')
}

const DEFAULT_HEADERS = new Headers({ 'Content-Type': 'application/json' })

const DEFAULT_URL = 'http://localhost:7000'

function doFetch(path: string, init?: RequestInit) {
	const url = localStorage.getItem('api.url') || DEFAULT_URL
	return fetch(`${url}/${path}`, init)
}

function makeResponse<T>(text: string) {
	return text ? (JSON.parse(text) as T) : undefined
}

export async function doGet<T>(path: string) {
	const response = await doFetch(path, { method: 'GET', redirect: 'follow' })
	const text = await response.text()
	return makeResponse<T>(text)
}

export async function doPost<T>(path: string, body?: unknown) {
	const raw = body === undefined || body === null ? undefined : JSON.stringify(body)
	const response = await doFetch(path, { method: 'POST', body: raw, headers: DEFAULT_HEADERS, redirect: 'follow' })
	const text = await response.text()
	return makeResponse<T>(text)
}

export async function doPut<T>(path: string, body?: unknown) {
	const raw = body === undefined || body === null ? undefined : JSON.stringify(body)
	const response = await doFetch(path, { method: 'PUT', body: raw, headers: DEFAULT_HEADERS, redirect: 'follow' })
	const text = await response.text()
	return makeResponse<T>(text)
}

export function doDelete(path: string) {
	return doFetch(path, { method: 'DELETE', redirect: 'follow' })
}
