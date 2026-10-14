import { describe, expect, it } from 'vitest'
import { applyPreferences, defaultPreferences, readPreferences } from './preferences.js'

describe('preferências de acessibilidade', () => {
  it('descarta valores salvos fora das opções permitidas', () => {
    const storage = { getItem: () => '{"theme":"purple","fontSize":500,"highContrast":"yes"}' }
    expect(readPreferences(storage)).toEqual(defaultPreferences)
  })

  it('aplica o tema do sistema e o tamanho de fonte escolhido', () => {
    const root = document.createElement('html')
    applyPreferences({ theme: 'system', fontSize: 120, highContrast: true }, true, root)
    expect(root.dataset.theme).toBe('dark')
    expect(root.dataset.contrast).toBe('high')
    expect(root.style.fontSize).toBe('120%')
  })
})
