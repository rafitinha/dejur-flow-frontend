# Playbook Técnico — Front-end do Validador de Ações Judiciais

## 1. Visão

Construir front-end manutenível, componentizado e testável para criação e validação de checklists judiciais. O backend será implementado depois com base nos contratos definidos neste projeto.

## 2. Escopo confirmado

- Usuário comum: qualquer usuário autenticado via Active Directory.
- Perfis oficiais: `USER`, `DEJUR`, `ADMIN`.
- Rascunho automático: sim, status `DRAFT`.
- DEJUR: visualiza somente solicitações aprovadas pela LLM.
- Armazenamento inicial de arquivos: local no servidor, gerenciado pelo backend.
- Identificador: `REQ-2026-07-03-Numeracao`, padronizado como `REQ-AAAA-MM-DD-NNNNNN`.
- Idioma: português.

## 3. Skills necessárias para o front-end

- Next.js App Router.
- TypeScript avançado.
- Tailwind CSS e design system.
- React Hook Form e Zod.
- Auth.js/NextAuth com Microsoft Entra ID.
- Consumo de APIs REST com multipart/form-data.
- TanStack Query.
- Testes com Vitest, Testing Library e Playwright.
- MSW e Postman para mocks.
- Docker e GitLab CI/CD.
- Acessibilidade e UX para formulários longos.

## 4. Arquitetura

A aplicação separa responsabilidades em:

- `app`: rotas Next.js.
- `components`: componentes reutilizáveis.
- `features`: regras por domínio.
- `config`: schemas, permissões e status.
- `lib`: utilitários, http client e helpers.
- `docs`: OpenAPI, Postman e documentação.
- `scripts`: mock server e validação.

## 5. UX do formulário

O formulário deve ser wizard em 9 etapas:

1. Tipo da ação.
2. Empresa e devedora.
3. Dados específicos.
4. Tentativas de acordo.
5. Valores, índices e atualização.
6. Resumo dos fatos.
7. Parecer da área responsável.
8. Upload de documentos.
9. Revisão e confirmação.

## 6. Regras por checklist

### Recuperação de Vasilhames

Exigir dados da empresa, devedora, endereço confirmado, quantidade P-13/P-20/P-45, valores, índices, tentativas, resumo, parecer e documentos como contrato de comodato, NF, notificação, AR, SERASA, BO, CNPJ, Junta Comercial e consulta imobiliária quando aplicável.

### Cobrança de Títulos

Exigir tipo de título, avalista/fiador quando houver, garantias, valores, índices, tentativas, resumo, parecer e documentos. Se título for duplicata, exigir Nota Fiscal e comprovante de entrega.

### Multa Contratual

Exigir contrato descumprido, cláusula de multa, cálculo, notificação, AR/certidão, SERASA, ciclo contratual, aditivo, desconto autorizado, pareceres da Filial e Contas a Receber.

## 7. Contratos de API

### Criar rascunho

`POST /api/v1/requests/drafts`

Entrada: `ChecklistPayload` em JSON.

Saída:

```json
{
  "requestId": "REQ-2026-07-03-000122",
  "status": "DRAFT"
}
```

### Submeter validação

`POST /api/v1/requests/submit`

Content-Type: `multipart/form-data`.

Campos:

- `metadata`: JSON serializado.
- `files[]`: arquivos.

Saída:

```json
{
  "requestId": "REQ-2026-07-03-000123",
  "status": "PROCESSING",
  "queuePosition": 2
}
```

### Resultado LLM esperado

```json
{
  "requestId": "REQ-2026-07-03-000001",
  "status": "APPROVED",
  "score": 0.94,
  "summary": "A solicitação possui os principais elementos necessários para análise jurídica.",
  "structuredReport": {
    "checklistType": "COBRANCA_MULTA_CONTRATUAL",
    "debtor": "Empresa Devedora LTDA",
    "amount": 45295.16,
    "legalReadiness": "APTA_PARA_DEJUR"
  },
  "missingFields": [],
  "missingDocuments": [],
  "inconsistencies": [],
  "recommendations": [],
  "canResubmit": false,
  "reviewedAt": "2026-07-03T13:47:00Z"
}
```

## 8. Regras de status

- `DRAFT`: editável.
- `PROCESSING`: somente leitura.
- `NEEDS_CORRECTION`: editável e reenviável.
- `ERROR`: editável e reenviável.
- `APPROVED`: visível, somente leitura e não reenviável.

## 9. Backlog

### Épico 1 — Fundação

- Criar Next.js com TypeScript.
- Configurar Tailwind, ESLint e Prettier.
- Criar Dockerfile, Docker Compose e GitLab CI.

### Épico 2 — Autenticação

- Configurar Auth.js com Microsoft Entra ID.
- Adicionar roles no JWT/session.
- Proteger rotas privadas.

### Épico 3 — Wizard de solicitação

- Criar seleção de tipo.
- Criar schemas Zod por checklist.
- Criar validações condicionais.
- Implementar rascunho automático.

### Épico 4 — Upload e revisão

- Criar componente de upload.
- Validar formatos e 10 MB.
- Exibir revisão final.
- Montar payload multipart.

### Épico 5 — Consulta e histórico

- Criar lista de solicitações.
- Criar filtros.
- Criar detalhe com abas.
- Criar histórico de validações.

### Épico 6 — DEJUR/ADMIN

- Criar tela de aprovadas.
- Criar filtros administrativos.
- Criar relatório estruturado.
- Criar download de documentos.

### Épico 7 — Mocks e qualidade

- Criar MSW.
- Criar mock API server.
- Criar Postman collection.
- Criar OpenAPI.
- Criar testes unitários e E2E.

## 10. Definition of Done

- `npm run type-check` sem erro.
- `npm run lint` sem erro.
- `npm run test` passando.
- `npm run test:e2e` passando nos fluxos críticos.
- `npm run build` gerando build.
- OpenAPI e Postman atualizados.
- Docker Compose executando frontend + mock backend.
