import { beforeEach, describe, expect, it } from 'vitest'
import { applyPreferences, defaultPreferences, readPreferences, savePreferences } from '../src/lib/preferences.js'

describe('preferências de acessibilidade', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-contrast')
  })

  it('usa padrões seguros para dados inválidos', () => {
    localStorage.setItem('onlystudent.preferences', '{bad json')
    expect(readPreferences()).toEqual(defaultPreferences)
    localStorage.setItem('onlystudent.preferences', JSON.stringify({ theme: 'unknown', fontSize: 500, highContrast: 'true' }))
    expect(readPreferences()).toEqual(defaultPreferences)
  })

  it('persiste preferências escolhidas', () => {
    const preferences = { theme: 'dark', fontSize: 120, highContrast: true }
    savePreferences(preferences)
    expect(readPreferences()).toEqual(preferences)
  })

  it('ativa tema escuro e alto contraste', () => {
    applyPreferences({ theme: 'dark', fontSize: 110, highContrast: true })
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.dataset.contrast).toBe('high')
    expect(document.documentElement.style.fontSize).toBe('110%')
  })

  it('respeita a preferência de tema do sistema', () => {
    applyPreferences({ theme: 'system', fontSize: 100, highContrast: false }, true)
    expect(document.documentElement.dataset.theme).toBe('dark')
    applyPreferences({ theme: 'system', fontSize: 100, highContrast: false }, false)
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
