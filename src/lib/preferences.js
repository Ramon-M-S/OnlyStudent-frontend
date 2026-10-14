const key = 'onlystudent.preferences'
export const defaultPreferences = { theme: 'system', fontSize: 100, highContrast: false }

export function readPreferences(storage = localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(key) || '{}')
    return {
      theme: ['system', 'light', 'dark'].includes(saved.theme) ? saved.theme : 'system',
      fontSize: [90, 100, 110, 120, 130].includes(saved.fontSize) ? saved.fontSize : 100,
      highContrast: saved.highContrast === true
    }
  } catch { return { ...defaultPreferences } }
}

export function applyPreferences(preferences, darkSystem = false, root = document.documentElement) {
  const theme = preferences.theme === 'system' ? (darkSystem ? 'dark' : 'light') : preferences.theme
  root.dataset.theme = theme
  root.dataset.contrast = preferences.highContrast ? 'high' : 'normal'
  root.style.fontSize = `${preferences.fontSize}%`
  root.style.setProperty('--font-adjust', `${(preferences.fontSize - 100) * 0.4}px`)
  document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
    if (!meta.media) meta.content = theme === 'dark' ? '#141815' : '#fafaf7'
  })
}

export function savePreferences(preferences, storage = localStorage) {
  try { storage.setItem(key, JSON.stringify(preferences)) } catch { /* A interface continua utilizável sem armazenamento. */ }
}
