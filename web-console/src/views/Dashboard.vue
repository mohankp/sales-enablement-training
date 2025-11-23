<template>
  <div class="dashboard-grid">
    <div class="card">
      <div class="card__header">
        <h3>Upload PDF</h3>
      </div>
      <div class="card__body">
        <div class="form-group">
          <label class="form-label">Select Training Document</label>
          <input type="file" @change="handleFileChange" accept=".pdf" class="form-control" />
        </div>
        <button @click="uploadFile" :disabled="!selectedFile" class="btn btn--primary">
          Upload Document
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="card__header">
        <div class="flex justify-between items-center">
          <h3>Processing Jobs</h3>
          <button @click="fetchJobs" class="btn btn--secondary btn--sm">Refresh</button>
        </div>
      </div>
      <div class="card__body p-0">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Filename</th>
              <th>Status</th>
              <th>Message</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.id">
              <td>#{{ job.id }}</td>
              <td>{{ job.filename }}</td>
              <td>
                <span :class="['status', getStatusClass(job.status)]">{{ job.status }}</span>
              </td>
              <td>{{ job.message }}</td>
              <td>{{ new Date(job.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const selectedFile = ref(null)
const jobs = ref([])

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadFile = async () => {
  if (!selectedFile.value) return
  
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  
  try {
    await axios.post('http://localhost:8000/api/v1/upload_pdf', formData, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    alert('Upload started')
    selectedFile.value = null
    fetchJobs()
  } catch (e) {
    alert('Upload failed')
  }
}

const fetchJobs = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/admin/jobs', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    jobs.value = response.data
  } catch (e) {
    console.error(e)
  }
}

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'status--success'
    case 'processing': return 'status--warning'
    case 'failed': return 'status--error'
    default: return 'status--info'
  }
}

onMounted(() => {
  fetchJobs()
  setInterval(fetchJobs, 5000)
})
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  gap: var(--space-24);
}
</style>
