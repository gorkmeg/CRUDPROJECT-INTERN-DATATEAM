import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
app.use(router)
app.use(createPinia())
const authStore = useAuthStore()
authStore.initAuth()
app.mount('#app')

