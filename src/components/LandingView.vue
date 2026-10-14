<script setup>
const emit = defineEmits(['navigate'])
</script>
<template>
  <section class="container home">
    <div class="home-copy">
      <span class="eyebrow">Turmas e materiais no mesmo lugar</span>
      <h1>Um espaço simples para acompanhar suas aulas.</h1>
      <p>Professores criam turmas e compartilham materiais. Alunos encontram as turmas e acompanham o conteúdo.</p>
      <div class="actions"><button class="button dark" @click="emit('navigate', 'register')">Criar conta <span>↗</span></button><button class="button outline" @click="emit('navigate', 'login')">Já tenho conta</button></div>
    </div>
    <div class="home-example" aria-label="Exemplo de organização das turmas">
      <div class="example-head"><span>OnlyStudent</span><span>Exemplo de turma</span></div>
      <div class="example-body"><small>TURMA</small><h2>Introdução à Programação</h2><p>Materiais, professor e colegas em um só lugar.</p><div class="example-row"><span>01</span><div><strong>Primeiros passos</strong><small>Material da turma</small></div><span>↗</span></div><div class="example-row"><span>02</span><div><strong>Lógica e algoritmos</strong><small>Material da turma</small></div><span>↗</span></div></div>
    </div>
  </section>
</template>
