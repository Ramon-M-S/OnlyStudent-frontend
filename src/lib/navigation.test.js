import { describe, expect, it } from 'vitest'
import { routeFor, routeFromHash } from './navigation.js'

describe('navegação', () => {
  it('gera uma rota própria para cada turma', () => {
    expect(routeFor('class', 42)).toBe('#/turma/42')
    expect(routeFromHash('#/turma/42')).toEqual({ view: 'class', classroomId: 42 })
  })

  it('não reconhece mais uma rota separada para os alunos', () => {
    expect(routeFromHash('#/turma/42/alunos')).toEqual({ view: 'home' })
  })

  it('volta ao início quando a rota não existe', () => {
    expect(routeFromHash('#/desconhecida')).toEqual({ view: 'home' })
  })
})
