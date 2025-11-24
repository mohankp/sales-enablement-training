<template>
  <div class="projects-grid">
    <!-- Project List -->
    <div class="card">
      <div class="card__header">
        <h3>Projects</h3>
        <button @click="showCreateModal = true" class="btn btn--primary btn--sm">+ New Project</button>
      </div>
      <div class="card__body">
        <ul class="project-list">
          <li 
            v-for="project in projects" 
            :key="project.id" 
            class="project-item"
            :class="{ active: selectedProject?.id === project.id }"
            @click="selectProject(project)"
          >
            <div class="project-info">
              <span class="project-name">{{ project.name }}</span>
              <span class="project-desc">{{ project.description }}</span>
            </div>
            <span class="icon">›</span>
          </li>
          <li v-if="projects.length === 0" class="empty-state">No projects created yet.</li>
        </ul>
      </div>
    </div>

    <!-- Project Details -->
    <div class="card" v-if="selectedProject">
      <div class="card__header">
        <h3>{{ selectedProject.name }}</h3>
        <span class="status status--completed">Active</span>
      </div>
      <div class="card__body">
        <div class="detail-section">
          <h4>Upload Training Material</h4>
          <div class="upload-box">
            <input type="file" @change="handleFileChange" accept=".pdf" class="form-control" />
            <button @click="uploadToProject" :disabled="!selectedFile" class="btn btn--secondary">
              Upload PDF
            </button>
          </div>
        </div>

        <div class="detail-section">
          <h4>Topics</h4>
          <ul class="topic-list">
            <li v-for="topic in projectTopics" :key="topic.id" class="topic-item">
              <span class="topic-name">{{ topic.name }}</span>
              <button @click="startAssessment(topic.id)" class="btn btn--outline btn--xs">Start Quiz</button>
            </li>
            <li v-if="projectTopics.length === 0" class="empty-state">No topics extracted yet. Upload a PDF to begin.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <h3>Create New Project</h3>
        <div class="form-group">
          <label class="form-label">Project Name</label>
          <input v-model="newProject.name" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="newProject.description" class="form-control" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="showCreateModal = false" class="btn btn--outline">Cancel</button>
          <button @click="createProject" class="btn btn--primary">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const projects = ref([])
const selectedProject = ref(null)
const projectTopics = ref([])
const showCreateModal = ref(false)
const newProject = ref({ name: '', description: '' })
const selectedFile = ref(null)

const fetchProjects = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/projects/', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    projects.value = response.data
  } catch (e) {
    console.error(e)
  }
}

const selectProject = async (project) => {
  selectedProject.value = project
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/projects/${project.id}/topics`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    projectTopics.value = response.data
  } catch (e) {
    console.error(e)
  }
}

const createProject = async () => {
  try {
    await axios.post('http://localhost:8000/api/v1/projects/', newProject.value, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    showCreateModal.value = false
    newProject.value = { name: '', description: '' }
    fetchProjects()
  } catch (e) {
    alert('Failed to create project')
  }
}

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadToProject = async () => {
  if (!selectedFile.value || !selectedProject.value) return
  
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('project_id', selectedProject.value.id)
  
  try {
    await axios.post('http://localhost:8000/api/v1/upload_pdf', formData, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    alert('Upload started for project')
    selectedFile.value = null
  } catch (e) {
    alert('Upload failed')
  }
}

const startAssessment = async (topicId) => {
  // Logic to start assessment for a specific topic
  // For now, we'll just log it or alert
  alert(`Starting assessment for topic ${topicId}`)
  // In a real app, you'd call the start_assessment API with topic_id and redirect to a quiz view
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-24);
  align-items: start;
}

.project-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-12);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.2s;
}

.project-item:hover {
  background: var(--color-background-soft);
}

.project-item.active {
  background: var(--color-primary-light);
  border-left: 3px solid var(--color-primary);
}

.project-info {
  display: flex;
  flex-direction: column;
}

.project-name {
  font-weight: 500;
}

.project-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.detail-section {
  margin-bottom: var(--space-24);
}

.upload-box {
  display: flex;
  gap: var(--space-8);
  margin-top: var(--space-8);
}

.topic-list {
  list-style: none;
  padding: 0;
}

.topic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-8) 0;
  border-bottom: 1px solid var(--color-border);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: var(--color-background);
  padding: var(--space-24);
  border-radius: var(--radius-md);
  width: 400px;
  box-shadow: var(--shadow-lg);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-12);
  margin-top: var(--space-16);
}
</style>
