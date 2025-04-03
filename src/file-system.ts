import { Glob } from 'bun'
import Elysia from 'elysia'
import type { MakeDirectoryOptions } from 'fs'
import fs from 'fs/promises'
import os from 'os'
import { basename, dirname, join } from 'path'

export interface ListDirectory {
	path?: string
	filter?: string
	directoryOnly?: boolean
}

export interface CreateDirectory extends MakeDirectoryOptions {
	path: string
	name: string
}

export interface DirectoryEntry {
	name: string
	path: string
}

export interface FileEntry extends DirectoryEntry {
	directory: boolean
	size: number
	updatedAt: number
}

export interface FileSystem {
	path: string
	tree: DirectoryEntry[]
	entries: FileEntry[]
}

const fileEntryComparator = (a: FileEntry, b: FileEntry) => {
	if (a.directory === b.directory) return a.path.localeCompare(b.path)
	else if (a.directory) return -1
	else return 1
}

export class FileSystemService {
	async list(req?: ListDirectory) {
		const path = (await findDirectory(req?.path)) || os.homedir()
		const glob = req?.filter ? new Glob(req.filter) : undefined
		const entries: FileEntry[] = []

		for (const entry of await fs.readdir(path, { withFileTypes: true })) {
			const { name, parentPath } = entry
			const path = join(parentPath, name)
			const directory = entry.isDirectory()

			if (directory || entry.isFile()) {
				if (!req?.directoryOnly || directory) {
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

	async create(req: CreateDirectory) {
		const path = join(req.path, req.name.trim())
		await fs.mkdir(path, req)
		return { path }
	}
}

export function fileSystem(fileSystemService: FileSystemService) {
	const app = new Elysia({ prefix: '/file-system' })

	app.post('/list', ({ body }) => fileSystemService.list(body as never))
	app.post('/create', ({ body }) => fileSystemService.create(body as never))

	return app
}

async function findDirectory(path?: string) {
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
