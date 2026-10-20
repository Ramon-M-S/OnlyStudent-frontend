<script setup>
import { ref } from 'vue'
import ClassStudentsView from './ClassStudentsView.vue'
import ClassAnnouncementsView from './ClassAnnouncementsView.vue'

defineProps({ 
  classroom: { type: Object, required: true }, 
  error: { type: String, default: '' }, 
  canViewStudents: Boolean,
  session: { type: Object, required: true }
})

const emit = defineEmits(['navigate'])
// Muda para 'announcements' para abrir os avisos primeiro
const activeTab = ref('announcements') 
</script>

<template>
  <section class="container workspace">
    <div class="workspace-heading">
      <div>
        <span class="eyebrow">TURMA</span>
        <h1>{{ classroom.name }}</h1>
      </div>
      <button class="text-button" @click="emit('navigate', 'dashboard')">← Minhas turmas</button>
    </div>
    
    <p v-if="error" class="message error" role="alert">{{ error }}</p>

    <div class="class-detail">
      <p>{{ classroom.description }}</p>
      
      <!-- Barra de Abas: Nova Ordem e Fontes -->
      <div class="class-tabs" role="tablist" aria-label="Conteúdo da turma" style="font-size: 1.1rem;">
        <button
          id="announcements-tab"
          class="class-tab"
          :class="{ active: activeTab === 'announcements' }"
          role="tab"
          :aria-selected="activeTab === 'announcements'"
          aria-controls="announcements-panel"
          @click="activeTab = 'announcements'"
          style="font-size: 1.1rem; font-weight: 600;"
        >Avisos</button>

        <button
          id="materials-tab"
          class="class-tab"
          :class="{ active: activeTab === 'materials' }"
          role="tab"
          :aria-selected="activeTab === 'materials'"
          aria-controls="materials-panel"
          @click="activeTab = 'materials'"
          style="font-size: 1.1rem; font-weight: 600;"
        >Materiais</button>

        <button
          v-if="canViewStudents"
          id="students-tab"
          class="class-tab"
          :class="{ active: activeTab === 'students' }"
          role="tab"
          :aria-selected="activeTab === 'students'"
          aria-controls="students-panel"
          @click="activeTab = 'students'"
          style="font-size: 1.1rem; font-weight: 600;"
        >Alunos</button>
      </div>

      <Transition name="tab-panel" mode="out-in">
        <!-- Painel de Avisos (Padrão) -->
        <div v-if="activeTab === 'announcements'" id="announcements-panel" key="announcements" class="tab-panel" role="tabpanel" aria-labelledby="announcements-tab">
          <ClassAnnouncementsView 
            :classroom="classroom" 
            :session="session" 
            :canViewStudents="canViewStudents" 
          />
        </div>

        <!-- Painel de Materiais -->
        <div v-else-if="activeTab === 'materials'" id="materials-panel" key="materials" class="tab-panel" role="tabpanel" aria-labelledby="materials-tab">
          <div v-if="classroom.materiais?.length" class="material-list">
            <a v-for="material in classroom.materiais" :key="material.id" :href="material.url" target="_blank" rel="noopener noreferrer">
              <span>{{ material.tipo }}</span><strong>{{ material.name }}</strong><span>↗</span>
            </a>
          </div>
          <p v-else class="empty">O professor ainda não adicionou materiais.</p>
        </div>

        <!-- Painel de Alunos -->
        <ClassStudentsView
          v-else-if="activeTab === 'students' && canViewStudents"
          :key="`students-${classroom.codigo}`"
          :classroom="classroom"
        />
      </Transition>
    </div>
  </section>
</template>