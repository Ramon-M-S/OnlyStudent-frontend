import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingView from '../src/components/LandingView.vue'

describe('LandingView', () => {
  it('mostra o conteúdo principal e os recursos', () => {
    const wrapper = mount(LandingView)
    expect(wrapper.get('h1').text()).toContain('Aprender fica mais fácil')
    expect(wrapper.findAll('.feature-card')).toHaveLength(3)
    expect(wrapper.get('[aria-label="Prévia ilustrativa da organização de uma turma"]').exists()).toBe(true)
  })

  it('direciona para cadastro ao clicar no CTA principal', async () => {
    const wrapper = mount(LandingView)
    await wrapper.get('.hero-primary').trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['register'])
  })

  it('direciona para login a partir do CTA secundário', async () => {
    const wrapper = mount(LandingView)
    await wrapper.get('.hero-secondary').trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['login'])
  })

  it('mantém hierarquia semântica e rótulos acessíveis', () => {
    const wrapper = mount(LandingView)
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('#benefits-title').text()).toBeTruthy()
    expect(wrapper.get('#closing-title').text()).toBeTruthy()
    expect(wrapper.findAll('button').every(button => button.attributes('type') === 'button')).toBe(true)
  })
})
