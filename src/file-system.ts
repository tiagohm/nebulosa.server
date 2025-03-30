import { Glob } from 'bun'
import Elysia from 'elysia'
import fs from 'fs/promises'
import os from 'os'
import { basename, dirname, join } from 'path'

export interface ListDirectory {
	path?: string
	filter?: string
}

export interface Directory {
	name: string
	path: string
}

export interface FileEntry extends Directory {
	directory: boolean
	size: number
	updatedAt: number
}

export interface FileSystem {
	path: string
	tree: Directory[]
	entries: FileEntry[]
}

export function fileSystem() {
	const app = new Elysia({ prefix: '/file-system' })

	app.post('/', async ({ body }) => {
		const req = body as ListDirectory
		const path = (await findDirectory(req.path)) || os.homedir()
		const glob = req.filter ? new Glob(req.filter) : undefined
		const entries: FileEntry[] = []

		for (const entry of await fs.readdir(path, { withFileTypes: true })) {
			const name = entry.name
			const path = join(entry.parentPath, name)
			const directory = entry.isDirectory()
			const file = entry.isFile()

			if (directory || file) {
				if (!glob || directory || glob.match(name)) {
					const { size, atimeMs: updatedAt } = await fs.stat(path)
					entries.push({ name, path, directory, size, updatedAt })
				}
			}
		}

		entries.sort(fileEntryComparator)

		return { path, tree: makeDirectoryTree(path), entries }
	})

	return app
}

const fileEntryComparator = (a: FileEntry, b: FileEntry) => {
	if (a.directory === b.directory) return a.path.localeCompare(b.path)
	else if (a.directory) return -1
	else return 1
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

function makeDirectoryTree(path: string): Directory[] {
	const name = basename(path)

	if (!name) return [{ name, path }]

	const parent = dirname(path)
	const tree = makeDirectoryTree(parent)

	tree.push({ name, path })

	return tree
}
