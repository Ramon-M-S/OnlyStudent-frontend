import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'
describe('OnlyStudent landing', () => {
 it('renders the headline and primary action', () => { const w=mount(App); expect(w.find('h1').text()).toContain('aprender sem limites'); expect(w.text()).toContain('Começar gratuitamente') })
 it('renders three feature cards', () => { expect(mount(App).findAll('.feature-card')).toHaveLength(3) })
 it('toggles color theme accessibly', async () => { const w=mount(App); const b=w.find('.theme-btn'); expect(w.attributes('data-theme')).toBe('dark'); await b.trigger('click'); expect(w.attributes('data-theme')).toBe('light'); expect(b.attributes('aria-label')).toBe('Ativar tema escuro') })
 it('opens and closes mobile menu', async () => { const w=mount(App); const button=w.find('.mobile-menu'); await button.trigger('click'); expect(button.attributes('aria-expanded')).toBe('true'); expect(w.find('.navigation').classes()).toContain('open'); await w.find('.navigation a').trigger('click'); expect(button.attributes('aria-expanded')).toBe('false') })
 it('has accessible navigation and landmarks', () => { const w=mount(App); expect(w.find('nav[aria-label="Navegação principal"]').exists()).toBe(true); expect(w.find('main').exists()).toBe(true) })
})
