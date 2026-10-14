<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { request } from './lib/api.js'
import { routeFor, routeFromHash } from './lib/navigation.js'
import AppHeader from './components/AppHeader.vue'
import LandingView from './components/LandingView.vue'
import AuthView from './components/AuthView.vue'
import DashboardView from './components/DashboardView.vue'
import CatalogView from './components/CatalogView.vue'
import ClassFormView from './components/ClassFormView.vue'
import ClassDetailView from './components/ClassDetailView.vue'

function savedSession() {
  try { return JSON.parse(localStorage.getItem('onlystudent.session') || 'null') }
  catch { localStorage.removeItem('onlystudent.session'); return null }
}

const session = ref(savedSession())
const initialRoute = routeFromHash(window.location.hash)
const view = ref(session.value ? (initialRoute.view === 'home' ? 'dashboard' : initialRoute.view) : (['home', 'login', 'register'].includes(initialRoute.view) ? initialRoute.view : 'login'))
const classes = ref([])
const catalog = ref([])
const selected = ref(null)
const loading = ref(false)
const error = ref('')
const notice = ref('')

function logout() {
  localStorage.removeItem('onlystudent.session')
  session.value = null
  classes.value = []
  selected.value = null
  view.value = 'home'
  window.history.replaceState({}, '', routeFor('home'))
}

function handleError(cause) {
  if (cause.status === 401) {
    logout()
    view.value = 'login'
    window.history.replaceState({}, '', routeFor('login'))
  }
  error.value = cause.message
}

async function call(path, options = {}) {
  return request(path, { ...options, token: session.value?.token })
}

async function loadClasses() {
  if (!session.value) return
  loading.value = true
  error.value = ''
  try {
    const endpoint = session.value.role === 'educator' ? 'educatorTurmas' : 'studentTurmas'
    const result = await call(`/turma/${endpoint}?codigo=${session.value.id}&page=0&size=50`)
    classes.value = result.content || []
  } catch (cause) { handleError(cause) }
  finally { loading.value = false }
}

async function loadCatalog() {
  loading.value = true
  error.value = ''
  try { catalog.value = (await call('/turma/allClassroom?search=&page=0&size=50')).content || [] }
  catch (cause) { handleError(cause) }
  finally { loading.value = false }
}

function navigate(next, { replace = false } = {}) {
  error.value = ''
  notice.value = ''
  selected.value = null
  window.history[replace ? 'replaceState' : 'pushState']({}, '', routeFor(next))
  view.value = next
  if (next === 'dashboard') loadClasses()
  if (next === 'catalog') loadCatalog()
}

async function authenticate(form) {
  loading.value = true
  error.value = ''
  try {
    if (view.value === 'register') await request('/auth/register', { method: 'POST', body: form })
    session.value = await request('/auth/login', { method: 'POST', body: { email: form.email, password: form.password } })
    localStorage.setItem('onlystudent.session', JSON.stringify(session.value))
    window.history.replaceState({}, '', routeFor('dashboard'))
    view.value = 'dashboard'
    await loadClasses()
  } catch (cause) { handleError(cause) }
  finally { loading.value = false }
}

async function showClass(classroomId, recordHistory = true) {
  loading.value = true
  error.value = ''
  try {
    selected.value = await call(`/turma/${classroomId}`)
    if (recordHistory) window.history.pushState({ from: view.value }, '', routeFor('class', classroomId))
    view.value = 'class'
  }
  catch (cause) { handleError(cause) }
  finally { loading.value = false }
}

function openClass(item) { return showClass(item.codigo) }

function backToClasses() {
  if (window.history.state?.from === 'dashboard') window.history.back()
  else navigate('dashboard', { replace: true })
}

function onHistoryChange() {
  const route = routeFromHash(window.location.hash)
  if (!session.value && !['home', 'login', 'register'].includes(route.view)) {
    navigate('login', { replace: true })
    return
  }
  error.value = ''
  selected.value = null
  if (route.view === 'class') showClass(route.classroomId, false)
  else {
    view.value = route.view
    if (route.view === 'dashboard') loadClasses()
    if (route.view === 'catalog') loadCatalog()
  }
}

async function createClass(form) {
  loading.value = true
  error.value = ''
  try {
    await call('/turma/register', { method: 'POST', body: { ...form, idEducator: session.value.id, price: 0 } })
    window.history.replaceState({}, '', routeFor('dashboard'))
    view.value = 'dashboard'
    notice.value = 'Turma criada.'
    await loadClasses()
  } catch (cause) { handleError(cause) }
  finally { loading.value = false }
}

async function joinClass(item) {
  loading.value = true
  error.value = ''
  try {
    await call(`/turma/${item.codigo}/entrar`, { method: 'POST', body: { idAluno: String(session.value.id) } })
    window.history.replaceState({}, '', routeFor('dashboard'))
    view.value = 'dashboard'
    notice.value = `Você entrou em ${item.name}.`
    await loadClasses()
  } catch (cause) { handleError(cause) }
  finally { loading.value = false }
}

onMounted(() => {
  window.addEventListener('popstate', onHistoryChange)
  if (session.value) {
    if (initialRoute.view === 'home') window.history.replaceState({}, '', routeFor('dashboard'))
    if (initialRoute.view === 'class') showClass(initialRoute.classroomId, false)
    else if (view.value === 'catalog') loadCatalog()
    else if (view.value === 'dashboard') loadClasses()
  } else if (!['home', 'login', 'register'].includes(initialRoute.view)) {
    window.history.replaceState({}, '', routeFor('login'))
  }
})
onUnmounted(() => window.removeEventListener('popstate', onHistoryChange))
</script>

<template>
  <div class="app-shell">
    <AppHeader :session="session" :view="view" @navigate="navigate" @logout="logout" />
    <main>
      <LandingView v-if="view === 'home'" @navigate="navigate" />
      <AuthView v-else-if="view === 'login' || view === 'register'" :mode="view" :loading="loading" :error="error" @submit="authenticate" @navigate="navigate" />
      <DashboardView v-else-if="view === 'dashboard'" :session="session" :classes="classes" :loading="loading" :error="error" :notice="notice" @navigate="navigate" @open-class="openClass" />
      <CatalogView v-else-if="view === 'catalog'" :classes="classes" :catalog="catalog" :loading="loading" :error="error" @navigate="navigate" @join="joinClass" />
      <ClassFormView v-else-if="view === 'create'" :loading="loading" :error="error" @navigate="navigate" @submit="createClass" />
      <ClassDetailView v-else-if="view === 'class' && selected" :classroom="selected" :error="error" @navigate="backToClasses" />
    </main>
    <footer class="container footer"><span>OnlyStudent</span><span>Turmas, pessoas e materiais.</span></footer>
  </div>
</template>
