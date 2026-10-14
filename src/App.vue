<script setup>
import { ref, computed } from 'vue'
const mobileOpen = ref(false)
const theme = ref('dark')
const toggleTheme = () => { theme.value = theme.value === 'dark' ? 'light' : 'dark' }
const isLight = computed(() => theme.value === 'light')
const features = [
  { number: '01', icon: '▤', title: 'Tudo em um lugar', text: 'Turmas, materiais e atividades organizados de forma clara, sem distrações.' },
  { number: '02', icon: '↗', title: 'Aprenda no seu ritmo', text: 'Uma experiência que coloca o estudo e o seu progresso em primeiro lugar.' },
  { number: '03', icon: '◇', title: 'Feito para educadores', text: 'Organize suas turmas e compartilhe o conhecimento com simplicidade.' }
]
</script>
<template>
 <div class="app-shell" :data-theme="theme">
  <header class="header">
   <div class="container nav">
    <a href="#inicio" class="brand" aria-label="OnlyStudent início"><span class="brand-logo">O<span>·</span></span><span>OnlyStudent</span></a>
    <button class="mobile-menu" type="button" :aria-expanded="mobileOpen" aria-label="Alternar menu" @click="mobileOpen=!mobileOpen">☰</button>
    <nav class="navigation" :class="{ open: mobileOpen }" aria-label="Navegação principal">
     <a href="#recursos" @click="mobileOpen=false">Recursos</a><a href="#educadores" @click="mobileOpen=false">Educadores</a><a href="#sobre" @click="mobileOpen=false">Sobre</a>
     <a class="signin" href="#comecar" @click="mobileOpen=false">Entrar</a>
     <a class="nav-cta" href="#comecar" @click="mobileOpen=false">Criar conta <span aria-hidden="true">↗</span></a>
     <button type="button" class="theme-btn" :aria-label="isLight ? 'Ativar tema escuro' : 'Ativar tema claro'" @click="toggleTheme">{{ isLight ? '☾' : '☼' }}</button>
    </nav>
   </div>
  </header>
  <main id="inicio">
   <section class="hero container">
    <div class="hero-copy">
     <div class="eyebrow"><span class="status-dot"></span> Seu próximo capítulo começa aqui <span aria-hidden="true">↗</span></div>
     <h1>Seu espaço para <span class="muted">aprender sem limites.</span></h1>
     <p class="lead">Uma plataforma feita para conectar quem ensina e quem aprende. Organize turmas, explore conteúdos e transforme sua rotina de estudos.</p>
     <div class="actions"><a class="button button-primary" href="#comecar">Começar gratuitamente <span aria-hidden="true">↗</span></a><a class="button button-secondary" href="#recursos">Conhecer recursos <span aria-hidden="true">→</span></a></div>
     <div class="small-note"><span class="check">✓</span> Simples para começar <span class="small-sep"></span> <span class="check">✓</span> Feito para alunos e professores</div>
    </div>
    <div class="preview-outer" aria-label="Exemplo ilustrativo do painel de estudos">
     <div class="preview-browser"><span></span><span></span><span></span><div class="preview-address">onlystudent / workspace</div></div>
     <div class="preview-layout">
      <aside class="preview-side"><div class="preview-mini-brand">◈ <b>workspace</b></div><div class="preview-nav active">▦ <span>Visão geral</span></div><div class="preview-nav">▤ <span>Minhas turmas</span></div><div class="preview-nav">◷ <span>Atividades</span></div><div class="preview-nav">☰ <span>Materiais</span></div><div class="preview-side-bottom">◉ <span>Minha conta</span></div></aside>
      <div class="preview-main"><div class="preview-top"><div>Workspace <span>/ Visão geral</span></div><div class="avatar">OS</div></div><div class="preview-content"><div class="greeting-label">QUARTA-FEIRA · SEU PAINEL</div><h2>Bom dia! <span>✳</span></h2><p>Acompanhe sua jornada de aprendizado.</p><div class="stat-grid"><div class="stat"><span>Turmas ativas</span><strong>04</strong><small>↗ Seus espaços</small></div><div class="stat"><span>Materiais</span><strong>18</strong><small>↗ Disponíveis</small></div><div class="stat"><span>Atividades</span><strong>07</strong><small>↗ Em andamento</small></div></div><div class="panel-grid"><div class="panel"><div class="panel-header">Seu progresso <span>•••</span></div><div class="panel-line">Design de Interfaces <span>78%</span></div><div class="track"><i style="width:78%"></i></div><div class="panel-line">Desenvolvimento Web <span>54%</span></div><div class="track"><i style="width:54%"></i></div><div class="panel-line">Fundamentos de UX <span>92%</span></div><div class="track"><i style="width:92%"></i></div></div><div class="panel"><div class="panel-header">Próximas atividades <span>↗</span></div><div class="activity"><em>14</em><div><b>Revisão de conteúdo</b><small>Design de Interfaces</small></div></div><div class="activity"><em>18</em><div><b>Projeto prático</b><small>Desenvolvimento Web</small></div></div></div></div></div></div>
     </div>
    </div>
   </section>
   <section id="recursos" class="feature-section container"><div class="section-top"><div><span class="overline">01 / A PLATAFORMA</span><h2>Menos complicação.<br/><span class="muted">Mais aprendizado.</span></h2></div><p>Ferramentas essenciais para uma jornada de estudos mais conectada, intuitiva e produtiva.</p></div><div class="feature-grid"><article v-for="f in features" :key="f.number" class="feature-card"><div class="feature-top"><span>{{ f.number }} / 03</span><span class="feature-icon">{{ f.icon }}</span></div><div><h3>{{ f.title }}</h3><p>{{ f.text }}</p></div></article></div></section>
   <section id="educadores" class="wide-band"><div class="container band-inside"><div><span class="overline">02 / PARA EDUCADORES</span><h2>Ensinar também pode ser <span class="muted">simples.</span></h2><p>Mais tempo para ensinar. Menos tempo organizando ferramentas.</p></div><a class="button button-secondary" href="#comecar">Explorar a plataforma →</a></div></section>
   <section id="sobre" class="container about"><span class="overline">03 / NOSSO PROPÓSITO</span><h2>Conhecimento cresce <span class="muted">quando é compartilhado.</span></h2><p>OnlyStudent aproxima estudantes e educadores em uma experiência digital dedicada ao que importa: aprender.</p></section>
   <section id="comecar" class="cta-wrap container"><div class="cta-box"><span class="overline">PRONTO PARA COMEÇAR?</span><h2>O próximo passo é seu.</h2><p>Entre para uma experiência de estudos mais organizada.</p><div class="actions"><a class="button button-primary" href="https://github.com/yusei21/OnlyStudent-frontend">Acompanhar o projeto ↗</a></div><small>Autenticação será conectada ao backend na próxima integração.</small></div></section>
  </main>
  <footer class="footer container"><div class="brand"><span class="brand-logo">O<span>·</span></span> OnlyStudent</div><small>© 2026 OnlyStudent. Feito para aprender.</small><a href="#inicio">Voltar ao topo ↑</a></footer>
 </div>
</template>
