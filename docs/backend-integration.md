# Integração OnlyStudent

Backend de referência: https://github.com/Ramon-M-S/OnlyStudent-backend/tree/refactor/backend

## Contratos confirmados na branch refactor/backend

- `POST /auth/register`: recebe `email`, `telephone`, `name`, `password`, `role` e `especialidade` quando professor. Retorna HTTP 201 sem conteúdo.
- `POST /auth/login`: recebe `email` e `password`. Retorna `name`, `email`, `role`, `telephone`, `especialidade`, `token` e `id`.
- `GET /turma/educatorTurmas` e `GET /turma/studentTurmas`: recebem paginação e retornam `Page<ClassroomsDTO>` (`content`).
- `GET /turma/allClassroom`: busca paginada para usuário autenticado.
- `POST /turma/register`: recebe `name`, `description`, `idEducator`, `price`. O backend usa a identidade autenticada para definir o professor.
- `POST /turma/{codigo}/entrar`: recebe `{ "idAluno": 123 }` (número inteiro); o backend identifica o aluno autenticado.
- `GET /turma/{id}`: detalhe acessível apenas ao professor dono ou aluno matriculado; caso contrário HTTP 403.
- `GET /turma/{codigo}/materials`: retorna materiais para usuários autorizados.

As mensagens de erro do backend podem vir como texto simples, não apenas JSON.

## Executar localmente

Inicie a API Spring Boot com PostgreSQL seguindo o repositório do backend. Copie `.env.example` para `.env.local` e configure `BACKEND_URL` para a origem da API. Execute `npm ci` e `npm run dev`. O proxy de desenvolvimento encaminha `/api/*` ao Spring removendo `/api`.

## Produção

O proxy Vite não existe no build estático. Configure `VITE_API_URL` para a URL HTTPS pública da API ou use rewrite/proxy no provedor. Configure `app.cors.allowed-origins` no backend conforme a origem real do frontend e mantenha segredos no ambiente do servidor, nunca em variáveis `VITE_*`.

## Validação pendente

Ainda falta realizar um teste de ponta a ponta com frontend, Spring e PostgreSQL ativos. Os contratos acima foram examinados no código da branch `refactor/backend`, mas não demonstram disponibilidade operacional ou deploy.
