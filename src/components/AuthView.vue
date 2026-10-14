<script setup>
import { reactive, ref } from 'vue'
const props = defineProps({ mode: { type: String, required: true }, loading: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['submit', 'navigate'])
const role = ref('student')
const form = reactive({ name: '', email: '', telephone: '', password: '', especialidade: '' })
function submit() { emit('submit', { ...form, role: role.value.toUpperCase() }) }
</script>
<template>
  <section class="auth-wrap container">
    <div class="auth-intro"><span class="eyebrow">OnlyStudent</span><h1>{{ mode === 'login' ? 'Bom ter você de volta.' : 'Vamos criar sua conta.' }}</h1><p>{{ mode === 'login' ? 'Entre para ver suas turmas.' : 'Escolha como você vai usar a plataforma.' }}</p></div>
    <form class="form-card" @submit.prevent="submit">
      <div v-if="mode === 'register'" class="role-switch" aria-label="Tipo de conta"><button type="button" :class="{ selected: role === 'student' }" @click="role = 'student'">Sou aluno</button><button type="button" :class="{ selected: role === 'educator' }" @click="role = 'educator'">Sou professor</button></div>
      <label v-if="mode === 'register'">Nome completo<input v-model.trim="form.name" autocomplete="name" required placeholder="Seu nome"></label>
      <label>E-mail<input v-model.trim="form.email" type="email" autocomplete="email" required placeholder="voce@exemplo.com"></label>
      <label v-if="mode === 'register'">Telefone<input v-model.trim="form.telephone" type="tel" autocomplete="tel" required placeholder="(00) 00000-0000"></label>
      <label v-if="mode === 'register' && role === 'educator'">Área de ensino<input v-model.trim="form.especialidade" required placeholder="Ex.: Matemática"></label>
      <label>Senha<input v-model="form.password" type="password" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" minlength="6" required placeholder="Mínimo de 6 caracteres"></label>
      <p v-if="error" class="message error" role="alert">{{ error }}</p>
      <button class="button dark full" :disabled="loading">{{ loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta' }}</button>
      <p class="form-footer">{{ mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?' }} <button type="button" @click="emit('navigate', mode === 'login' ? 'register' : 'login')">{{ mode === 'login' ? 'Cadastre-se' : 'Entrar' }}</button></p>
    </form>
  </section>
</template>
