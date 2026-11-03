<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  session: { type: Object, required: true },
  loading: Boolean,
  error: { type: String, default: '' },
  notice: { type: String, default: '' },
  profile: { type: Object, default: null }
})
const emit = defineEmits(['navigate', 'submit'])
const form = reactive({ name: '', email: '', telephone: '', especialidade: '', password: '' })
const loadedProfile = ref(false)
const isEducator = String(props.session.role).toLowerCase() === 'educator'

function setProfile(profile) {
  if (!profile || loadedProfile.value) return
  form.name = profile.name || ''
  form.email = profile.login || profile.email || ''
  form.telephone = profile.telefone || profile.telephone || ''
  form.especialidade = profile.especialidade || ''
  loadedProfile.value = true
}

watch(() => props.profile, setProfile, { immediate: true })

function submit() {
  const payload = {
    name: form.name.trim(),
    telephone: form.telephone.trim()
  }
  if (isEducator) payload.especialidade = form.especialidade.trim()
  if (form.password) payload.password = form.password
  emit('submit', payload)
}
</script>

<template>
  <section class="container workspace profile-view">
    <div class="workspace-heading">
      <div><span class="eyebrow">SUA CONTA</span><h1>Meu perfil</h1><p>Confira e atualize seus dados pessoais.</p></div>
      <button class="text-button" type="button" @click="emit('navigate', 'dashboard')">Voltar</button>
    </div>
    <p v-if="notice" class="message success" role="status">{{ notice }}</p>
    <p v-if="error" class="message error" role="alert">{{ error }}</p>
    <form class="form-card profile-form" @submit.prevent="submit">
      <label>Nome<input v-model.trim="form.name" autocomplete="name" required></label>
      <label>E-mail / Login<input :value="form.email" type="email" autocomplete="email" disabled></label>
      <label>Telefone<input v-model.trim="form.telephone" type="tel" autocomplete="tel" required></label>
      <label v-if="isEducator">Especialidade<input v-model.trim="form.especialidade" required></label>
      <label>Nova Senha<input v-model="form.password" type="password" autocomplete="new-password" minlength="6" placeholder="Deixe em branco para manter a atual"></label>
      <p class="form-hint">A senha deve ter pelo menos 6 caracteres quando preenchida.</p>
      <button class="button dark" :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar Alterações' }}</button>
    </form>
  </section>
</template>
