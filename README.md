# Validador de Ações Judiciais — Front-end Next.js

Aplicação Web em **Next.js + TypeScript + Tailwind CSS** para criação e acompanhamento de checklists judiciais baseados em três anexos: Recuperação de Vasilhames, Cobrança de Títulos e Cobrança de Multa Contratual.

## Funcionalidades

- Login SSO Microsoft Entra ID via Auth.js/NextAuth.
- Perfis: `USER`, `DEJUR`, `ADMIN`.
- Qualquer usuário autenticado no Active Directory pode abrir solicitação como `USER`.
- Formulário em etapas com rascunho automático.
- Upload de PDF, Word e imagens com limite total de 10 MB.
- Submissão para backend em `multipart/form-data`.
- Status: `DRAFT`, `SUBMITTED`, `PROCESSING`, `APPROVED`, `REJECTED`, `ERROR`, `NEEDS_CORRECTION`, `CANCELLED`.
- Tela DEJUR mostra somente solicitações aprovadas pela LLM.
- Mocks locais, collection Postman e OpenAPI.

## Como executar localmente

```bash
cp .env.example .env
npm install
npm run dev
```

Acesse: `http://localhost:3000`.

## Mock API

```bash
npm run mock:api
```

Endpoints mockados em `http://localhost:8080`.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## Testes

```bash
npm run type-check
npm run lint
npm run test
npm run test:e2e
npm run validate:schemas
```

## Contratos de API

- OpenAPI: `docs/openapi/openapi.json`
- Postman: `docs/postman/Validador_Acoes_Judiciais.postman_collection.json`

## Regras de Upload

- Extensões: `.pdf`, `.doc`, `.docx`, `.png`, `.jpg`, `.jpeg`.
- Tamanho total máximo: 10 MB por solicitação.
- Todo documento obrigatório deve possuir arquivo associado.

## Número da requisição

Formato esperado do backend:

```txt
REQ-AAAA-MM-DD-NNNNNN
Exemplo: REQ-2026-07-03-000001
```

## Observação de segurança

O front-end controla UX e visibilidade de menus, mas o backend deve validar permissões, ownership, status e acesso aos arquivos.
