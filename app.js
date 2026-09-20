import { createApp } from 'vue'
import { createPinia} from "pinia";
import './style.css'
import App from './src/App.vue'
import { useAppStore } from './src/store'

// iOS standalone (Add to Home Screen) WKWebView can misreport 100vh/100dvh,
// leaving a gap at the bottom, so mirror the real visible height in a CSS var.
function updateAppHeight() {
    const height = window.visualViewport?.height || window.innerHeight
    document.documentElement.style.setProperty('--app-height', `${height}px`)
}
updateAppHeight()
window.visualViewport?.addEventListener('resize', updateAppHeight)
window.addEventListener('resize', updateAppHeight)
window.addEventListener('orientationchange', updateAppHeight)

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

const store = useAppStore(pinia)
store.initializeDateContext()
store.loadBookmarksFromStorage()

app.mount('#app')

if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`)
            .catch((err) => console.error('Service Worker registration failed:', err))
    })
}

