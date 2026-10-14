import { afterEach, describe, expect, it, vi } from 'vitest'
import { request } from './api.js'

afterEach(() => vi.unstubAllGlobals())

describe('request', () => {
  it('envia JSON e token para a API local', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => '{"codigo":5}' }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(request('/turma/register', { method: 'POST', token: 'abc', body: { name: 'Turma' } })).resolves.toEqual({ codigo: 5 })
    expect(fetchMock).toHaveBeenCalledWith('/api/turma/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer abc' },
      body: '{"name":"Turma"}'
    })
  })

  it('mostra o erro da API com o status HTTP', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 409, text: async () => 'Já existe uma turma com esse nome.' })))
    await expect(request('/turma/register', { method: 'POST', body: { name: 'Turma' } })).rejects.toMatchObject({ status: 409, message: 'Já existe uma turma com esse nome.' })
  })
})
