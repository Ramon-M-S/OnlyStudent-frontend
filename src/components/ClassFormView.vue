<script setup>
import { reactive } from 'vue'
defineProps({ loading: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['navigate', 'submit'])
const form = reactive({ name: '', description: '' })
</script>
<template>
  <section class="container workspace">
    <div class="workspace-heading"><div><span class="eyebrow">ÁREA DO PROFESSOR</span><h1>Nova turma</h1></div><button class="text-button" @click="emit('navigate', 'dashboard')">← Minhas turmas</button></div>
    <p v-if="error" class="message error" role="alert">{{ error }}</p>
    <form class="form-card create-form" @submit.prevent="emit('submit', { ...form })"><label>Nome da turma<input v-model.trim="form.name" maxlength="100" required placeholder="Ex.: Matemática I"></label><label>Descrição<textarea v-model.trim="form.description" rows="5" required placeholder="O que os alunos vão estudar?"></textarea></label><p class="form-hint">A turma será gratuita. Você poderá compartilhar o nome com os alunos.</p><button class="button dark" :disabled="loading">{{ loading ? 'Criando…' : 'Criar turma' }}</button></form>
  </section>
</template>
