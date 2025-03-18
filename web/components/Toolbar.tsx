import { ActionIcon, Group, type MantineColor, type MantineSize, Tooltip } from '@mantine/core'
import type { IconUser } from '@tabler/icons-react'

export interface ToolbarButtonProps {
	icon: typeof IconUser
	label: string
	color?: MantineColor
	size?: number | MantineSize
	disabled?: boolean
	onClick?: () => void
}

export interface ToolbarProps {
	buttons: ToolbarButtonProps[]
}

export function ToolbarButton({ label, disabled, size, color, onClick, icon: Icon }: ToolbarButtonProps) {
	return (
		<Tooltip label={label} position='bottom'>
			<ActionIcon variant='subtle' size={size || 'xl'} color={color} disabled={disabled} onClick={onClick}>
				<Icon size={20} stroke={1.5} />
			</ActionIcon>
		</Tooltip>
	)
}

export function Toolbar({ buttons }: ToolbarProps) {
	const b = buttons.map((e) => <ToolbarButton {...e} key={e.label} />)

	return (
		<header>
			<div className='text-center'>
				<Group justify='center'>{b}</Group>
			</div>
		</header>
	)
}
