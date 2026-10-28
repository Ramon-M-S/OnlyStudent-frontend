<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { request } from '../lib/api.js'
import ClassStudentsView from './ClassStudentsView.vue'
import ClassAnnouncementsView from './ClassAnnouncementsView.vue'

const props = defineProps({
  classroom: { type: Object, required: true }, 
  error: { type: String, default: '' }, 
  canViewStudents: Boolean,
  session: { type: Object, required: true }
})

const emit = defineEmits(['navigate'])
const activeTab = ref('materials')
const materials = ref([])
const materialsLoading = ref(false)
const materialsError = ref('')
const showMaterialForm = ref(false)
const materialForm = reactive({ name: '', tipo: 'PDF', url: '', descricao: '' })
const materialEditandoId = ref(null)
const materialParaRemoverId = ref(null)
const materialSubmitting = ref(false)

const educatorId = computed(() => {
  const classroom = props.classroom
  return classroom.idEducator ?? classroom.idEducador ?? classroom.educatorId
    ?? classroom.educator?.id ?? classroom.educador?.id
})

const canManageMaterials = computed(() => {
  if (props.session.role !== 'educator') return false
  if (educatorId.value !== undefined && educatorId.value !== null) {
    return String(educatorId.value) === String(props.session.id)
  }
  return props.canViewStudents
})

function resetMaterialForm() {
  materialForm.name = ''
  materialForm.tipo = 'PDF'
  materialForm.url = ''
  materialForm.descricao = ''
}

function cancelMaterialEdit() {
  materialEditandoId.value = null
  resetMaterialForm()
  showMaterialForm.value = false
}

function editMaterial(material) {
  materialEditandoId.value = material.id
  materialForm.name = material.name || ''
  materialForm.tipo = material.tipo || 'PDF'
  materialForm.url = material.url || ''
  materialForm.descricao = material.descricao || ''
  showMaterialForm.value = true
  materialsError.value = ''
}

async function loadMaterials() {
  materialsLoading.value = true
  materialsError.value = ''
  try {
    const result = await request(`/turma/${props.classroom.codigo}/materials`, { token: props.session.token })
    materials.value = Array.isArray(result) ? result : (result?.content || result?.materials || [])
  } catch (cause) {
    materialsError.value = cause.message
    materials.value = props.classroom.materiais || []
  } finally {
    materialsLoading.value = false
  }
}

async function saveMaterial() {
  const name = materialForm.name.trim()
  const url = materialForm.url.trim()
  const descricao = materialForm.descricao.trim()
  if (!name || !materialForm.tipo || !/^https?:\/\//i.test(url)) {
    materialsError.value = 'Preencha nome e tipo e use uma URL iniciada por http:// ou https://.'
    return
  }

  materialSubmitting.value = true
  materialsError.value = ''
  try {
    const isEditing = materialEditandoId.value !== null
    const result = await request(
      isEditing ? `/material/${materialEditandoId.value}` : '/material/register',
      {
        method: isEditing ? 'PUT' : 'POST',
        token: props.session.token,
        body: {
          name,
          tipo: materialForm.tipo,
          url,
          descricao,
          turmaCodigo: props.classroom.codigo,
          ...(isEditing ? {} : {})
        }
      }
    )
    const submittedMaterial = { name, tipo: materialForm.tipo, url, descricao }
    if (isEditing) {
      materials.value = materials.value.map(material =>
        material.id === materialEditandoId.value
          ? { ...material, ...submittedMaterial, ...(result && typeof result === 'object' ? result : {}) }
          : material
      )
    } else {
      materials.value.push(result && typeof result === 'object'
        ? result
        : submittedMaterial)
    }
    cancelMaterialEdit()
  } catch (cause) {
    materialsError.value = cause.message
  } finally {
    materialSubmitting.value = false
  }
}

function toggleMaterialForm() {
  if (materialEditandoId.value !== null || showMaterialForm.value) {
    cancelMaterialEdit()
    return
  }
  showMaterialForm.value = true
}

function iniciarRemocaoMaterial(material) {
  materialParaRemoverId.value = material.id
  materialsError.value = ''
}

async function confirmarRemocaoMaterial(material) {
  materialsError.value = ''
  try {
    await request(`/material/delete/${material.id}`, {
      method: 'DELETE',
      token: props.session.token
    })
    materials.value = materials.value.filter(item => item.id !== material.id)
    materialParaRemoverId.value = null
  } catch (cause) {
    materialsError.value = cause.message
  }
}

function cancelarRemocaoMaterial() {
  materialParaRemoverId.value = null
}

watch(() => props.classroom.codigo, loadMaterials)
onMounted(loadMaterials)
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
          <div class="materials-heading">
            <div>
              <h2>Materiais da turma</h2>
              <p>Links e conteúdos compartilhados pelo professor.</p>
            </div>
            <button v-if="canManageMaterials" type="button" class="button outline" @click="toggleMaterialForm">
              {{ materialEditandoId !== null ? 'Cancelar Edição' : (showMaterialForm ? 'Cancelar' : '+ Adicionar material') }}
            </button>
          </div>

          <p v-if="materialsError" class="message error" role="alert">{{ materialsError }}</p>
          <form v-if="showMaterialForm && canManageMaterials" class="material-entry form-card" @submit.prevent="saveMaterial">
            <div class="material-fields">
              <label>Nome<input v-model.trim="materialForm.name" required placeholder="Ex.: Lista de exercícios"></label>
              <label>Tipo<select v-model="materialForm.tipo" required><option value="PDF">PDF</option><option value="IMAGEM">IMAGEM</option><option value="VIDEO">VIDEO</option></select></label>
              <label>URL<input v-model.trim="materialForm.url" required type="url" inputmode="url" placeholder="https://..."></label>
              <label class="material-description">Descrição (Opcional)<textarea v-model.trim="materialForm.descricao" maxlength="500" rows="3" placeholder="Descreva brevemente este material"></textarea><span class="character-count" :class="{ 'character-count-limit': materialForm.descricao.length === 500 }">{{ materialForm.descricao.length }}/500</span></label>
            </div>
            <button class="button dark" :disabled="materialSubmitting">{{ materialSubmitting ? 'Salvando…' : (materialEditandoId !== null ? 'Salvar Alterações' : 'Salvar material') }}</button>
          </form>

          <p v-if="materialsLoading" class="empty">Carregando materiais…</p>
          <div v-else-if="materials.length" class="material-list">
            <div v-for="material in materials" :key="material.id || `${material.tipo}-${material.url}`" class="material-item">
              <a :href="material.url" target="_blank" rel="noopener noreferrer">
                <span>{{ material.tipo }}</span><span class="material-content"><strong>{{ material.name }}</strong><small v-if="material.descricao">{{ material.descricao }}</small></span><span>↗</span>
              </a>
              <button v-if="canManageMaterials && materialParaRemoverId !== material.id" type="button" class="text-button edit-material" :aria-label="`Editar ${material.name}`" @click="editMaterial(material)">✎ Editar</button>
              <button v-if="canManageMaterials && materialParaRemoverId !== material.id" type="button" class="text-button remove-material" :aria-label="`Remover ${material.name}`" @click="iniciarRemocaoMaterial(material)">🗑 Remover</button>

              <div v-if="materialParaRemoverId === material.id" class="material-remove-confirm">
                <span>Remover "{{ material.name }}"?</span>
                <div class="material-remove-actions">
                  <button type="button" class="button outline" @click="cancelarRemocaoMaterial">Cancelar</button>
                  <button type="button" class="button dark" @click="confirmarRemocaoMaterial(material)">Confirmar</button>
                </div>
              </div>
            </div>
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