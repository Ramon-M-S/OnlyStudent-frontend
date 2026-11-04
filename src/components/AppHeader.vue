<script setup>
import { ref } from 'vue'
import AccessibilityMenu from './AccessibilityMenu.vue'
defineProps({ session: { type: Object, default: null }, view: { type: String, required: true } })
const emit = defineEmits(['navigate', 'logout'])
const menuOpen = ref(false)
function go(view) { menuOpen.value = false; emit('navigate', view) }
function logout() { menuOpen.value = false; emit('logout') }
</script>
<template>
  <header class="topbar">
    <div class="container topbar-inner">
      <button class="brand" @click="go(session ? 'dashboard' : 'home')" aria-label="Study Hub, início"><span class="brand-mark">S.</span><span>Study Hub</span></button>
      <nav :class="{ open: menuOpen }" aria-label="Navegação principal">
        <template v-if="session">
          <button class="nav-link" :class="{ active: view === 'dashboard' }" @click="go('dashboard')">Minhas turmas</button>
          <button v-if="session.role === 'student'" class="nav-link" :class="{ active: view === 'catalog' }" @click="go('catalog')">Explorar turmas</button>
          <button v-if="session.role === 'educator'" class="nav-link nav-create-btn" @click="go('create')">Criar turma</button>
          <button v-if="String(session.role).toUpperCase() === 'ADMIN'" class="nav-link" :class="{ active: view === 'admin' }" @click="go('admin')">Gerenciar Admins</button>
          <button class="nav-link nav-user" :class="{ active: view === 'profile' }" @click="go('profile')">{{ session.name.split(' ')[0] }}</button>
          <button class="nav-link" @click="logout">Sair</button>
        </template>
        <template v-else>
          <button class="nav-link" @click="go('login')">Entrar</button>
          <button class="nav-link nav-primary" @click="go('register')">Criar conta</button>
        </template>
      </nav>
      <div class="header-controls">
        <AccessibilityMenu />
        <button class="menu-button" aria-label="Abrir menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">☰</button>
      </div>
    </div>
  </header>
</template>
