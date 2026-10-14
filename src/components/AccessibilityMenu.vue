<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { applyPreferences, readPreferences, savePreferences } from '../lib/preferences.js'

const open = ref(false)
const root = ref(null)
const trigger = ref(null)
const preferences = ref(readPreferences())
const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function apply() { applyPreferences(preferences.value, media?.matches ?? false) }
function update(changes) {
  preferences.value = { ...preferences.value, ...changes }
  apply()
  savePreferences(preferences.value)
}
function changeFont(step) {
  update({ fontSize: Math.min(130, Math.max(90, preferences.value.fontSize + step)) })
}
function onPointerDown(event) {
  if (open.value && !root.value?.contains(event.target)) open.value = false
}
function onKeyDown(event) {
  if (event.key === 'Escape' && open.value) {
    open.value = false
    trigger.value?.focus()
  }
}
function onSystemChange() { if (preferences.value.theme === 'system') apply() }

onMounted(() => {
  apply()
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeyDown)
  media?.addEventListener?.('change', onSystemChange)
})
onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeyDown)
  media?.removeEventListener?.('change', onSystemChange)
})
</script>

<template>
  <div ref="root" class="accessibility-control">
    <button ref="trigger" type="button" class="accessibility-trigger" aria-label="Aparência e acessibilidade" aria-controls="accessibility-panel" :aria-expanded="open" @click="open = !open"><span aria-hidden="true">◐</span><span class="accessibility-trigger-label">Aparência</span></button>
    <div v-if="open" id="accessibility-panel" class="accessibility-panel" role="group" aria-label="Aparência e acessibilidade">
      <div class="accessibility-section"><span class="accessibility-label">Tema</span><div class="accessibility-options" role="group" aria-label="Tema"><button v-for="option in [{ value: 'system', label: 'Sistema' }, { value: 'light', label: 'Claro' }, { value: 'dark', label: 'Escuro' }]" :key="option.value" type="button" :aria-pressed="preferences.theme === option.value" @click="update({ theme: option.value })">{{ option.label }}</button></div></div>
      <div class="accessibility-section"><span class="accessibility-label">Tamanho da fonte</span><div class="font-controls"><button type="button" aria-label="Diminuir fonte" :disabled="preferences.fontSize <= 90" @click="changeFont(-10)">−</button><output aria-live="polite">{{ preferences.fontSize }}%</output><button type="button" aria-label="Aumentar fonte" :disabled="preferences.fontSize >= 130" @click="changeFont(10)">+</button></div></div>
      <div class="accessibility-section contrast-section"><span><strong>Alto contraste</strong><small>Mais diferença entre texto e fundo</small></span><button type="button" class="contrast-switch" role="switch" aria-label="Alto contraste" :aria-checked="preferences.highContrast" @click="update({ highContrast: !preferences.highContrast })"><span></span></button></div>
      <button type="button" class="accessibility-reset" @click="update({ theme: 'system', fontSize: 100, highContrast: false })">Restaurar padrão</button>
    </div>
  </div>
</template>
