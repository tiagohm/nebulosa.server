import { Button, Group, Modal, NumberInput, Stack, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import type { ConnectionStatus } from 'src/connection'

export interface ConnectionDetail extends Omit<ConnectionStatus, 'ip'> {
	name: string
	connectedAt?: number
	status?: ConnectionStatus
}

export interface ConnectionModalProps {
	show: boolean
	connection: ConnectionDetail
	onClose: () => void
	onSave: (connection: ConnectionDetail) => void
}

export function ConnectionModal({ show, onClose, onSave, connection }: ConnectionModalProps) {
	const [opened, { open, close }] = useDisclosure(false)

	const [name, setName] = useState(connection.name)
	const [host, setHost] = useState(connection.host)
	const [port, setPort] = useState(connection.port)

	useEffect(() => {
		if (show) {
			open()
		} else {
			close()
		}
	})

	useEffect(() => {
		setName(connection.name)
		setHost(connection.host)
		setPort(connection.port)
	}, [connection])

	return (
		<Modal opened={opened} onClose={onClose} title='Connection' centered>
			<Stack>
				<TextInput variant='filled' placeholder='Name' maxLength={32} value={name} onChange={(event) => setName(event.target.value)} required />
				<Group grow>
					<TextInput variant='filled' placeholder='Host' maxLength={256} value={host} onChange={(event) => setHost(event.target.value)} required />
					<NumberInput variant='filled' placeholder='Port' value={port} onChange={(value) => setPort(+value)} min={80} max={65535} allowDecimal={false} allowNegative={false} stepHoldDelay={500} stepHoldInterval={100} required />
				</Group>
				<Group justify='end'>
					<Button leftSection={<IconDeviceFloppy />} onClick={() => onSave({ ...connection, name, host, port })}>
						Save
					</Button>
				</Group>
			</Stack>
		</Modal>
	)
}

export default ConnectionModal
