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
    expect(app.find('#students-tab').exists()).toBe(false)
  })

  it('permite que o educador responsável veja a lista de alunos', async () => {
    const educator = { id: 7, name: 'Marina Costa', role: 'educator', token: 'token-de-teste' }
    const classroom = { codigo: 23, name: 'Fundamentos de Programação', educator: 'Marina Costa' }
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url === '/api/auth/login') return { ok: true, text: async () => JSON.stringify(educator) }
      if (url.includes('/educatorTurmas')) return { ok: true, text: async () => JSON.stringify({ content: [classroom] }) }
      if (url === '/api/turma/23') {
        return { ok: true, text: async () => JSON.stringify({ ...classroom, description: 'Primeiros exercícios.', materiais: [], nomeAlunos: ['Lucas Oliveira', 'Ana Souza'] }) }
      }
      throw new Error(`Requisição inesperada: ${url}`)
    }))

    const app = mount(App)
    await app.find('.home .button.outline').trigger('click')
    await app.find('input[type="email"]').setValue('professora@onlystudent.test')
    await app.find('input[type="password"]').setValue('OnlyStudent2026!')
    await app.find('form').trigger('submit')
    await flushPromises()
    await app.find('.class-card').trigger('click')
    await flushPromises()

    expect(app.find('#materials-tab').attributes('aria-selected')).toBe('true')
    await app.find('#students-tab').trigger('click')
    expect(window.location.hash).toBe('#/turma/23')
    expect(app.find('#students-tab').attributes('aria-selected')).toBe('true')
    expect(app.find('#materials-panel').exists()).toBe(false)
    expect(app.findAll('.student-list li').map(item => item.text())).toEqual(['Lucas Oliveira', 'Ana Souza'])
    await app.find('#materials-tab').trigger('click')
    expect(app.find('#materials-tab').attributes('aria-selected')).toBe('true')
    expect(app.find('#students-panel').exists()).toBe(false)
  })

  it('mostra uma mensagem amigável quando a turma não tem alunos', async () => {
    localStorage.setItem('onlystudent.session', JSON.stringify({ id: 7, name: 'Marina Costa', role: 'educator', token: 'token-de-teste' }))
    window.history.replaceState({}, '', '/#/turma/23')
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url === '/api/turma/23') {
        return { ok: true, text: async () => JSON.stringify({ codigo: 23, name: 'Matemática', educator: 'Marina Costa', nomeAlunos: [], materiais: [] }) }
      }
      if (url.includes('/educatorTurmas')) return { ok: true, text: async () => JSON.stringify({ content: [{ codigo: 23 }] }) }
      throw new Error(`Requisição inesperada: ${url}`)
    }))

    const app = mount(App)
    await flushPromises()
    await app.find('#students-tab').trigger('click')
    expect(app.text()).toContain('Nenhum aluno matriculado ainda.')
  })

  it('não mostra a aba de alunos para um educador que não é dono da turma', async () => {
    localStorage.setItem('onlystudent.session', JSON.stringify({ id: 7, name: 'Marina Costa', role: 'educator', token: 'token-de-teste' }))
    window.history.replaceState({}, '', '/#/turma/23')
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url === '/api/turma/23') {
        return { ok: true, text: async () => JSON.stringify({ codigo: 23, name: 'Matemática', educator: 'Outro professor', nomeAlunos: ['Aluno'] }) }
      }
      if (url.includes('/educatorTurmas')) return { ok: true, text: async () => JSON.stringify({ content: [] }) }
      throw new Error(`Requisição inesperada: ${url}`)
    }))

    const app = mount(App)
    await flushPromises()
    expect(window.location.hash).toBe('#/turma/23')
    expect(app.find('#students-tab').exists()).toBe(false)
    expect(app.find('.student-list').exists()).toBe(false)
  })

  it('abre o menu em telas pequenas', async () => {
    const app = mount(App)
    const menu = app.find('.menu-button')
    await menu.trigger('click')
    expect(menu.attributes('aria-expanded')).toBe('true')
    expect(app.find('nav').classes()).toContain('open')
  })
})
