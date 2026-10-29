<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
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
const classroomData = reactive({ ...props.classroom })
const isEditingClass = ref(false)
const classForm = reactive({ name: '', description: '' })
const materials = ref([])
const materialsLoading = ref(false)
const materialsError = ref('')
const showMaterialForm = ref(false)
const materialForm = reactive({ name: '', tipo: 'PDF', url: '', descricao: '' })
const materialEditandoId = ref(null)
const materialParaRemoverId = ref(null)
const materialSubmitting = ref(false)
const showDeleteClassModal = ref(false)
const classActionSubmitting = ref(false)
const classActionError = ref('')
const showClassSettingsMenu = ref(false)
const classSettingsMenu = ref(null)

const educatorId = computed(() => {
  const classroom = props.classroom
  return classroom.idEducator ?? classroom.idEducador ?? classroom.educatorId
    ?? classroom.educator?.id ?? classroom.educador?.id
})

const isOwner = computed(() => {
  if (props.session?.role !== 'educator') return false

  const educatorIdMatches = props.classroom?.idEducator !== undefined &&
    props.classroom?.idEducator !== null &&
    String(props.classroom.idEducator) === String(props.session?.id)
  const educatorName = String(props.classroom?.educator ?? '').trim()
  const userNames = [props.session?.name, props.session?.email]
    .filter(Boolean)
    .map(value => String(value).trim())

  return educatorIdMatches || (educatorName !== '' && userNames.includes(educatorName))
})

const deletionScheduled = computed(() => classroomData.dataExclusaoAgendada != null)

const tempoRestanteExclusao = computed(() => {
  if (!classroomData.dataExclusaoAgendada) return ''

  const targetDate = new Date(classroomData.dataExclusaoAgendada).getTime()
  const diff = targetDate - Date.now()

  if (diff <= 0) return 'a qualquer momento'

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (dias > 0) {
    return `em ${dias} dia${dias > 1 ? 's' : ''}${horas > 0 ? ` e ${horas} hora${horas > 1 ? 's' : ''}` : ''}`
  }
  if (horas > 0) {
    return `em ${horas} hora${horas > 1 ? 's' : ''}${minutos > 0 ? ` e ${minutos} minuto${minutos > 1 ? 's' : ''}` : ''}`
  }
  return `em ${minutos} minuto${minutos > 1 ? 's' : ''}`
})

const canManageMaterials = computed(() => {
  if (props.session.role !== 'educator') return false
  if (deletionScheduled.value) return false
  if (educatorId.value !== undefined && educatorId.value !== null) {
    return String(educatorId.value) === String(props.session.id)
  }
  return props.canViewStudents
})

async function reloadClassroom() {
  const updatedClassroom = await request(`/turma/${props.classroom.codigo}`, {
    token: props.session.token
  })
  Object.assign(classroomData, updatedClassroom)
}

function openDeleteClassModal() {
  showClassSettingsMenu.value = false
  classActionError.value = ''
  showDeleteClassModal.value = true
}

function closeDeleteClassModal() {
  if (!classActionSubmitting.value) showDeleteClassModal.value = false
}

async function confirmDeleteClass() {
  classActionSubmitting.value = true
  classActionError.value = ''
  try {
    await request(`/turma/${props.classroom.codigo}`, {
      method: 'DELETE',
      token: props.session.token
    })
    await reloadClassroom()
    showDeleteClassModal.value = false
  } catch (cause) {
    classActionError.value = cause.message
  } finally {
    classActionSubmitting.value = false
  }
}

async function cancelScheduledDeletion() {
  classActionSubmitting.value = true
  classActionError.value = ''
  try {
    await request(`/turma/${props.classroom.codigo}/cancelar-exclusao`, {
      method: 'PATCH',
      token: props.session.token
    })
    await reloadClassroom()
  } catch (cause) {
    classActionError.value = cause.message
  } finally {
    classActionSubmitting.value = false
  }
}

function syncClassroomForm() {
  classForm.name = classroomData.name || ''
  classForm.description = classroomData.description || ''
}

function beginClassEdit() {
  showClassSettingsMenu.value = false
  syncClassroomForm()
  isEditingClass.value = true
}

function cancelClassEdit() {
  isEditingClass.value = false
  syncClassroomForm()
}

async function saveClassEdit() {
  const name = classForm.name.trim()
  const description = classForm.description.trim()

  if (!name) {
    materialsError.value = 'Informe o nome da turma.'
    return
  }

  try {
    await request(`/turma/${props.classroom.codigo}`, {
      method: 'PUT',
      token: props.session.token,
      body: {
        name,
        description,
        idEducator: props.classroom.idEducator,
        price: props.classroom.price || 0
      }
    })

    Object.assign(classroomData, { ...props.classroom, name, description })
    isEditingClass.value = false
  } catch (cause) {
    materialsError.value = cause.message
  }
}

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

watch(() => props.classroom, (value) => {
  Object.assign(classroomData, value)
  syncClassroomForm()
}, { immediate: true, deep: true })
watch(() => props.classroom.codigo, loadMaterials)
onMounted(loadMaterials)

function closeClassSettingsMenuOnOutsideClick(event) {
  if (classSettingsMenu.value && !classSettingsMenu.value.contains(event.target)) {
    showClassSettingsMenu.value = false
  }
}

function closeClassSettingsMenuOnEscape(event) {
  if (event.key === 'Escape') showClassSettingsMenu.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', closeClassSettingsMenuOnOutsideClick)
  document.addEventListener('keydown', closeClassSettingsMenuOnEscape)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', closeClassSettingsMenuOnOutsideClick)
  document.removeEventListener('keydown', closeClassSettingsMenuOnEscape)
})
</script>

<template>
  <section class="container workspace">
    <div class="workspace-heading">
      <div>
        <span class="eyebrow">TURMA</span>
        <div class="class-heading-row">
          <div
            v-if="isOwner && !deletionScheduled && !isEditingClass"
            ref="classSettingsMenu"
            class="class-settings"
          >
            <button
              type="button"
              class="class-settings-trigger"
              aria-label="Configurações da turma"
              :aria-expanded="showClassSettingsMenu"
              aria-haspopup="menu"
              @click="showClassSettingsMenu = !showClassSettingsMenu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="gear-icon" aria-hidden="true">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <ul v-if="showClassSettingsMenu" class="class-settings-menu" role="menu">
              <li role="none">
                <button type="button" role="menuitem" @click="beginClassEdit">✎ <span>Editar turma</span></button>
              </li>
              <li role="none">
                <button type="button" role="menuitem" class="class-settings-delete" @click="openDeleteClassModal">🗑️ <span>Excluir turma</span></button>
              </li>
            </ul>
          </div>
          <h1 v-if="!isEditingClass">{{ classroomData.name }}</h1>
        </div>
        <div v-if="isEditingClass" class="form-card edit-classroom-form">
          <div class="form-field">
            <label>Nome da turma</label>
            <input
              type="text"
              v-model.trim="classForm.name"
              class="form-input"
              maxlength="100"
              required
              placeholder="Ex.: Matemática I"
            />
          </div>

          <div class="form-field">
            <label>Descrição</label>
            <textarea
              v-model.trim="classForm.description"
              class="form-input"
              placeholder="O que os alunos vão estudar?"
            ></textarea>
          </div>

          <div class="edit-class-actions">
            <button type="button" class="button edit-class-save" @click="saveClassEdit">Salvar</button>
            <button type="button" class="button outline" @click="cancelClassEdit">Cancelar</button>
          </div>
        </div>
      </div>
      <button class="text-button" @click="emit('navigate', 'dashboard')">← Minhas turmas</button>
    </div>
    
    <p v-if="error" class="message error" role="alert">{{ error }}</p>
    <div v-if="deletionScheduled" class="scheduled-deletion" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon" aria-hidden="true">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>Atenção: Esta turma será excluída {{ tempoRestanteExclusao }}.</span>
      <button
        v-if="isOwner"
        type="button"
        class="button outline"
        :disabled="classActionSubmitting"
        @click="cancelScheduledDeletion"
      >{{ classActionSubmitting ? 'Cancelando…' : 'Cancelar Exclusão' }}</button>
    </div>
    <p v-if="classActionError" class="message error" role="alert">{{ classActionError }}</p>

    <div class="class-detail">
      <p v-if="!isEditingClass">{{ classroomData.description }}</p>
      
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

    <div v-if="showDeleteClassModal" class="modal-backdrop" role="presentation" @click.self="closeDeleteClassModal">
      <div class="form-card confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="delete-class-title">
        <h2 id="delete-class-title">Excluir turma?</h2>
        <p>A turma será excluída em 3 dias. Os alunos serão notificados. Deseja continuar?</p>
        <div class="edit-class-actions">
          <button type="button" class="button outline" :disabled="classActionSubmitting" @click="closeDeleteClassModal">Cancelar</button>
          <button type="button" class="button danger-button" :disabled="classActionSubmitting" @click="confirmDeleteClass">
            {{ classActionSubmitting ? 'Agendando…' : 'Excluir turma' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.danger-button {
  border: 1px solid #dc2626; /* Vermelho forte */
  background: #dc2626;
  color: #ffffff;
  font-weight: 600;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.danger-button:hover:not(:disabled) {
  background: #b91c1c; /* Vermelho mais escuro ao passar o mouse */
  border-color: #b91c1c;
}


.scheduled-deletion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 24px 0;
  padding: 16px 20px;
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  background: var(--color-error-bg);
  color: var(--color-error);
  font-weight: 700;
}

.scheduled-deletion .alert-icon {
  flex: 0 0 auto;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #0008;
}

.confirmation-modal {
  width: min(100%, 480px);
}

.confirmation-modal h2 {
  margin-top: 0;
}

.confirmation-modal p {
  line-height: 1.6;
}

@media (max-width: 600px) {
  .scheduled-deletion {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>