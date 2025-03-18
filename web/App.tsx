import { MantineProvider, Stack, createTheme } from '@mantine/core'
import { IconPlugConnected } from '@tabler/icons-react'
import { Toolbar, type ToolbarButtonProps } from './components/Toolbar'
import './index.css'

const theme = createTheme({})

export function App() {
	const buttons: ToolbarButtonProps[] = [{ icon: IconPlugConnected, label: 'Connect' }]

	return (
		<MantineProvider theme={theme} defaultColorScheme='dark'>
			<Stack>
				<Toolbar buttons={buttons} />
			</Stack>
		</MantineProvider>
	)
}

export default App
