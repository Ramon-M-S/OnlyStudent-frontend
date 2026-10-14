<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ classes: { type: Array, required: true }, catalog: { type: Array, required: true }, loading: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['navigate', 'join'])
const search = ref('')
const filtered = computed(() => props.catalog.filter(item => item.name.toLowerCase().includes(search.value.toLowerCase())))
</script>
<template>
  <section class="container workspace">
    <div class="workspace-heading"><div><span class="eyebrow">ÁREA DO ALUNO</span><h1>Encontre uma turma</h1><p>Procure pelo nome e entre em uma turma.</p></div><button class="text-button" @click="emit('navigate', 'dashboard')">← Minhas turmas</button></div>
    <p v-if="error" class="message error" role="alert">{{ error }}</p>
    <label class="search-label">Buscar turma<input v-model="search" type="search" placeholder="Digite o nome da turma"></label><p class="section-label">TURMAS DISPONÍVEIS <span>{{ filtered.length }}</span></p>
    <p v-if="loading" class="empty">Carregando turmas…</p>
    <div v-else class="catalog-list"><div v-for="item in filtered" :key="item.codigo" class="catalog-row"><span class="class-icon">{{ item.name.charAt(0) }}</span><div><strong>{{ item.name }}</strong><small>Professor: {{ item.educator }} · {{ item.totalAlunos }} {{ item.totalAlunos === 1 ? 'aluno' : 'alunos' }}</small></div><button class="button outline" :disabled="loading || classes.some(own => own.codigo === item.codigo)" @click="emit('join', item)">{{ classes.some(own => own.codigo === item.codigo) ? 'Inscrito' : 'Entrar na turma' }}</button></div><p v-if="!filtered.length" class="empty">Nenhuma turma encontrada.</p></div>
  </section>
</template>
