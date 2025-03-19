import { ActionIcon, type FloatingPosition, type MantineColor, type MantineSize, Tooltip } from '@mantine/core'
import type { IconUser } from '@tabler/icons-react'

export interface IconButtonProps {
	icon: typeof IconUser
	label: string
	labelPosition?: FloatingPosition
	color?: MantineColor
	size?: number | MantineSize
	disabled?: boolean
	onClick?: () => void
}

export function IconButton({ label, labelPosition, color, size, disabled, onClick, icon: Icon }: IconButtonProps) {
	return (
		<Tooltip label={label} position={labelPosition || 'bottom'}>
			<ActionIcon variant='subtle' size={size || 'xl'} color={color} disabled={disabled} onClick={onClick}>
				<Icon />
			</ActionIcon>
		</Tooltip>
	)
}
