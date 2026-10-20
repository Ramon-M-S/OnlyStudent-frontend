import { afterEach, describe, expect, it, vi } from 'vitest'
import { request } from '../src/lib/api.js'

afterEach(() => vi.unstubAllGlobals())

describe('cliente HTTP do backend', () => {
  it('envia autenticação Bearer e JSON ao Spring', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200, text: async () => JSON.stringify({ token: 'jwt' })
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await request('/auth/login', { method: 'POST', token: 'abc', body: { email: 'aluno@example.com' } })).toEqual({ token: 'jwt' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer abc', 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email: 'aluno@example.com' })
    }))
  })

  it('aceita cadastro com 201 e corpo vazio', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 201, text: async () => '' }))
    await expect(request('/auth/register', { method: 'POST', body: { role: 'STUDENT' } })).resolves.toBeNull()
  })

  it('preserva erro 403 quando a turma não está acessível', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => 'Acesso negado.' }))
    await expect(request('/turma/123')).rejects.toMatchObject({ status: 403, message: 'Acesso negado.' })
  })

  it('preserva status 401 para encerrar a sessão', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => '' }))
    await expect(request('/turma/1')).rejects.toMatchObject({ status: 401, message: 'Sua sessão expirou. Entre novamente.' })
  })

  it('repassa uma mensagem de validação do servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400, text: async () => JSON.stringify({ message: 'E-mail inválido' }) }))
    await expect(request('/auth/register')).rejects.toThrow('E-mail inválido')
  })

  it('informa quando o backend está indisponível', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(request('/turma/allClassroom')).rejects.toThrow('Não foi possível conectar ao servidor')
  })
})
