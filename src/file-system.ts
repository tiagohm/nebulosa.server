import { Glob } from 'bun'
import Elysia, { t, type Static } from 'elysia'
import fs from 'fs/promises'
import os from 'os'
import { basename, dirname, join } from 'path'
import type { DirectoryEntry, FileEntry } from './types'

const ListDirectoryBody = t.Object({
	path: t.Optional(t.String()),
	filter: t.Optional(t.String()),
	directoryOnly: t.Optional(t.Boolean({ default: false })),
})

const CreateDirectoryBody = t.Object({
	path: t.String(),
	name: t.String(),
	recursive: t.Optional(t.Boolean()),
	mode: t.Optional(t.Union([t.String(), t.Integer()])),
})

export type ListDirectory = Static<typeof ListDirectoryBody>
export type CreateDirectory = Static<typeof CreateDirectoryBody>

const fileEntryComparator = (a: FileEntry, b: FileEntry) => {
	if (a.directory === b.directory) return a.path.localeCompare(b.path)
	else if (a.directory) return -1
	else return 1
}

export class FileSystemService {
	// Lists the specified directory
	async list(req: ListDirectory) {
		const path = (await findDirectory(req.path)) || os.homedir()
		const glob = req.filter ? new Glob(req.filter) : undefined
		const entries: FileEntry[] = []

		for (const entry of await fs.readdir(path, { withFileTypes: true })) {
			const { name, parentPath } = entry
			const path = join(parentPath, name)
			const directory = entry.isDirectory()

			if (directory || entry.isFile()) {
				if (!req.directoryOnly || directory) {
					if (!glob || directory || glob.match(name)) {
						const { size, atimeMs: updatedAt } = await fs.stat(path)
						entries.push({ name, path, directory, size, updatedAt })
					}
				}
			}
		}

		entries.sort(fileEntryComparator)

		return { path, tree: makeDirectoryTree(path), entries }
	}

	// Creates a new directory
	async create(req: CreateDirectory) {
		const path = join(req.path, req.name.trim())
		await fs.mkdir(path, req)
		return { path }
	}
}

export function fileSystem(fileSystemService: FileSystemService) {
	return (
		new Elysia({ prefix: '/fileSystem' })
			// File System
			.post('/list', ({ body }) => fileSystemService.list(body), { body: ListDirectoryBody })
			.post('/create', ({ body }) => fileSystemService.create(body), { body: CreateDirectoryBody })
	)
}

export async function findDirectory(path?: string) {
	if (!path) return undefined
	else if (!(await fs.exists(path))) return findDirectory(dirname(path))
	else {
		const stats = await fs.stat(path)
		if (!stats.isDirectory()) return findDirectory(dirname(path))
		else return path
	}
}

function makeDirectoryTree(path: string): DirectoryEntry[] {
	const name = basename(path)

	if (!name) return [{ name, path }]

	const parent = dirname(path)
	const tree = makeDirectoryTree(parent)

	tree.push({ name, path })

	return tree
}
