# Auditoria do contrato da API do frontend

> Auditoria estática do código disponível neste repositório, em 14/10/2026. “Inferido” identifica estruturas deduzidas pelo uso dos dados, não declaradas por tipos ou por um schema de API. Nenhum arquivo do frontend foi alterado.

## Índice

1. [Stack e configuração](#1-stack-e-configuração)
2. [Variáveis de ambiente](#2-variáveis-de-ambiente)
3. [Configuração HTTP](#3-configuração-http)
4. [Mapa de endpoints](#4-mapa-de-endpoints-contrato-com-o-back)
5. [Mapa de estado global](#5-mapa-de-estado-global)
6. [Mapa de rotas](#6-mapa-de-rotas)
7. [Autenticação e autorização](#7-fluxos-de-autenticação-e-autorização)
8. [Respostas e erros](#8-formato-de-respostas-e-erros)
9. [Perfis de usuário](#9-perfis-de-usuário)
10. [Regras de negócio visíveis](#10-regras-de-negócio-visíveis-no-front)
11. [Uploads](#11-upload-de-arquivos--uploads)
12. [Integrações externas](#12-integrações-externas-do-front)
13. [Pontos de atenção e riscos](#13-pontos-de-atenção--riscos)
14. [Resumo executivo](#14-resumo-executivo)

## 1. Stack e configuração

O conteúdo encontrado não corresponde integralmente à stack informada na solicitação. A aplicação usa Vue 3, mas a camada HTTP é `fetch`, a navegação é própria por fragmento/hash e não há Vuex configurado.

| Tecnologia | Declarado em `package.json` | Resolvido em `package-lock.json` | Uso observado |
|---|---:|---:|---|
| Vue | `^3.4.21` | `3.5.44` | Sim |
| Vue Router | `^4.3.0` | `4.6.4` | Não encontrado em imports/configuração; dependência declarada |
| Vuex | Não declarado | Não encontrado | Não encontrado |
| Axios | Não declarado | Não encontrado | Não encontrado |
| Vite | `^5.2.8` | `5.4.21` | Sim |
| `@vitejs/plugin-vue` | `^5.0.4` | `5.2.4` | Sim |
| Vitest | `^1.4.0` | `1.6.1` | Sim |
| Vue Test Utils | `^2.4.5` | `2.5.1` | Sim |

As versões do manifesto são intervalos semver; as versões resolvidas acima são as exatas no lockfile.

- **Alias Vite:** não encontrado. `vite.config.js` registra o plugin Vue, proxy `/api` e configuração de testes; não configura `resolve.alias`.
- **Bibliotecas de UI declaradas:** Bootstrap, Bootstrap Icons, Buefy, Element Plus e Vue Toastification não estão declaradas nem foram encontradas em imports. O estilo da interface está em `src/style.css`.
- **Scripts npm:** `dev` (`vite --host`), `build` (`vite build`), `preview` (`vite preview`), `test:unit` e `test` (`vitest run`), `qa` (`bash scripts/qa.sh`) e `test:e2e` (`playwright test`).
- **Bootstrap:** `src/main.js` cria a aplicação Vue e importa somente `App.vue` e `style.css`.
- **API local:** o proxy de desenvolvimento encaminha `/api` para `http://localhost:8082`, remove o prefixo `/api`, habilita `changeOrigin` e remove o header `origin` da requisição ao proxy. Referência: `vite.config.js:1-11`.

## 2. Variáveis de ambiente

Não há arquivos `.env*` no nível raiz examinado. A busca por variáveis `VITE_*` encontrou apenas `VITE_API_URL`.

| Variável | Onde é usada | Obrigatória | Valor default | Descrição |
|---|---|---|---|---|
| `VITE_API_URL` | `src/lib/api.js:2`; recomendada para produção em `README.md:14` | Não no código | `/api` | Prefixo/base das chamadas HTTP; uma barra final é removida. Em desenvolvimento, `/api` é proxy para `localhost:8082`. |

`README.md` orienta configurar `VITE_API_URL` com a URL pública da API em produção. A aplicação, porém, mantém `/api` como fallback quando a variável não existe.

## 3. Configuração HTTP

- **Arquivo:** `src/lib/api.js`, função `request(path, { method = 'GET', body, token } = {})`.
- **Cliente:** `fetch` nativo do navegador; não há Axios nem interceptors.
- **Base URL:** `(import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')`, concatenada diretamente com `path`.
- **Timeout:** não configurado.
- **Headers:** `Content-Type: application/json` somente quando `body` é truthy. Se `token` for truthy, adiciona `Authorization: Bearer ${token}`.
- **Body:** serializado com `JSON.stringify(body)`; sem body, a propriedade `body` é `undefined`.
- **Resposta:** lê `response.text()`, tenta `JSON.parse`; texto não JSON fica como string e corpo vazio vira `null`. Em sucesso retorna o objeto/valor diretamente, sem envelope Axios.
- **Erros:** rejeita com `Error`, anexa `status` HTTP e propaga com `throw`; falhas de rede nativas também rejeitam. A interface captura o erro em `App.vue` e apresenta `cause.message`.
- **Interceptors:** não encontrados.
- **Refresh:** não encontrado.
- **Toast/redirecionamento HTTP global:** não há plugin/toast. O tratamento central em `App.vue` faz logout e encaminha para login somente em 401.

Trecho relevante de `src/lib/api.js:1-3,8-17`:

```js
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
```

O teste `src/lib/api.test.js:5-14` verifica o header de autorização ao enviar um token.

## 4. Mapa de endpoints (contrato com o back)

Há **8 rotas/formatos de endpoint mapeados** (8 linhas abaixo). Todos são construídos em `src/App.vue`; não foram encontrados outros consumidores HTTP em views/components.

| Método | Path | Body (req) | Query/Params | Response esperada | Quem chama | Auth? | Perfil |
|---|---|---|---|---|---|---|---|
| POST | `/auth/register` | `{ name, email, telephone, password, especialidade, role }`; campos textuais originam-se do formulário. `role` é transformado para maiúsculas: `STUDENT` ou `EDUCATOR`. `especialidade` está presente também para estudante como string vazia (inferido). | — | O retorno é ignorado; qualquer HTTP 2xx deixa o fluxo seguir para login. | `App.vue:80-85` → `authenticate`; UI em `components/AuthView.vue:5-7,14-18` | Não | Registro seleciona estudante ou educador; não há autorização de perfil estabelecida nesta chamada. |
| POST | `/auth/login` | `{ email, password }` | — | Objeto de sessão usado diretamente, com `id`, `name`, `role`, `token` (inferido pelo uso e fixture em `src/App.test.js:29-30`). | `App.vue:80-88` → `authenticate`; UI em `components/AuthView.vue` | Não | Não enviado na requisição; papel vem na sessão (inferido). |
| GET | `/turma/studentTurmas` | — | `codigo=<session.id>&page=0&size=50` | `{ content: [turma, ...] }` (inferido). Cada turma usa `codigo`, `name`, `educator`, `totalAlunos`, `totalMateriais` (inferido). | `App.vue:50-59` → `loadClasses` | Sim, token condicional | `student`; qualquer role diferente de `educator` cai neste endpoint |
| GET | `/turma/educatorTurmas` | — | `codigo=<session.id>&page=0&size=50` | `{ content: [turma, ...] }` (inferido); mesmos campos de turma listados acima. | `App.vue:50-59` → `loadClasses` | Sim, token condicional | `educator` |
| GET | `/turma/allClassroom` | — | `search=&page=0&size=50` | `{ content: [turma, ...] }` (inferido); a tela usa `codigo`, `name`, `educator`, `totalAlunos` (inferido). | `App.vue:62-68` → `loadCatalog` | Sim, se existir sessão | UI destinada a estudante, mas não há validação local de role na chamada. |
| GET | `/turma/{classroomId}` | — | `classroomId` é interpolado no path; a rota hash aceita somente dígitos. | Objeto direto com `name`, `description`, `educator`, `nomeAlunos` (array), `materiais` (array); cada material usa `id`, `tipo`, `name`, `url` (todos inferidos). | `App.vue:94-101` → `showClass` / abertura de classe | Sim, token condicional | Qualquer sessão; sem verificação por perfil nesta chamada. |
| POST | `/turma/register` | `{ name, description, idEducator: session.id, price: 0 }`; os dois primeiros campos vêm do formulário. | — | Retorno ignorado; o frontend só exige que a chamada não rejeite. | `App.vue:129-139` → `createClass`; formulário em `components/ClassFormView.vue:5-11` | Sim, token condicional | Interface de educador; não há validação de perfil no método. |
| POST | `/turma/{codigo}/entrar` | `{ idAluno: String(session.id) }` | `codigo` no path vem de `item.codigo`. | Retorno ignorado; o frontend só exige que a chamada não rejeite. | `App.vue:142-153` → `joinClass`; catálogo em `components/CatalogView.vue:14` | Sim, token condicional | Interface de estudante; não há validação de perfil no método. |

**Observações sobre o contrato inferido:**

- Listas usam `result.content || []`/`catalog.content || []`; paginação além de `page=0,size=50` não é consumida.
- A resposta de login é persistida inteira como sessão, sem transformação.
- Os dois POST de escrita não leem nem usam o corpo de resposta.
- A tabela descreve o que o front envia/consome; os campos anotados como inferidos não são garantidos por schema ou tipos no repositório.

## 5. Mapa de estado global

**Vuex:** não encontrado. Não existem `src/store/`, módulos, actions, mutations ou getters Vuex. Embora `vuex` não esteja declarado em `package.json`, a dependência declarada `vue-router` tampouco é usada.

O estado é local a `src/App.vue` com refs:

| Estado | Inicialização/uso | Persistência |
|---|---|---|
| `session` | `savedSession()` lê objeto da sessão | `localStorage`, chave `onlystudent.session` |
| `view` | Derivado da sessão e hash inicial | URL hash; não é armazenado em storage |
| `classes`, `catalog`, `selected` | Coleções/detalhes de turma carregados sob demanda | Memória |
| `loading`, `error`, `notice` | Estados transitórios de interface | Memória |

`src/components/AccessibilityMenu.vue` mantém preferências no próprio componente e `src/lib/preferences.js` persiste em `localStorage`, chave `onlystudent.preferences`. Os valores aceitos são tema `system|light|dark`, fonte `90|100|110|120|130` e booleano `highContrast`.

### Ações equivalentes

| Função | Responsabilidade |
|---|---|
| `authenticate(form)` | Registra (se a view for `register`), faz login, persiste sessão e carrega turmas. |
| `loadClasses()` | Seleciona listagem de educador/estudante pelo `session.role`. |
| `loadCatalog()` | Busca catálogo de turmas. |
| `createClass(form)` | Cria turma adicionando `idEducator` e `price: 0`. |
| `joinClass(item)` | Solicita entrada na turma com `idAluno` string. |
| `logout()` | Limpa sessão em storage e estado de classes/detalhe. |

Todas estão em `src/App.vue`; não são actions Vuex.

## 6. Mapa de rotas

Navegação própria com `window.location.hash`, `history.pushState/replaceState` e `popstate`, em `src/lib/navigation.js` e `src/App.vue`. Não há `src/router/` ou configuração de Vue Router. As URLs completas da aplicação usam `#` antes do path.

| Hash/path lógico | Nome interno | Componente | Requer auth? | Perfil exigido | Guard/meta |
|---|---|---|---|---|---|
| `#/` | `home` | `components/LandingView.vue` | Não | — | Sem meta |
| `#/entrar` | `login` | `components/AuthView.vue` (`mode=login`) | Não | — | Sem meta |
| `#/cadastro` | `register` | `components/AuthView.vue` (`mode=register`) | Não | — | Sem meta |
| `#/turmas` | `dashboard` | `components/DashboardView.vue` | Sim, sessão local | Nenhum no guard; UI distingue role | Verificação de sessão em `App.vue:114-119` e inicialização `156-164` |
| `#/explorar` | `catalog` | `components/CatalogView.vue` | Sim, sessão local | Pretende estudante; sem restrição no guard | Mesmo tratamento genérico de sessão |
| `#/nova-turma` | `create` | `components/ClassFormView.vue` | Sim, sessão local | Pretende educador; sem restrição no guard | Mesmo tratamento genérico de sessão |
| `#/turma/{id}` (apenas dígitos) | `class` | `components/ClassDetailView.vue` | Sim, sessão local | Nenhum no guard | Mesmo tratamento genérico de sessão |
| Hash não reconhecido | `home` | `LandingView.vue` | Não | — | `routeFromHash` retorna home como fallback |

O componente é escolhido em `src/App.vue:171-177`; os paths e conversão de hash estão em `src/lib/navigation.js:1-17`.

**Trecho exato de verificação de sessão/guard, `src/App.vue:114-119`:**

```js
function onHistoryChange() {
  const route = routeFromHash(window.location.hash)
  if (!session.value && !['home', 'login', 'register'].includes(route.view)) {
    navigate('login', { replace: true })
    return
  }
```

Não há comparação de perfil nesse guard. As comparações de perfil estão na interface e na escolha da listagem:

```js
const endpoint = session.value.role === 'educator' ? 'educatorTurmas' : 'studentTurmas'
```

`src/App.vue:55`; o painel compara `props.session.role === 'educator'` em `components/DashboardView.vue:4`.

## 7. Fluxos de autenticação e autorização

1. **Login:** a tela coleta email e senha. `authenticate` envia `POST /auth/login` com `{ email, password }`.
2. O JSON retornado é considerado o objeto de sessão completo (inferido: `{ id, name, role, token }`) e é salvo sem prazo declarado em `localStorage['onlystudent.session']`.
3. O frontend substitui o hash para `#/turmas`, troca a view para dashboard e chama a listagem adequada pelo role.
4. **Registro:** em `#/cadastro`, envia primeiro `POST /auth/register` com nome, email, telefone, senha, especialidade e role em maiúsculas. Se houver sucesso, faz login imediatamente com email e senha; o retorno de registro não é usado.
5. **Logout:** não chama API. Remove `onlystudent.session`, limpa sessão/classes/detalhe, mostra a página inicial e substitui o hash por `#/`.
6. **401:** remove a sessão pelo fluxo de logout, troca para login e substitui o hash por `#/entrar`. O erro é exibido na tela.
7. **Refresh token:** não encontrado. Não há endpoint/campo/renovação automática visível.
8. **Recuperação/esqueci a senha:** não encontrado; não há tela, link ou endpoint.
9. **Cadastro:** existe apenas o fluxo de registro descrito acima; não há confirmação adicional por email ou etapa de ativação encontrada.

Não há TTL ou checagem local de expiração do token. Se o JSON armazenado não puder ser parseado no boot, `savedSession()` remove a chave e retorna `null` (`src/App.vue:13-16`).

## 8. Formato de respostas e erros

- **Envelope geral:** não encontrado. O helper retorna diretamente o JSON parseado, não extrai `{ data: ... }`.
- **Login:** espera diretamente um objeto de sessão; propriedades usadas: `id`, `name`, `role`, `token` (inferido).
- **Listagens:** espera `content` como array (inferido).
- **Turma individual:** espera propriedades descritas na seção [Mapa de endpoints](#4-mapa-de-endpoints-contrato-com-o-back).
- **Erros:** resposta não-2xx gera `Error` com propriedade `status`. O helper só extrai texto cru como mensagem; se o body for um objeto JSON (ex.: `{message: ...}`), exibe a mensagem genérica, não o campo do objeto.

Trecho de `src/lib/api.js:11-16`:

```js
if (!response.ok) {
  const message = response.status === 401
    ? 'Sua sessão expirou. Entre novamente.'
    : typeof data === 'string'
      ? data
      : 'Não foi possível concluir a solicitação.'
  const error = new Error(message)
  error.status = response.status
  throw error
}
```

O teste `src/lib/api.test.js:16-21` cobre status `409` com body de texto e espera essa mensagem textual. A UI apresenta erro inline (`role="alert"`), não toast. `App.vue:37-44` reage ao 401 antes de atribuir `cause.message`.

| Status | Tratamento identificado |
|---|---|
| 2xx | Retorna JSON parseado, texto ou `null`. |
| 401 | Mensagem fixa “Sua sessão expirou. Entre novamente.”; limpa sessão e encaminha para login. |
| 409 | Não tem lógica dedicada; body texto é mostrado. Há teste unitário desse caso. |
| 400, 403, 404, 422, 500 e demais não-2xx | Sem diferenciação por status; body string é exibido, objeto JSON resulta em mensagem genérica. |
| Falha de rede | Rejeição nativa; a mensagem do erro é exibida, sem status HTTP. |

## 9. Perfis de usuário

| Contexto | Valores/identificadores exatos observados |
|---|---|
| Seleção no formulário | `student` e `educator` minúsculos (`components/AuthView.vue:5,13`) |
| Payload de registro | `role.value.toUpperCase()` → `STUDENT` ou `EDUCATOR` (`components/AuthView.vue:7`) |
| Sessão consumida no dashboard/header | `student` e `educator` minúsculos (`components/DashboardView.vue:4`; `components/AppHeader.vue:17-18`) |
| Listagem escolhida | Somente igualdade estrita com `educator`; qualquer outro valor segue para `studentTurmas` (`App.vue:55`) |
| Strings portuguesas | “aluno”/“professor” são textos de interface; não são os valores usados nas comparações de role. |

Os testes de integração de interface usam `role: 'student'` (`src/App.test.js:29`). Não há evidência de valores `'estudante'`, `'educador'`, `'STUDENT'` ou `'EDUCATOR'` retornados pelo login; no retorno, o frontend precisa receber a forma minúscula para habilitar a UI esperada (inferido).

**Superfícies que distinguem perfil:**

- `components/AuthView.vue`: alterna entre aluno/professor; especialidade aparece e é obrigatória somente para educador; role enviado é upper-case.
- `components/AppHeader.vue:17-18`: exibe “Explorar turmas” para `student` e “Criar turma” para `educator`.
- `components/DashboardView.vue:4-8`: texto, ação principal e chamada do dashboard mudam com `role === 'educator'`.
- `App.vue:55-56`: escolhe `educatorTurmas` ou `studentTurmas`.
- `components/CatalogView.vue` e `components/ClassFormView.vue` são apresentados para os caminhos correspondentes, sem checagem explícita de role.

**Limite de segurança:** a restrição por perfil é de interface, não autorização suficiente. A API deve autorizar no servidor a criação de turma, a matrícula/entrada, a listagem de turmas do usuário e o acesso a cada turma/material. O guard local verifica apenas existência de sessão.

## 10. Regras de negócio visíveis no front

- Cadastro exige nome, email com validação HTML de email, telefone e senha; senha tem `minlength=6`. Para educador, especialidade é obrigatória. Campos de nome/email/telefone/especialidade usam `.trim`; senha não.
- O role do cadastro é transformado para maiúsculas antes do envio; o login subsequente só envia email e senha.
- Criação de turma exige nome e descrição; nome tem limite HTML de 100 caracteres. A turma é enviada com `price: 0`.
- O dashboard lista até 50 itens por solicitação, com `page=0,size=50`; não há paginação posterior encontrada.
- Catálogo envia `search=` vazio e filtra os resultados carregados no cliente por `item.name`, sem diferenciar maiúsculas/minúsculas.
- Catálogo desabilita “Entrar” quando a turma já aparece em `classes`; o servidor deve impedir matrícula duplicada também.
- Depois de entrar, o payload usa `idAluno` como string; criação de turma envia `idEducator` com o id da sessão. Esses identificadores fornecidos pelo cliente não devem ser tratados como prova de identidade no backend.
- Detalhe da turma mostra `nomeAlunos.length` e `materiais.length`; lista de materiais abre `material.url` em nova aba com `rel="noopener noreferrer"`.
- Não há validações ou limites de upload encontrados; não há campo de preço editável.

## 11. Upload de arquivos / uploads

**Upload não encontrado.** Não há uso de `FormData`, `multipart/form-data`, base64 ou input de arquivo. O frontend apenas lê links de materiais já presentes na resposta de detalhe (`materiais[].url`) e os abre em nova aba. Endpoint, tipos e limites de upload não encontrados.

## 12. Integrações externas do front

- **API da aplicação:** `fetch` para a base de `VITE_API_URL`; em desenvolvimento, proxy Vite para `http://localhost:8082`.
- **SDKs/serviços externos:** Google/Facebook login, Stripe, Mercado Pago, Firebase e Sentry não encontrados nas dependências/imports.
- **WebSocket, SSE, polling:** não encontrados.
- **Rede de terceiros:** não foram encontrados imports/fontes/scripts remotos no HTML/CSS/JS examinado. A tela de detalhe navega para `material.url` recebido da API, cuja origem não é validada pelo frontend.

## 13. Pontos de atenção / riscos

1. **Capitalização diferente de role:** cadastro envia `STUDENT`/`EDUCATOR`; a UI após login compara `student`/`educator` com igualdade estrita. O contrato de resposta precisa preservar a forma esperada ou o front não mostrará corretamente a navegação e pode usar o endpoint de estudante por fallback.
2. **Session object não tipado:** `id`, `name`, `role`, `token` são exigidos implicitamente; `name` é usado com `.split(' ')`, logo ausência/nulo pode quebrar o dashboard/header.
3. **Campos em português e inglês coexistem:** turma usa `codigo`, `totalAlunos`, `totalMateriais`, `nomeAlunos`, `materiais`, mas também `name`, `description`, `educator`; renomear requer ajuste coordenado de todos os consumidores.
4. **Identificadores e invariantes são fornecidos pelo cliente:** `codigo` de query, `idEducator`, `idAluno` e role são manipuláveis. Backend deve derivar identidade/autorização do token e validar associação/permissões.
5. **Role não protege caminhos:** sessão qualquer pode tentar abrir `#/explorar`/`#/nova-turma`, e o client não bloqueia cada ação por perfil; endpoint backend precisa validar papel e propriedade.
6. **Contrato do erro JSON frágil:** envelope `{message: ...}` ou `{errors: ...}` não é aproveitado; somente texto cru chega à tela, salvo 401.
7. **Logout só local:** não há invalidação/revogação no servidor nem refresh; comportamento de expiração depende de resposta 401 e da política do backend.
8. **Listagem limitada e filtro local:** catálogo só solicita uma página de 50 registros e envia `search=` vazio; filtros/paginação server-side não estão implementados no consumo.
9. **Operações ignoram resposta de sucesso:** cadastro, criação e entrada não validam body retornado; alteração de status/semântica de sucesso pode passar despercebida se ainda for 2xx.
10. **Sem endpoints de materiais:** tela assume materiais já associados à turma, mas não oferece criação/edição/upload; capacidades backend não mapeadas pelo frontend.
11. **Possível URL de material externa:** `material.url` é navegado diretamente para nova aba; origem/formato não é validado.
12. **Endpoints obsoletos/código morto:** não é possível determinar obsolescência apenas pelo frontend; nenhum endpoint adicional ou chamada alternativa foi encontrado.

## 14. Resumo executivo

O frontend faz **8 formatos de chamada HTTP**: registro e login, duas rotas de listagem por perfil, catálogo, detalhe da turma, criação e entrada em turma. A camada é `fetch` em `src/lib/api.js`, com base `VITE_API_URL` ou `/api`; não usa Axios. Há **0 módulos Vuex** e nenhum estado global Vuex; o estado principal usa refs em `App.vue` e sessão em `localStorage`. Apesar da dependência declarada, Vue Router não é usado: as telas são roteadas por hash em código próprio. Os perfis suportados pela interface são `student` e `educator`; cadastro os envia em maiúsculas, mas a sessão é consumida em minúsculas.

Autenticação é baseada em token recebido no login e armazenado dentro de `onlystudent.session`; requisições autenticadas enviam `Authorization: Bearer <token>`. Não há refresh token, TTL, recuperação de senha, logout remoto ou autenticação social encontrados. Erros 401 limpam a sessão e redirecionam para login; outros status não têm tratamento específico.

**Top 5 riscos para a refatoração do backend:**

1. Preservar compatibilidade dos campos da sessão e minúsculas de `role`.
2. Preservar nomes de campos heterogêneos das turmas, particularmente `codigo`, `name`, `educator`, `nomeAlunos` e `materiais`.
3. Aplicar autorização no backend para papel, identidade, propriedade e matrícula; o frontend não é barreira de segurança.
4. Compatibilizar formato de erro; o cliente não extrai mensagens de objetos JSON, exceto 401.
5. Preservar `content` e paginação inicial; o cliente limita listas a 50 itens e não consome outras páginas.

**Ambiguidades que precisam de confirmação com o time:** shape oficial de sessão e respostas, capitalização oficial de role no retorno do login, semântica/validações dos corpos de registro e escrita, envelope de erro e se endpoints paginados têm mais dados além da primeira página. O repositório contém testes unitários que passaram (10 testes) e a build de produção passou durante esta auditoria.
