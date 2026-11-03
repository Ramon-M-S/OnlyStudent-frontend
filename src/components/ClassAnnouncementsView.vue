<script setup>
import { ref } from 'vue'
import { request } from '../lib/api'

const props = defineProps({
  classroom: { type: Object, required: true },
  session: { type: Object, required: true },
  canViewStudents: { type: Boolean, default: false }
})

const mensagem = ref('')
const enviando = ref(false)
const erro = ref('')
const erroExclusao = ref('')
const excluindoAvisoId = ref(null)
const confirmandoExclusaoAvisoId = ref(null)
const editandoAvisoId = ref(null)
const mensagemEdicao = ref('')
const salvandoAvisoId = ref(null)
const erroEdicao = ref('')
const avisos = ref([...(props.classroom.avisos || [])])

async function loadAvisos() {
  const avisosAtualizados = await request(`/turma/${props.classroom.codigo}/avisos`, {
    token: props.session.token
  })
  avisos.value = Array.isArray(avisosAtualizados)
    ? avisosAtualizados
    : (avisosAtualizados?.avisos || [])
}

async function publicarAviso() {
  if (!mensagem.value.trim()) return
  enviando.value = true
  erro.value = ''
  try {
    const novoAviso = await request(`/turma/${props.classroom.codigo}/avisos`, {
      method: 'POST',
      body: { mensagem: mensagem.value },
      token: props.session.token
    })
    avisos.value.unshift(novoAviso)
    mensagem.value = ''
    await loadAvisos()
  } catch (e) {
    erro.value = 'Não foi possível publicar o aviso.'
  } finally {
    enviando.value = false
  }
}

function getAutorId(aviso) {
  return aviso.autorId
    ?? aviso.authorId
    ?? aviso.idAutor
    ?? aviso.autor?.id
    ?? aviso.author?.id
}

function getAvisoId(aviso) {
  return aviso.id ?? aviso.codigo ?? aviso.idAviso ?? aviso.avisoId
}

function podeExcluirAviso(aviso) {
  const idEducator = props.classroom.idEducator
    ?? props.classroom.idEducador
    ?? props.classroom.educatorId
  const usuarioEhAutor = getAutorId(aviso) != null &&
    String(getAutorId(aviso)) === String(props.session.id)
  const usuarioEhDono = idEducator != null &&
    String(idEducator) === String(props.session.id)

  return usuarioEhAutor || usuarioEhDono
}

function editarAviso(aviso) {
  editandoAvisoId.value = String(getAvisoId(aviso))
  mensagemEdicao.value = aviso.mensagem
  erroEdicao.value = ''
}

function cancelarEdicao() {
  editandoAvisoId.value = null
  mensagemEdicao.value = ''
  erroEdicao.value = ''
}

async function salvarEdicao(aviso) {
  const avisoId = getAvisoId(aviso)
  if (avisoId === undefined || avisoId === null || avisoId === '') {
    console.error('Aviso sem ID válido:', aviso)
    return
  }
  if (!mensagemEdicao.value.trim()) return

  const avisoIdNormalizado = String(avisoId)
  salvandoAvisoId.value = avisoIdNormalizado
  erroEdicao.value = ''
  try {
    await request(`/turma/${props.classroom.codigo}/avisos/${avisoId}`, {
      method: 'PUT',
      body: { mensagem: mensagemEdicao.value },
      token: props.session.token
    })
    cancelarEdicao()
    await loadAvisos()
  } catch (e) {
    erroEdicao.value = e.message || 'Não foi possível editar o aviso.'
  } finally {
    salvandoAvisoId.value = null
  }
}

async function excluirAviso(aviso) {
  const avisoId = getAvisoId(aviso)
  if (avisoId === undefined || avisoId === null || avisoId === '') {
    console.error('Aviso sem ID válido:', aviso)
    return
  }

  const avisoIdNormalizado = String(avisoId)
  if (confirmandoExclusaoAvisoId.value !== avisoIdNormalizado) {
    confirmandoExclusaoAvisoId.value = avisoIdNormalizado
    return
  }

  excluindoAvisoId.value = avisoIdNormalizado
  erroExclusao.value = ''
  try {
    await request(`/turma/${props.classroom.codigo}/avisos/${avisoId}`, {
      method: 'DELETE',
      token: props.session.token
    })
    confirmandoExclusaoAvisoId.value = null
    await loadAvisos()
  } catch (e) {
    erroExclusao.value = e.message || 'Não foi possível excluir o aviso.'
  } finally {
    excluindoAvisoId.value = null
  }
}

function cancelarExclusao() {
  confirmandoExclusaoAvisoId.value = null
}

function formatarData(dataString) {
  if (!dataString) return ''
  const data = new Date(dataString)
  return new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  }).format(data)
}
</script>

<template>
  <div class="announcements-panel">
    <!-- Área de criação -->
    <div v-if="canViewStudents" class="create-announcement">
      <h3>Publicar novo aviso</h3>
      <textarea 
        v-model="mensagem" 
        placeholder="Escreva um aviso para a turma..."
        rows="3"
      ></textarea>
      <div class="actions">
        <span v-if="erro" class="message error">{{ erro }}</span>
        <button class="button dark" @click="publicarAviso" :disabled="enviando || !mensagem.trim()">
          {{ enviando ? 'Publicando...' : 'Publicar Aviso' }}
        </button>
      </div>
    </div>

    <!-- Lista de avisos -->
    <div class="announcements-list" style="margin-top: 20px; display: flex; flex-direction: column; gap: 15px;">
      <p v-if="erroExclusao" class="message error">{{ erroExclusao }}</p>
      <p v-if="erroEdicao" class="message error">{{ erroEdicao }}</p>
      <div v-if="avisos.length === 0" class="empty">
        <h2>Nenhum aviso ainda</h2>
        <p>O professor não publicou nenhum aviso.</p>
      </div>
      
      <div v-for="aviso in avisos" :key="getAvisoId(aviso)" class="announcement-card">
        <div class="announcement-header">
          <strong>{{ classroom.educator }}</strong>
          <div class="announcement-header-actions">
            <span class="date">{{ formatarData(aviso.dataCriacao) }}</span>
            <button
              v-if="podeExcluirAviso(aviso)"
              type="button"
              class="edit-announcement"
              :aria-label="`Editar aviso de ${formatarData(aviso.dataCriacao)}`"
              title="Editar aviso"
              :disabled="salvandoAvisoId === String(getAvisoId(aviso))"
              @click="editarAviso(aviso)"
            >
              ✎
            </button>
            <button
              v-if="podeExcluirAviso(aviso) && confirmandoExclusaoAvisoId !== String(getAvisoId(aviso))"
              type="button"
              class="delete-announcement"
              :aria-label="`Excluir aviso de ${formatarData(aviso.dataCriacao)}`"
              title="Excluir aviso"
              :disabled="excluindoAvisoId === String(getAvisoId(aviso))"
              @click="excluirAviso(aviso)"
            >
              🗑️
            </button>
            <template v-if="confirmandoExclusaoAvisoId === String(getAvisoId(aviso))">
              <button
                type="button"
                class="confirm-delete-announcement"
                :disabled="excluindoAvisoId === String(getAvisoId(aviso))"
                @click="excluirAviso(aviso)"
              >
                {{ excluindoAvisoId === String(getAvisoId(aviso)) ? 'Excluindo...' : 'Confirmar' }}
              </button>
              <button
                type="button"
                class="cancel-delete-announcement"
                :disabled="excluindoAvisoId === String(getAvisoId(aviso))"
                @click="cancelarExclusao"
              >
                Cancelar
              </button>
            </template>
          </div>
        </div>
        <template v-if="editandoAvisoId === String(getAvisoId(aviso))">
          <textarea
            v-model="mensagemEdicao"
            class="announcement-edit"
            rows="3"
            aria-label="Mensagem do aviso"
          ></textarea>
          <div class="announcement-edit-actions">
            <button
              type="button"
              class="button dark"
              :disabled="salvandoAvisoId === String(getAvisoId(aviso)) || !mensagemEdicao.trim()"
              @click="salvarEdicao(aviso)"
            >
              {{ salvandoAvisoId === String(getAvisoId(aviso)) ? 'Salvando...' : 'Salvar' }}
            </button>
            <button
              type="button"
              class="cancel-edit-announcement"
              :disabled="salvandoAvisoId === String(getAvisoId(aviso))"
              @click="cancelarEdicao"
            >
              Cancelar
            </button>
          </div>
        </template>
        <p v-else class="announcement-body">{{ aviso.mensagem }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* TUDO AQUI USA AS VARIÁVEIS DO TEMA (DARK OU LIGHT) */
.announcements-panel {
  display: flex;
  flex-direction: column;
}

.create-announcement { 
  background: var(--color-surface); /* Pega o verde escuro do tema */
  border: 1px solid var(--color-border);
  padding: 1.5rem; 
  border-radius: var(--radius-md); 
}

.create-announcement h3 {
  color: var(--color-text);
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.create-announcement textarea { 
  width: 100%; 
  padding: 12px 13px; 
  background: var(--color-page); /* Fundo mais escuro para destacar */
  color: var(--color-text);
  border: 1px solid var(--color-border); 
  border-radius: 6px; 
  margin-bottom: 1rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  resize: vertical;
}

.create-announcement textarea::placeholder {
  color: var(--color-muted);
}

.create-announcement textarea:focus {
  outline: none;
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.actions { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

/* Estilo do card de aviso publicado */
.announcement-card { 
  background: var(--color-surface);
  border: 1px solid var(--color-border); 
  padding: 1.5rem; 
  border-radius: var(--radius-md); 
}

.announcement-header { 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 0.8rem; 
  color: var(--color-accent-text); /* Verde destaque */
  font-size: 0.95rem;
  align-items: center;
}

.announcement-header-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.date { 
  font-size: 0.85rem; 
  color: var(--color-muted); 
}

.delete-announcement {
  padding: 0.15rem 0.3rem;
  border: 0;
  background: transparent;
  color: #c94b4b;
  cursor: pointer;
  font-size: 0.95rem;
  line-height: 1;
  opacity: 0.8;
}

.edit-announcement,
.confirm-delete-announcement,
.cancel-delete-announcement,
.cancel-edit-announcement {
  padding: 0.15rem 0.3rem;
  border: 0;
  background: transparent;
  color: var(--color-accent-text);
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
}

.confirm-delete-announcement {
  color: #c94b4b;
}

.edit-announcement:hover:not(:disabled),
.edit-announcement:focus-visible,
.confirm-delete-announcement:hover:not(:disabled),
.confirm-delete-announcement:focus-visible,
.cancel-delete-announcement:hover:not(:disabled),
.cancel-delete-announcement:focus-visible,
.cancel-edit-announcement:hover:not(:disabled),
.cancel-edit-announcement:focus-visible {
  text-decoration: underline;
}

.edit-announcement:focus-visible,
.confirm-delete-announcement:focus-visible,
.cancel-delete-announcement:focus-visible,
.cancel-edit-announcement:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.delete-announcement:hover:not(:disabled),
.delete-announcement:focus-visible {
  opacity: 1;
}

.delete-announcement:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.delete-announcement:disabled {
  cursor: wait;
  opacity: 0.45;
}

.announcement-body { 
  margin: 0; 
  white-space: pre-wrap; 
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.6;
}

.announcement-edit {
  width: 100%;
  padding: 12px 13px;
  background: var(--color-page);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 1rem;
  resize: vertical;
}

.announcement-edit:focus {
  outline: none;
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.announcement-edit-actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  margin-top: 0.8rem;
}

.edit-announcement:disabled,
.confirm-delete-announcement:disabled,
.cancel-delete-announcement:disabled,
.cancel-edit-announcement:disabled {
  cursor: wait;
  opacity: 0.45;
}
</style>