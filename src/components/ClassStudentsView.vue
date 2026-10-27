<script setup>
import { computed } from 'vue'

const props = defineProps({
  classroom: { type: Object, required: true }
})

const studentNames = computed(() => {
  const sources = [props.classroom?.nomeAlunos, props.classroom?.alunos, props.classroom?.students]
  const list = sources.find(Array.isArray) || []
  return list
    .map(item => (typeof item === 'string' ? item : item?.name || item?.nome || ''))
    .filter(Boolean)
})
</script>

<template>
  <div class="student-panel" id="students-panel" role="tabpanel" aria-labelledby="students-tab">
    <p class="section-label">ALUNOS <span>{{ studentNames.length }}</span></p>
    <ul v-if="studentNames.length" class="student-list">
      <li v-for="(name, index) in studentNames" :key="`${name}-${index}`">{{ name }}</li>
    </ul>
    <p v-else class="empty">Nenhum aluno encontrado nesta turma.</p>
  </div>
</template>
