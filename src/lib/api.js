export async function request(path, { method = 'GET', body, token, signal } = {}) {
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
  const endpoint = path.startsWith('/') ? path : `/${path}`
  let response
  try {
    response = await fetch(`${base}${endpoint}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause
    const error = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
    error.cause = cause
    throw error
  }

  const content = await response.text()
  let data
  try { data = content ? JSON.parse(content) : null } catch { data = content }

  if (!response.ok) {
    const backendMessage = typeof data === 'string'
      ? data
      : (data?.message || data?.error || data?.detail)
    const error = new Error(response.status === 401
      ? 'Sua sessão expirou. Entre novamente.'
      : (backendMessage && response.status < 500 ? backendMessage : 'Não foi possível concluir a solicitação.'))
    error.status = response.status
    throw error
  }
  return data
}
