import { edenTreaty } from '@elysiajs/eden'
import type { App } from '../../src/app'
import type { Connect } from '../../src/connection'
import type { CreateDirectory, ListDirectory } from '../../src/file-system'
import type { OpenImage } from '../../src/image'
import { type ImageInfo, X_IMAGE_INFO_HEADER } from '../../src/types'

const DEFAULT_PORT = 7000
const DEFAULT_HEADERS = new Headers({ 'Content-Type': 'application/json' })
const BASE_URL = localStorage.getItem('api.url') || `${location.protocol}//${location.hostname}:${DEFAULT_PORT}`

export const app = edenTreaty<App>(BASE_URL)

// Connection

export function connect(req: Connect) {
	return app.connections.post(req)
}

export function disconnect(id: string) {
	return app.connections[id].delete()
}

export function connections() {
	return app.connections.get()
}

// Image

export async function openImage(req: OpenImage) {
	const response = await fetch(`${BASE_URL}/image/open`, { method: 'POST', body: JSON.stringify(req), headers: DEFAULT_HEADERS, redirect: 'follow' })

	if (response) {
		const blob = await response.blob()
		const info = JSON.parse(response.headers.get(X_IMAGE_INFO_HEADER)!) as ImageInfo
		return { blob, info }
	}
}

// File System

export function listDirectory(req: ListDirectory = {}) {
	return app.fileSystem.list.post(req)
}

export function createDirectory(req: CreateDirectory) {
	return app.fileSystem.create.post(req)
}
