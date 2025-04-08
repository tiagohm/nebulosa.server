import '@/assets/main.css'

import { ThemeOptions, ThemePreset } from '@/theme'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import DialogService from 'primevue/dialogservice'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { createApp } from 'vue'
import Home from './Home.vue'

const app = createApp(Home)

app.use(PrimeVue, {
	ripple: false,
	theme: {
		preset: ThemePreset,
		options: ThemeOptions,
	},
})

app.use(ToastService)
app.use(DialogService)
app.use(createPinia())

app.directive('tooltip', Tooltip)

app.mount('#app')
