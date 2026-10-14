export async function request(path, { method = 'GET', body, token } = {}) {
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  })
  const text = await response.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) {
    const message = response.status === 401 ? 'Sua sessão expirou. Entre novamente.' : typeof data === 'string' ? data : 'Não foi possível concluir a solicitação.'
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return data
}
