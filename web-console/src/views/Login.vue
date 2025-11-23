<template>
  <div class="login-container">
    <div class="card login-card">
      <div class="card__header">
        <h2>Sales Training Console</h2>
      </div>
      <div class="card__body">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input v-model="username" type="text" required class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input v-model="password" type="password" required class="form-control" />
          </div>
          <button type="submit" class="btn btn--primary btn--full-width">Login</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const username = ref('')
const password = ref('')
const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    await authStore.login(username.value, password.value)
  } catch (e) {
    alert('Login failed')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--color-background);
}
.login-card {
  width: 100%;
  max-width: 400px;
}
</style>
