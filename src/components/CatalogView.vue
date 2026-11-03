<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ classes: { type: Array, required: true }, catalog: { type: Array, required: true }, loading: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['navigate', 'join'])
const search = ref('')
const filtered = computed(() => props.catalog.filter(item => item.name.toLowerCase().includes(search.value.toLowerCase())))
const statusLabel = status => ({ BLOQUEADA: 'Bloqueada', DESATIVADA: 'Desativada' })[String(status || '').toUpperCase()]
const isActive = item => String(item.status || 'ATIVA').toUpperCase() === 'ATIVA'
</script>
<template>
  <section class="container workspace">
    <div class="workspace-heading"><div><span class="eyebrow">ÁREA DO ALUNO</span><h1>Encontre uma turma</h1><p>Procure pelo nome e entre em uma turma.</p></div><button class="text-button" @click="emit('navigate', 'dashboard')">← Minhas turmas</button></div>
    <p v-if="error" class="message error" role="alert">{{ error }}</p>
    <label class="search-label">Buscar turma<input v-model="search" type="search" placeholder="Digite o nome da turma"></label><p class="section-label">TURMAS DISPONÍVEIS <span>{{ filtered.length }}</span></p>
    <p v-if="loading" class="empty">Carregando turmas…</p>
    <div v-else class="catalog-list"><div v-for="item in filtered" :key="item.codigo" class="catalog-row"><span class="class-icon"><img v-if="item.profileImageUrl" :src="item.profileImageUrl" :alt="`Foto de perfil da turma ${item.name}`"><span v-else>{{ item.name.charAt(0).toUpperCase() }}</span></span><div><strong>{{ item.name }} <span v-if="statusLabel(item.status)" class="catalog-status" :class="`catalog-status-${String(item.status).toLowerCase()}`">{{ statusLabel(item.status) }}</span></strong><small>Professor: {{ item.educator }} · {{ item.totalAlunos }} {{ item.totalAlunos === 1 ? 'aluno' : 'alunos' }}</small></div><button class="button outline" :disabled="loading || !isActive(item) || classes.some(own => own.codigo === item.codigo)" @click="emit('join', item)">{{ classes.some(own => own.codigo === item.codigo) ? 'Inscrito' : (isActive(item) ? 'Entrar na turma' : 'Indisponível') }}</button></div><p v-if="!filtered.length" class="empty">Nenhuma turma encontrada.</p></div>
  </section>
</template>

<style scoped>
.catalog-row strong { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.catalog-status { display: inline-block; padding: 3px 7px; border-radius: 5px; font-size: .65rem; font-weight: 700; }
.catalog-status-bloqueada { background: #fff3c4; color: #806000; }
.catalog-status-desativada { background: var(--color-error-bg); color: var(--color-error); }
</style>
