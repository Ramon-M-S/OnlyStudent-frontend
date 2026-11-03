<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  session: { type: Object, required: true },
  admins: { type: Array, default: () => [] },
  loading: Boolean,
  error: { type: String, default: '' },
  notice: { type: String, default: '' }
})
const emit = defineEmits(['navigate', 'create', 'update', 'delete'])
const modalOpen = ref(false)
const editingAdmin = ref(null)
const confirmingId = ref(null)
const formError = ref('')
const form = reactive({ name: '', email: '', telephone: '', password: '' })
const saving = ref(false)

function openCreate() {
  editingAdmin.value = null
  Object.assign(form, { name: '', email: '', telephone: '', password: '' })
  formError.value = ''
  modalOpen.value = true
}

function openEdit(admin) {
  editingAdmin.value = admin
  Object.assign(form, { name: admin.name || '', email: admin.email || admin.login || '', telephone: admin.telephone || admin.telefone || '', password: '' })
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  if (!saving.value) modalOpen.value = false
}

function submit() {
  formError.value = ''
  if (!form.name.trim() || !form.email.trim() || !form.telephone.trim() || (!editingAdmin.value && !form.password)) {
    formError.value = 'Preencha todos os campos obrigatórios.'
    return
  }
  const payload = { name: form.name.trim(), email: form.email.trim(), telephone: form.telephone.trim() }
  if (form.password) payload.password = form.password
  saving.value = true
  emit(editingAdmin.value ? 'update' : 'create', { id: editingAdmin.value?.id ?? editingAdmin.value?.codigo, payload, done: finishSave })
}

function finishSave(success, message = '') {
  saving.value = false
  if (success) modalOpen.value = false
  else formError.value = message || 'Não foi possível salvar o administrador.'
}

function removeAdmin(admin) {
  const id = admin.id ?? admin.codigo
  if (confirmingId.value !== String(id)) {
    confirmingId.value = String(id)
    return
  }
  emit('delete', { id, done: () => { confirmingId.value = null } })
}

function cancelDelete() {
  confirmingId.value = null
}

watch(() => props.error, value => {
  if (value && modalOpen.value) formError.value = value
})
</script>

<template>
  <section class="container workspace admin-management">
    <div class="workspace-heading">
      <div><span class="eyebrow">ADMINISTRAÇÃO</span><h1>Gerenciar Admins</h1><p>Cadastre e mantenha os administradores da plataforma.</p></div>
      <button class="button dark" type="button" @click="openCreate">Novo Administrador</button>
    </div>
    <p v-if="notice" class="message success" role="status">{{ notice }}</p>
    <p v-if="error && !modalOpen" class="message error" role="alert">{{ error }}</p>
    <p v-if="loading" class="empty">Carregando administradores...</p>
    <div v-else-if="admins.length" class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th class="admin-actions-heading">Ações</th></tr></thead>
        <tbody>
          <tr v-for="admin in admins" :key="admin.id ?? admin.codigo">
            <td data-label="Nome">{{ admin.name }}</td>
            <td data-label="E-mail">{{ admin.email || admin.login }}</td>
            <td data-label="Telefone">{{ admin.telephone || admin.telefone }}</td>
            <td class="admin-actions" data-label="Ações">
              <template v-if="confirmingId === String(admin.id ?? admin.codigo)">
                <button class="text-button" type="button" @click="removeAdmin(admin)">Confirmar</button>
                <button class="text-button" type="button" @click="cancelDelete">Cancelar</button>
              </template>
              <template v-else>
                <button class="text-button" type="button" @click="openEdit(admin)">Editar</button>
                <button class="text-button danger" type="button" @click="removeAdmin(admin)">Excluir</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty"><h2>Nenhum administrador cadastrado.</h2><p>Crie o primeiro administrador para começar.</p></div>

    <div v-if="modalOpen" class="modal-backdrop" role="presentation" @click.self="closeModal">
      <form class="form-card admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title" @submit.prevent="submit">
        <div class="admin-modal-heading"><div><span class="eyebrow">{{ editingAdmin ? 'EDITAR ACESSO' : 'NOVO ACESSO' }}</span><h2 id="admin-modal-title">{{ editingAdmin ? 'Editar administrador' : 'Novo administrador' }}</h2></div><button class="modal-close" type="button" aria-label="Fechar" @click="closeModal">×</button></div>
        <label>Nome<input v-model.trim="form.name" autocomplete="name" required></label>
        <label>E-mail<input v-model.trim="form.email" type="email" autocomplete="email" required></label>
        <label>Telefone<input v-model.trim="form.telephone" type="tel" autocomplete="tel" required></label>
        <label>Senha<input v-model="form.password" type="password" :required="!editingAdmin" autocomplete="new-password" :placeholder="editingAdmin ? 'Deixe em branco para manter a atual' : 'Senha do administrador'"></label>
        <p v-if="formError" class="message error" role="alert">{{ formError }}</p>
        <div class="admin-modal-actions"><button class="button outline" type="button" :disabled="saving" @click="closeModal">Cancelar</button><button class="button dark" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar' }}</button></div>
      </form>
    </div>
  </section>
</template>
