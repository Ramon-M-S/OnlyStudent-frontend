<script setup>
defineProps({ classroom: { type: Object, required: true } })
</script>

<template>
  <section id="students-panel" class="student-panel" role="tabpanel" aria-labelledby="students-tab">
    <p class="section-label">ALUNOS MATRICULADOS <span>{{ classroom.nomeAlunos?.length || 0 }}</span></p>
    <ul v-if="classroom.nomeAlunos?.length" class="student-list">
      <li v-for="(name, index) in classroom.nomeAlunos" :key="`${name}-${index}`">{{ name }}</li>
    </ul>
    <p v-else class="empty">Nenhum aluno matriculado ainda.</p>
  </section>
</template>
