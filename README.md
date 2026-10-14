# OnlyStudent frontend

Interface Vue 3 para alunos e professores. Alunos podem procurar turmas, entrar nelas e abrir materiais. Professores podem criar turmas e acompanhar as que criaram. O frontend usa a API Spring do repositório `OnlyStudent-backend`.

## Rodar localmente

1. Inicie o PostgreSQL e a API conforme o README do backend. A API deve responder em `http://localhost:8082`.
2. Execute `npm ci` e `npm run dev` neste diretório.
3. Abra `http://localhost:5173`.

O Vite envia as chamadas `/api` para a API local. A interface usa componentes por tela em `src/components`, chamadas HTTP em `src/lib/api.js` e tokens de cor, espaçamento, fonte e borda em `src/style.css`.
O tema claro ou escuro acompanha a configuração do dispositivo. Cada turma tem uma URL própria; a seta do navegador e o botão “Minhas turmas” retornam à lista.
O botão **Aparência**, no cabeçalho, reúne tema Sistema/Claro/Escuro, fonte de 90% a 130% e alto contraste. As escolhas ficam salvas no navegador. “Restaurar padrão” volta ao tema do sistema, fonte de 100% e contraste normal.
Em produção, configure `VITE_API_URL` com a URL pública da API. O backend precisa incluir a origem do frontend em `CORS_ALLOWED_ORIGINS`.

## QA em um comando

```bash
npm run qa
```

O comando confere o PostgreSQL Docker, inicia a API se necessário, prepara as contas de demonstração, roda testes unitários, compila o frontend e executa os testes de navegador em desktop, tablet e celular. É preciso ter Docker, Java 17+ e Chromium instalados. Se não houver Chromium no sistema, instale o navegador do Playwright com `npx playwright install chromium`.

## Contas de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Professor | `professor.demo@onlystudent.test` | `OnlyStudent2026!` |
| Aluno | `aluno.demo@onlystudent.test` | `OnlyStudent2026!` |

O script do backend cria as contas, duas turmas e a matrícula do aluno. Esses dados são locais e servem apenas para desenvolvimento.
