# Integração com OnlyStudent-backend

Backend de referência: https://github.com/Ramon-M-S/OnlyStudent-backend

## Desenvolvimento local

1. Configure e inicie o Spring Boot e o PostgreSQL conforme o backend.
2. Copie `.env.example` para `.env.local`. Ajuste `BACKEND_URL` para a porta em que o Spring estiver disponível (por exemplo 8080 ou 8082).
3. Rode `npm ci` e `npm run dev`.
4. O navegador acessa `/api/*`; o Vite encaminha para o backend removendo o prefixo `/api`.

## Produção

O proxy do Vite funciona somente no servidor de desenvolvimento. Em produção, configure `VITE_API_URL` com a URL pública HTTPS da API ou configure um proxy/rewrite no seu provedor de hospedagem. O backend também deve permitir a origem do frontend no CORS quando usar domínios distintos.

## Contratos que precisam ser validados com o backend

O frontend atualmente usa `POST /auth/register`, `POST /auth/login`, `GET /turma/educatorTurmas`, `GET /turma/studentTurmas`, `GET /turma/allClassroom`, `GET /turma/{id}`, `POST /turma/register` e `POST /turma/{id}/entrar`.

Essas rotas refletem o contrato já presente no frontend, **não constituem uma confirmação** dos endpoints disponíveis no repositório Ramon-M-S/OnlyStudent-backend. Antes de considerar a integração funcional, confirme os controllers, DTOs, autenticação JWT e teste com o Spring e o banco ativos.

Não inclua tokens JWT nem senhas em variáveis `VITE_*` ou no repositório.
