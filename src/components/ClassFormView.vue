<script setup>
import { reactive } from 'vue'
defineProps({ loading: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['navigate', 'submit'])
const form = reactive({ name: '', description: '' })
const materiais = reactive([])
const materialError = reactive({ message: '' })

function addMaterial() {
  materiais.push({ name: '', tipo: 'PDF', url: '' })
}

function removeMaterial(index) {
  materiais.splice(index, 1)
}

function submit() {
  const invalidMaterial = materiais.find(material => !material.name.trim() || !material.tipo || !/^https?:\/\//i.test(material.url.trim()))
  if (invalidMaterial) {
    materialError.message = 'Revise os materiais: preencha nome, tipo e use URLs iniciadas por http:// ou https://.'
    return
  }
  materialError.message = ''
  emit('submit', { ...form, materiais: materiais.map(material => ({ ...material })) })
}
</script>
<template>
  <section class="container workspace">
    <div class="workspace-heading"><div><span class="eyebrow">ÁREA DO PROFESSOR</span><h1>Nova turma</h1></div><button class="text-button" @click="emit('navigate', 'dashboard')">← Minhas turmas</button></div>
    <p v-if="error" class="message error" role="alert">{{ error }}</p>
    <form class="form-card create-form" @submit.prevent="submit">
      <label>Nome da turma<input v-model.trim="form.name" maxlength="100" required placeholder="Ex.: Matemática I"></label>
      <label>Descrição<textarea v-model.trim="form.description" rows="5" required placeholder="O que os alunos vão estudar?"></textarea></label>
      <section class="materials-form" aria-labelledby="materials-heading">
        <div class="materials-heading">
          <div><h2 id="materials-heading">Materiais da turma <span>(Opcional)</span></h2><p>Adicione links para os materiais que os alunos usarão.</p></div>
          <button type="button" class="button outline" @click="addMaterial">+ Adicionar material</button>
        </div>
        <p v-if="materialError.message" class="message error" role="alert">{{ materialError.message }}</p>
        <div v-for="(material, index) in materiais" :key="`${material.url}-${index}`" class="material-entry">
          <div class="material-entry-heading"><strong>Material {{ index + 1 }}</strong><button type="button" class="text-button remove-material" @click="removeMaterial(index)">Remover</button></div>
          <div class="material-fields">
            <label>Nome<input v-model.trim="material.name" placeholder="Ex.: Lista de exercícios"></label>
            <label>Tipo<select v-model="material.tipo"><option value="PDF">PDF</option><option value="IMAGEM">IMAGEM</option><option value="VIDEO">VIDEO</option></select></label>
            <label>URL<input v-model.trim="material.url" type="text" inputmode="url" placeholder="https://..."></label>
          </div>
        </div>
      </section>
      <p class="form-hint">A turma será gratuita. Você poderá compartilhar o nome com os alunos.</p>
      <button class="button dark" :disabled="loading">{{ loading ? 'Criando…' : 'Criar turma' }}</button>
    </form>
  </section>
</template>
