import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: null
    }),
    actions: {
        async login(username, password) {
            try {
                const formData = new FormData()
                formData.append('username', username)
                formData.append('password', password)

                const response = await axios.post('http://localhost:8000/api/v1/auth/token', formData)
                this.token = response.data.access_token
                localStorage.setItem('token', this.token)
                router.push('/dashboard')
            } catch (error) {
                console.error('Login failed', error)
                throw error
            }
        },
        logout() {
            this.token = null
            localStorage.removeItem('token')
            router.push('/login')
        }
    }
})
