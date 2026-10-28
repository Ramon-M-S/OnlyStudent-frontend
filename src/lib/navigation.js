const paths = {
  home: '/',
  login: '/entrar',
  register: '/cadastro',
  dashboard: '/turmas',
  catalog: '/explorar',
  create: '/nova-turma'
}

export function routeFor(view, classroomId) {
  if (view === 'class') return `#/turma/${classroomId}`
  return `#${paths[view]}`
}

export function routeFromHash(hash) {
  const classroom = /^#\/turma\/(\d+)$/.exec(hash)
  if (classroom) return { view: 'class', classroomId: Number(classroom[1]) }
  const entry = Object.entries(paths).find(([, path]) => hash === `#${path}`)
  return { view: entry?.[0] || 'home' }
}
