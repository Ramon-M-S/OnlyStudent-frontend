<script setup>
import FeatureCard from './FeatureCard.vue'
const emit = defineEmits(['navigate'])
const features = [
  { number: '01', icon: '▦', title: 'Tudo no seu lugar.', description: 'Aulas, turmas e materiais organizados para você encontrar o que precisa.' },
  { number: '02', icon: '↗', title: 'Entre e acompanhe.', description: 'Encontre uma turma, participe e acompanhe os conteúdos publicados.' },
  { number: '03', icon: '✳', title: 'Ensine com clareza.', description: 'Crie turmas e mantenha os materiais acessíveis aos seus alunos.' }
]
</script>

<template>
  <div class="landing-page">
    <section class="container home home-redesign" aria-labelledby="home-title">
      <div class="home-copy">
        <span class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span> Seu espaço de estudos</span>
        <h1 id="home-title">Aprender fica mais fácil quando tudo <em>se encontra.</em></h1>
        <p>Suas turmas, seus materiais e suas próximas aulas. Tudo organizado em um espaço feito para alunos e professores.</p>
        <div class="actions">
          <button type="button" class="button dark hero-primary" @click="emit('navigate', 'register')">Começar gratuitamente <span aria-hidden="true">↗</span></button>
          <button type="button" class="button outline hero-secondary" @click="emit('navigate', 'login')">Já tenho uma conta <span aria-hidden="true">→</span></button>
        </div>
        <div class="hero-footnote"><span class="hero-footnote-icon" aria-hidden="true">✓</span> Simples de usar, de qualquer dispositivo.</div>
      </div>
      <div class="hero-visual" aria-label="Prévia ilustrativa da organização de uma turma">
        <div class="visual-orbit orbit-one" aria-hidden="true"></div>
        <div class="visual-orbit orbit-two" aria-hidden="true"></div>
        <div class="floating-tag tag-top"><span class="tag-symbol">✳</span> Seu semestre, organizado.</div>
        <div class="home-example">
          <div class="example-head"><div class="example-brand"><span class="example-brand-mark">S.</span> Study Hub</div><span class="example-head-dots" aria-hidden="true">•••</span></div>
          <div class="example-body">
            <div class="example-context"><span class="example-context-icon">▦</span><span>MINHA TURMA <span aria-hidden="true">/</span> VISÃO GERAL</span></div>
            <h2>Introdução à<br>Programação<span class="example-title-dot">.</span></h2>
            <p>Uma turma, muitas possibilidades.</p>
            <div class="example-divider"></div>
            <div class="example-section-head"><span>Materiais recentes</span><span>VER TODOS ↗</span></div>
            <div class="example-material"><span class="material-symbol symbol-green">≡</span><div><strong>Primeiros passos</strong><small>Material de apoio · Aula 01</small></div><span class="material-arrow">↗</span></div>
            <div class="example-material"><span class="material-symbol symbol-peach">⌘</span><div><strong>Lógica e algoritmos</strong><small>Material de apoio · Aula 02</small></div><span class="material-arrow">↗</span></div>
            <div class="example-material"><span class="material-symbol symbol-lilac">▤</span><div><strong>Estruturas de dados</strong><small>Material de apoio · Aula 03</small></div><span class="material-arrow">↗</span></div>
          </div>
          <div class="example-bottom"><span><span class="online-dot"></span> Tudo em dia</span><span>3 materiais</span></div>
        </div>
        <div class="floating-tag tag-bottom"><span class="avatars" aria-hidden="true"><span>A</span><span>M</span><span>J</span></span><span>Feito para aprender juntos</span></div>
      </div>
    </section>
    <section class="benefits-section" aria-labelledby="benefits-title">
      <div class="container">
        <div class="benefits-heading"><div><span class="eyebrow">UM JEITO MAIS SIMPLES</span><h2 id="benefits-title">Mais tempo para o que importa.</h2></div><p>Menos tempo procurando links e arquivos. Mais tempo dedicado às aulas.</p></div>
        <div class="feature-grid"><FeatureCard v-for="feature in features" :key="feature.number" v-bind="feature" /></div>
      </div>
    </section>
    <section class="container closing-section" aria-labelledby="closing-title">
      <span class="eyebrow">PRONTO PARA COMEÇAR?</span>
      <h2 id="closing-title">Sua próxima aula começa aqui.</h2>
      <p>Crie sua conta e encontre seu espaço de estudos.</p>
      <button type="button" class="button dark" @click="emit('navigate', 'register')">Criar minha conta <span aria-hidden="true">↗</span></button>
    </section>
  </div>
</template>
