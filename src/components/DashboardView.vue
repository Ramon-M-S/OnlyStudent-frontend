<script setup>
const props = defineProps({ session: { type: Object, required: true }, classes: { type: Array, required: true }, loading: Boolean, error: { type: String, default: '' }, notice: { type: String, default: '' } })
const emit = defineEmits(['navigate', 'open-class'])
const isEducator = props.session.role === 'educator'
const firstName = props.session.name.split(' ')[0]
const plural = (count, single, multiple) => `${count} ${count === 1 ? single : multiple}`
</script>
<template>
  <section class="container workspace">
    <div class="workspace-heading"><div><span class="eyebrow">{{ isEducator ? 'ÁREA DO PROFESSOR' : 'ÁREA DO ALUNO' }}</span><h1>Olá, {{ firstName }}.</h1><p>{{ isEducator ? 'Gerencie as turmas que você criou.' : 'Acesse as turmas em que você está inscrito.' }}</p></div><button class="button dark" @click="emit('navigate', isEducator ? 'create' : 'catalog')">{{ isEducator ? '+ Criar turma' : 'Explorar turmas' }}</button></div>
    <p v-if="notice" class="message success" role="status">{{ notice }}</p><p v-if="error" class="message error" role="alert">{{ error }}</p>
    <p class="section-label">SUAS TURMAS <span>{{ classes.length }}</span></p>
    <p v-if="loading" class="empty">Carregando turmas…</p>
    <div v-else-if="classes.length" class="class-grid"><button v-for="item in classes" :key="item.codigo" class="class-card" @click="emit('open-class', item)"><span class="card-top"><span class="class-icon">{{ item.name.charAt(0) }}</span><span>↗</span></span><strong>{{ item.name }}</strong><span class="class-teacher">{{ item.educator }}</span><span class="class-meta">{{ plural(item.totalAlunos, 'aluno', 'alunos') }} <span>·</span> {{ plural(item.totalMateriais, 'material', 'materiais') }}</span></button></div>
    <div v-else class="empty"><h2>Nenhuma turma por aqui ainda.</h2><p>{{ isEducator ? 'Crie sua primeira turma para começar.' : 'Explore as turmas disponíveis e entre na que procura.' }}</p><button class="button dark" @click="emit('navigate', isEducator ? 'create' : 'catalog')">{{ isEducator ? 'Criar turma' : 'Explorar turmas' }}</button></div>
  </section>
</template>
