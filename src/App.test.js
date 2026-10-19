import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from './App.vue'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/')
  vi.unstubAllGlobals()
})

describe('Study Hub', () => {
  it('abre a página com ações de acesso e sem indicadores fictícios', () => {
    const app = mount(App)
    expect(app.find('h1').text()).toContain('Aprender fica mais fácil')
    expect(app.find('.brand').text()).toContain('Study Hub')
    expect(app.text()).toContain('Criar conta')
    expect(app.text()).not.toContain('Turmas ativas')
  })

  it('mostra o campo de área de ensino para professor', async () => {
    const app = mount(App)
    await app.find('.home .button.dark').trigger('click')
    expect(app.find('input[placeholder="Ex.: Matemática"]').exists()).toBe(false)
    await app.findAll('.role-switch button')[1].trigger('click')
    expect(app.find('input[placeholder="Ex.: Matemática"]').exists()).toBe(true)
  })

  it('entra, carrega as turmas do aluno e abre uma turma', async () => {
    const user = { id: 12, name: 'Lucas Oliveira', role: 'student', token: 'token-de-teste' }
    const classroom = { codigo: 23, name: 'Fundamentos de Programação', educator: 'Marina Costa', totalAlunos: 1, totalMateriais: 0 }
    const requests = []
    vi.stubGlobal('fetch', vi.fn(async (url, options) => {
      requests.push({ url, options })
      if (url === '/api/auth/login') return { ok: true, text: async () => JSON.stringify(user) }
      if (url.includes('/studentTurmas')) return { ok: true, text: async () => JSON.stringify({ content: [classroom] }) }
      if (url === '/api/turma/23') return { ok: true, text: async () => JSON.stringify({ ...classroom, description: 'Primeiros exercícios.', materiais: [], nomeAlunos: ['Lucas Oliveira'] }) }
      throw new Error(`Requisição inesperada: ${url}`)
    }))
    const app = mount(App)
    await app.find('.home .button.outline').trigger('click')
    await app.find('input[type="email"]').setValue('aluno.demo@onlystudent.test')
    await app.find('input[type="password"]').setValue('OnlyStudent2026!')
    await app.find('form').trigger('submit')
    await flushPromises()
    expect(app.text()).toContain('Fundamentos de Programação')
    expect(requests[1].options.headers.Authorization).toBe('Bearer token-de-teste')
    await app.find('.class-card').trigger('click')
    await flushPromises()
    expect(app.text()).toContain('Primeiros exercícios.')
  })

  it('abre o menu em telas pequenas', async () => {
    const app = mount(App)
    const menu = app.find('.menu-button')
    await menu.trigger('click')
    expect(menu.attributes('aria-expanded')).toBe('true')
    expect(app.find('nav').classes()).toContain('open')
  })
})
