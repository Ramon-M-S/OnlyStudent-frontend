<script setup>
defineProps({
  number: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }
})
</script>

<template>
  <article class="feature-card">
    <div class="feature-card-top"><span class="feature-icon" aria-hidden="true">{{ icon }}</span><span class="feature-number">{{ number }}</span></div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </article>
</template>
