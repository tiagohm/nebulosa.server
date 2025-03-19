import { IconPlugConnected, IconPlugConnectedX } from '@tabler/icons-react'
import { IconButton, type IconButtonProps } from './IconButton'

export interface ConnectionButtonProps extends Omit<IconButtonProps, 'icon' | 'label' | 'color'> {
	connected: boolean
}

export function ConnectionButton(props: ConnectionButtonProps) {
	return <IconButton {...props} icon={props.connected ? IconPlugConnectedX : IconPlugConnected} label={props.connected ? 'Disconnect' : 'Connect'} color={props.connected ? 'red' : undefined} />
}

export default ConnectionButton
