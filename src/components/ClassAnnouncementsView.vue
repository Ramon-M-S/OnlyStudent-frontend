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
const avisos = ref(props.classroom.avisos || [])

async function publicarAviso() {
  if (!mensagem.value.trim()) return
  enviando.value = true
  erro.value = ''
  try {
    await request(`/turma/${props.classroom.codigo}/avisos`, {
      method: 'POST',
      body: { mensagem: mensagem.value },
      token: props.session.token
    })
    avisos.value.unshift({
      id: Date.now(),
      mensagem: mensagem.value,
      dataCriacao: new Date().toISOString(),
      autorId: props.session.id
    })
    mensagem.value = ''
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
  return aviso.id ?? aviso.codigo
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

async function excluirAviso(aviso) {
  const avisoId = getAvisoId(aviso)
  if (!avisoId) {
    console.error('Aviso sem ID válido:', aviso)
    return
  }

  excluindoAvisoId.value = avisoId
  erroExclusao.value = ''
  try {
    await request(`/turma/${props.classroom.codigo}/avisos/${avisoId}`, {
      method: 'DELETE',
      token: props.session.token
    })
    avisos.value = avisos.value.filter(item => getAvisoId(item) !== avisoId)
  } catch (e) {
    erroExclusao.value = e.message || 'Não foi possível excluir o aviso.'
  } finally {
    excluindoAvisoId.value = null
  }
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
              class="delete-announcement"
              :aria-label="`Excluir aviso de ${formatarData(aviso.dataCriacao)}`"
              title="Excluir aviso"
              :disabled="excluindoAvisoId === getAvisoId(aviso)"
              @click="excluirAviso(aviso)"
            >
              🗑️
            </button>
          </div>
        </div>
        <p class="announcement-body">{{ aviso.mensagem }}</p>
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
</style>