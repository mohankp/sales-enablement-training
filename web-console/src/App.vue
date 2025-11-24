<template>
  <div class="app">
    <!-- Header -->
    <header class="header" v-if="authStore.token">
      <div class="header-content">
        <div class="logo">
          <h1>Sales Trainer</h1>
          <span class="tagline">AI-Powered Enablement Platform</span>
        </div>
        <div class="header-controls">
          <button class="btn btn--secondary btn--sm" @click="authStore.logout()">Logout</button>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="nav-tabs" v-if="authStore.token">
      <router-link to="/dashboard" class="nav-tab" active-class="active">Dashboard</router-link>
      <router-link to="/projects" class="nav-tab" active-class="active">Projects</router-link>
      <router-link to="/results" class="nav-tab" active-class="active">Results</router-link>
      <router-link to="/knowledge-base" class="nav-tab" active-class="active">Knowledge Base</router-link>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>

<style>
/* Global styles are imported in main.js */
</style>
