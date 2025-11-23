<template>
  <div class="kb-grid">
    <!-- File List -->
    <div class="card">
      <div class="card__header">
        <h3>Indexed Files</h3>
      </div>
      <div class="card__body">
        <ul class="file-list">
          <li v-for="file in files" :key="file" class="file-item">
            <span class="icon">📄</span>
            {{ file }}
          </li>
          <li v-if="files.length === 0" class="empty-state">No files indexed yet.</li>
        </ul>
      </div>
    </div>

    <!-- Search / Inspect -->
    <div class="card">
      <div class="card__header">
        <h3>Inspect Knowledge Base</h3>
      </div>
      <div class="card__body">
        <div class="form-group">
          <label class="form-label">Debug Search Query</label>
          <div class="flex gap-8">
            <input v-model="searchQuery" type="text" class="form-control" placeholder="e.g. 'objection handling'" @keyup.enter="search" />
            <button @click="search" class="btn btn--primary">Search</button>
          </div>
        </div>
        
        <div v-if="searchResults.length > 0" class="results-list">
          <div v-for="(result, index) in searchResults" :key="index" class="result-item">
            <div class="result-header">
              <span class="filename">{{ result.filename }}</span>
              <span class="score">Score: {{ result.score.toFixed(4) }}</span>
            </div>
            <p class="result-text">{{ result.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reprocess / Upload with Context -->
    <div class="card">
      <div class="card__header">
        <h3>Reprocess / Upload with Context</h3>
      </div>
      <div class="card__body">
        <div class="form-group">
          <label class="form-label">Select File</label>
          <input type="file" @change="handleFileChange" accept=".pdf" class="form-control" />
        </div>
        <div class="form-group">
          <label class="form-label">Additional Context (Optional)</label>
          <textarea v-model="context" class="form-control" rows="3" placeholder="e.g. Focus specifically on pricing tiers and negotiation strategies."></textarea>
          <p class="help-text">Provide specific instructions to guide the topic extraction.</p>
        </div>
        <button @click="uploadWithContext" :disabled="!selectedFile" class="btn btn--secondary">
          Upload & Reprocess
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const files = ref([])
const searchQuery = ref('')
const searchResults = ref([])
const selectedFile = ref(null)
const context = ref('')

const fetchFiles = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/admin/knowledge_base/files', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    files.value = response.data.files
  } catch (e) {
    console.error(e)
  }
}

const search = async () => {
  if (!searchQuery.value) return
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/admin/knowledge_base/search?query=${searchQuery.value}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    searchResults.value = response.data
  } catch (e) {
    console.error(e)
  }
}

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadWithContext = async () => {
  if (!selectedFile.value) return
  
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  if (context.value) {
    formData.append('context', context.value)
  }
  
  try {
    await axios.post('http://localhost:8000/api/v1/upload_pdf', formData, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    alert('Upload started with context')
    selectedFile.value = null
    context.value = ''
    // Optionally redirect to dashboard to see progress
  } catch (e) {
    alert('Upload failed')
  }
}

onMounted(() => {
  fetchFiles()
})
</script>

<style scoped>
.kb-grid {
  display: grid;
  gap: var(--space-24);
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-8) 0;
  border-bottom: 1px solid var(--color-border);
}

.result-item {
  background: var(--color-background);
  padding: var(--space-12);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-12);
  border: 1px solid var(--color-border);
}

.result-header {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.result-text {
  font-size: var(--font-size-sm);
  margin: 0;
}

.help-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--space-4);
}
</style>
