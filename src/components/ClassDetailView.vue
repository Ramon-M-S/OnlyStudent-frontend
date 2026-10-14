<script setup>
defineProps({ classroom: { type: Object, required: true }, error: { type: String, default: '' } })
const emit = defineEmits(['navigate'])
</script>
<template>
  <section class="container workspace">
    <div class="workspace-heading"><div><span class="eyebrow">TURMA</span><h1>{{ classroom.name }}</h1></div><button class="text-button" @click="emit('navigate', 'dashboard')">← Minhas turmas</button></div>
    <p v-if="error" class="message error" role="alert">{{ error }}</p>
    <div class="class-detail"><p>{{ classroom.description }}</p><div class="detail-info"><div><small>PROFESSOR</small><strong>{{ classroom.educator }}</strong></div><div><small>ALUNOS</small><strong>{{ classroom.nomeAlunos?.length || 0 }}</strong></div><div><small>MATERIAIS</small><strong>{{ classroom.materiais?.length || 0 }}</strong></div></div><p class="section-label">MATERIAIS</p><div v-if="classroom.materiais?.length" class="material-list"><a v-for="material in classroom.materiais" :key="material.id" :href="material.url" target="_blank" rel="noopener noreferrer"><span>{{ material.tipo }}</span><strong>{{ material.name }}</strong><span>↗</span></a></div><p v-else class="empty">O professor ainda não adicionou materiais.</p></div>
  </section>
</template>
