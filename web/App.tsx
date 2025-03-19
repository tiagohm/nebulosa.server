import { MantineProvider, Stack, createTheme } from '@mantine/core'
import Top from './components/Top'
import './index.css'

const theme = createTheme({})

export function App() {
	return (
		<MantineProvider theme={theme} defaultColorScheme='dark'>
			<Stack>
				<Top />
			</Stack>
		</MantineProvider>
	)
}

export default App
