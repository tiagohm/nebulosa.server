import type { Connect, ConnectionStatus, CreateDirectory, ImageInfo, ListDirectory, OpenImage } from '../../src/types'
import { X_IMAGE_INFO_HEADER } from '../../src/types'

// Connection

export function connect(req: Connect) {
	return POST<ConnectionStatus>('connections', req)
}

export function disconnect(id: string) {
	return DELETE(`connections/${id}`)
}

export function connections() {
	return GET<ConnectionStatus[]>('connections')
}

// Image

export async function openImage(req: OpenImage) {
	const data = await BLOB('image/open', 'POST', req)

	if (data) {
		const { blob, headers } = data
		const info = JSON.parse(headers.get(X_IMAGE_INFO_HEADER)!) as ImageInfo
		return { blob, info }
	}

	return undefined
}

// File System

export function listDirectory(req?: ListDirectory) {
	return POST<FileSystem>('file-system/list', req)
}

export function createDirectory(req: CreateDirectory) {
	return POST<{ path: string }>('file-system/create', req)
}

const DEFAULT_HEADERS = new Headers({ 'Content-Type': 'application/json' })

const DEFAULT_URL = 'http://localhost:7000'

async function request(path: string, init?: RequestInit) {
	const url = localStorage.getItem('api.url') || DEFAULT_URL

	try {
		return await fetch(`${url}/${path}`, init)
	} catch {
		return undefined
	}
}

function json<T>(text?: string) {
	return text ? (JSON.parse(text) as T) : undefined
}

async function GET<T>(path: string) {
	const response = await request(path, { method: 'GET', redirect: 'follow' })
	const text = await response?.text()
	return json<T>(text)
}

async function POST<T>(path: string, body?: unknown) {
	const raw = body === undefined || body === null ? undefined : JSON.stringify(body)
	const response = await request(path, { method: 'POST', body: raw, headers: DEFAULT_HEADERS, redirect: 'follow' })
	const text = await response?.text()
	return json<T>(text)
}

async function PUT<T>(path: string, body?: unknown) {
	const raw = body === undefined || body === null ? undefined : JSON.stringify(body)
	const response = await request(path, { method: 'PUT', body: raw, headers: DEFAULT_HEADERS, redirect: 'follow' })
	const text = await response?.text()
	return json<T>(text)
}

function DELETE(path: string) {
	return request(path, { method: 'DELETE', redirect: 'follow' })
}

async function BLOB<T>(path: string, method: string, body?: unknown) {
	const raw = body === undefined || body === null ? undefined : JSON.stringify(body)
	const response = await request(path, { method, body: raw, headers: DEFAULT_HEADERS, redirect: 'follow' })
	const blob = await response?.blob()
	const headers = response?.headers
	return blob && headers ? { blob, headers } : undefined
}
