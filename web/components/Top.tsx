import * as api from '@/shared/api'
import { getItemOrDefault, saveItem } from '@/shared/storage'
import { Badge, Group, Select, type SelectProps, Stack } from '@mantine/core'
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import ConnectionButton from './ConnectionButton'
import { type ConnectionDetail, ConnectionModal } from './ConnectionModal'
import { IconButton } from './IconButton'

const EMPTY_CONNECTION: ConnectionDetail = {
	id: '0',
	name: '',
	host: 'localhost',
	port: 7624,
	type: 'INDI',
}

const DEFAULT_CONNECTION: ConnectionDetail = {
	...EMPTY_CONNECTION,
	id: `${Date.now()}`,
	name: 'Local',
}

const ConnectionDetailComparator = (a: ConnectionDetail, b: ConnectionDetail) => (a.connectedAt ?? 0) - (b.connectedAt ?? 0)

export function Top() {
	const [connected, setConnected] = useState(false)
	const [connecting, setConnecting] = useState(false)

	const connectOrDisconnect = async () => {
		if (connected && activeConnection.status?.id) {
			api.disconnect(activeConnection.status.id)
			setConnected(false)
		} else if (!connected) {
			try {
				setConnecting(true)

				const status = await api.connect(activeConnection)

				if (status) {
					setActiveConnection({ ...activeConnection, status })
					setConnected(true)

					const updated = connections.map((e) => {
						if (e.id !== activeConnection.id) return e
						e.connectedAt = Date.now()
						e.status = status
						return e
					})

					setConnections(updated)
					saveItem('connections', updated)
				}
			} finally {
				setConnecting(false)
			}
		}
	}

	const [connections, setConnections] = useState(getItemOrDefault<ConnectionDetail[]>('connections', [DEFAULT_CONNECTION]).sort(ConnectionDetailComparator))
	const [activeConnection, setActiveConnection] = useState(connections[0])
	const [showConnectionModal, setShowConnectionModal] = useState(false)
	const [editedConnection, setEditedConnection] = useState<ConnectionDetail>(EMPTY_CONNECTION)

	useEffect(() => {
		api.connections().then((statuses) => {
			if (statuses) {
				for (const status of statuses) {
					let found = false

					for (const connection of connections) {
						if (connection.status && status.ip && connection.status.ip === status.ip && connection.status.port === status.port) {
							setActiveConnection(connection)
                            setConnected(true)
							found = true
							break
						}
					}

					if (found) break
				}
			}
		})
	}, [])

	const addConnection = () => {
		setEditedConnection({ ...editedConnection, id: `${Date.now()}` })
		setShowConnectionModal(true)
	}

	const editConnection = (connection: ConnectionDetail) => {
		setEditedConnection(connection)
		setShowConnectionModal(true)
	}

	const saveConnection = (connection: ConnectionDetail) => {
		if (connection.name && connection.host && connection.port) {
			const index = connections.findIndex((e) => e.id === connection.id)

			if (index >= 0) {
				const updated = connections.map((e) => (e.id === connection.id ? connection : e))
				setConnections(updated)
				saveItem('connections', updated)
			} else {
				const added = [connection, ...connections]
				setConnections(added)
				saveItem('connections', added)
			}

			if (!(connected || connecting)) {
				setActiveConnection(connection)
			}

			setShowConnectionModal(false)
		}
	}

	const deleteConnection = (connection: ConnectionDetail) => {
		let deleted = connections.filter((e) => e.id !== connection.id)

		if (!deleted.length) {
			deleted = [DEFAULT_CONNECTION]
		}

		setConnections(deleted)
		saveItem('connections', deleted)

		if (deleted.length && connection.id === activeConnection.id) {
			setActiveConnection(deleted[0])
		}
	}

	const renderConnectionDetailOption: SelectProps['renderOption'] = ({ option }) => {
		const connection = connections.find((e) => e.id === option.value)!

		return (
			<Group justify='space-between' className='w-full'>
				<Stack gap={0} flex='1'>
					<Group gap={4}>
						<Badge color='blue' radius='xs' size='xs'>
							{connection.type}
						</Badge>
						<span className='font-bold'>{connection.name}</span>
					</Group>
					<span className='text-xs'>
						{connection.host}:{connection.port}
					</span>
				</Stack>
				<Stack gap={4}>
					<IconButton icon={IconPencil} label='Edit' size='sm' onClick={() => editConnection(connection)} />
					<IconButton icon={IconTrash} label='Delete' color='red' size='sm' onClick={() => deleteConnection(connection)} />
				</Stack>
			</Group>
		)
	}

	return (
		<Group justify='center'>
			<IconButton icon={IconPlus} label='Add connection' color='green' onClick={addConnection} />
			<Select variant='filled' renderOption={renderConnectionDetailOption} data={connections.map((e) => ({ label: e.name, value: e.id }))} value={activeConnection.id} onChange={(value) => setActiveConnection(connections.find((e) => e.id === value)!)} disabled={connecting || connected} allowDeselect={false} />
			<ConnectionButton connected={connected} onClick={connectOrDisconnect} disabled={connecting} />
			<ConnectionModal show={showConnectionModal} connection={editedConnection} onClose={() => setShowConnectionModal(false)} onSave={saveConnection} />
		</Group>
	)
}

export default Top
