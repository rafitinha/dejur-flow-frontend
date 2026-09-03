# Validador de Ações Judiciais — Front-end Next.js

[![Release](https://img.shields.io/badge/release-v1.0.0-blue)](https://example.com)
[![Build](https://img.shields.io/badge/build-passing-success)](https://example.com)
[![License](https://img.shields.io/badge/license-proprietary-lightgrey)](https://example.com)
[![Node.js 22](https://img.shields.io/badge/Node.js-22.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Microsoft Entra ID](https://img.shields.io/badge/Microsoft%20Entra%20ID-0078D4?logo=microsoft&logoColor=white)](https://www.microsoft.com/en-us/security/business/identity/microsoft-entra)

Aplicação web em **Next.js + TypeScript + Tailwind CSS** para criação, validação e acompanhamento de solicitações judiciais com auxílio de IA, checklist estruturado, trilha de auditoria e fluxos de aprovação.

## Stack principal

- **Framework:** Next.js
- **Autenticação:** NextAuth + Microsoft Entra ID (Azure AD / Entra ID)
- **UI:** React + TypeScript + Tailwind CSS
- **Arquitetura de dados:** consumo de API REST com autenticação via token JWT/Bearer
- **Deploy:** Docker + GitLab CI/CD em servidor Linux
- **Ambiente de infra:** servidor `GEQD066` com runner `gitlab-runner`/shell

## Objetivo da aplicação

Permitir que usuários autorizados criem, validem e acompanhem solicitações judiciais com regras de negócio, documentos anexados, validação por IA e controle de revisão/aprovação.

## Funcionalidades

- Login corporativo com Microsoft Entra ID
- Autenticação via NextAuth com provider `microsoft-entra-id`
- Controle de roles e grupos do Microsoft Entra
- Fluxo de criação e edição de solicitação judicial
- Checklist de tipos:
  - Recuperação de Vasilhames
  - Cobrança de Títulos
  - Cobrança de Multa Contratual
- Upload de documentos com validação de extensão e limite de tamanho
- Visualização e exportação de dados de solicitação
- Dashboard executivo com indicadores operacionais
- UI premium com design sustentável e estilização em Tailwind

## Ambientes e URLs

| Ambiente        | URL                                | Finalidade                  |
| --------------- | ---------------------------------- | --------------------------- |
| Desenvolvimento | `https://dejurflow-dev.geq.com.br` | ambiente de desenvolvimento |
| Homologação     | `https://dejurflow-hmg.geq.com.br` | ambiente de homologação     |
| Produção        | `https://dejurflow.geq.com.br`     | ambiente de produção        |

## Ambiente de desenvolvimento

Servidor: **GEQD066**

Esse ambiente é o ponto de publicação do desenvolvimento e da infraestrutura que executa o runner GitLab para o deploy automatizado.

## Integração Microsoft Entra ID

Foi utilizada a aplicação registrada no Microsoft Entra ID com os dados abaixo:

- **Display name:** `GEQ_DejurFlow`
- **Application (client) ID:** `7c16ab2b-0c51-48c3-8ab5-b3421f1a644f`
- **Object ID:** `b9600cf9-b894-4f1a-99df-c911a91cf08e`
- **Directory (tenant) ID:** `6a8be92d-525c-4849-8ce7-35f812b77a5d`

Grupo mapeado para permissões administrativas:

- **Nome do grupo:** `GEQ_NIIA_DEJUR_FLOW_ADM`
- **ID do grupo:** `aba73bba-18c4-4d44-93ce-757f3808d357`

As roles associadas ao grupo e ao app são:

- `Type.Writer`
- `Type.Admin`
- `Type.Reader`

## Processo de integração / ticket / demanda

- **RITM de criação da configuração:** `RITM0233180`
- **RITM da URL DNS / infraestrutura:** `RITM0233174`

## GitLab CI/CD / deploy contínuo

A integração de deploy é executada na branch:

- `ci/parallel-process`

O pipeline roda no servidor **GEQD066** via runner shell, com container da aplicação e imagem:

- **Container:** `dejur-flow-front`
- **Imagem:** `niiadev/dejur-flow-front`

O fluxo de deploy foi estruturado para executar a build da imagem Docker, publicar no registry e atualizar o container no host Linux de destino.

## Como executar localmente

```bash
cp .env.example .env
npm install
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

## Mock API local

```bash
npm run mock:api
```

A API mock fica em:

```txt
http://localhost:8080
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## Validação e testes

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

## Regras de negócio / features

### Cadastro de Entidades

No cadastro de entidades, o sistema utiliza serviços externos públicos para enriquecer os dados da empresa a partir do CNPJ e acelerar o preenchimento inicial do formulário. A ordem de consulta é:

1. BrasilAPI
2. ReceitaWS
3. CNPJ.ws

Esses serviços são usados para preencher campos como razão social, nome fantasia, situação cadastral, endereço, bairro, cidade, UF e CEP. O objetivo é reduzir o esforço manual do usuário, mas a consulta não é considerada fonte única de verdade.

### APIs externas utilizadas

As APIs públicas acima são consumidas no fluxo de entidade para compor automaticamente o cadastro. Elas podem não trazer todos os dados completos ou totalmente atualizados no momento da consulta, dependendo da disponibilidade do provedor, do estado cadastral da empresa e da qualidade dos dados públicos disponíveis.

Além da busca por CNPJ, o sistema também utiliza uma API pública para consulta de CEP no cadastro de endereço. A origem principal utilizada é o ViaCEP, com fallback para o BrasilAPI quando necessário.

Exemplos de consultas públicas:

```txt
BrasilAPI - CNPJ
https://brasilapi.com.br/api/cnpj/v1/12345678000199

ReceitaWS - CNPJ
https://receitaws.com.br/v1/cnpj/12345678000199

CNPJ.ws - CNPJ
https://publica.cnpj.ws/cnpj/12345678000199

ViaCEP - CEP
https://viacep.com.br/ws/01001000/json/
```

Em cenários de resposta incompleta, indisponível, parcial ou inconsistente, o usuário pode continuar preenchendo os dados manualmente. O sistema também preserva as informações já digitadas pelo usuário quando a consulta pública não retorna dados suficientes ou válidos.

### Observações importantes sobre APIs públicas

- São serviços externos e públicos, portanto podem sofrer indisponibilidade, latência ou limitação de acesso.
- Nem sempre retornam todos os campos completos ou atualizados no momento da consulta.
- Dados cadastrais públicos podem diferir do registro oficial ou estar desatualizados.
- O preenchimento automático é um facilitador, e não substitui a revisão humana e a validação final do backend.
- O cadastro manual permanece como fallback obrigatório quando a resposta externa não for confiável ou suficiente.
- Como são fontes externas, podem gerar interrupções momentâneas ou indisponibilidade do serviço em qualquer instante.

## Regras de upload

- Extensões permitidas: `.pdf`, `.doc`, `.docx`, `.png`, `.jpg`, `.jpeg`
- Tamanho total máximo por solicitação: **10 MB**
- Todo arquivo obrigatório deve possuir arquivo associado
- Validação deve acontecer também no backend para garantir integridade e segurança

## Número da requisição

Formato esperado do backend:

```txt
REQ-AAAA-MM-DD-NNNNNN
Exemplo: REQ-2026-07-03-000001
```

## Exemplo de payload de solicitação

```json
{
  "requestId": "REQ-2026-07-03-000001",
  "status": "NEEDS_CORRECTION",
  "checklistType": "COBRANCA_TITULOS",
  "checklistDetails": {
    "titleType": "TESTE",
    "titleNumber": "12132",
    "guarantor": "Yoewdwewe",
    "otherGuarantees": "Yo e Nosoutros"
  },
  "createdBy": {
    "name": "Maria Silva",
    "email": "maria.silva@empresa.com"
  },
  "company": {
    "name": "Empresa Credora SA",
    "cnpj": "24265750000153",
    "uf": "SP",
    "city": "Sao Paulo"
  },
  "debtor": {
    "name": "Distribuidora Exemplo LTDA",
    "cnpj": "17409361000199",
    "uf": "RJ",
    "city": "Rio de Janeiro",
    "debtorAddress": "Rua Oliveira Rosas, Nª 1212 Santana,PE",
    "addressConfirmedBy": "Fulano de Cicrano",
    "addressConfirmedByRole": "Gerente",
    "addressConfirmedByDate": "2026-06-30"
  },
  "financial": {
    "amount": 152340.55,
    "currency": "BRL",
    "dueDate": "2026-06-30",
    "index": "IPCA"
  },
  "agreementAttempts": [
    {
      "date": "2026-06-15",
      "channel": "email",
      "result": "sem resposta"
    }
  ],
  "factsSummary": "Inadimplencia superior a 90 dias com notificacoes enviadas.",
  "opinion": {
    "recommendedAction": "Ajuizamento"
  },
  "documents": [
    {
      "name": "contrato.pdf",
      "type": "CONTRATO",
      "size": "245760",
      "uploadedAt": "2026-06-15",
      "documentId": "007"
    },
    {
      "name": "contrato2.pdf",
      "type": "CONTRATO",
      "size": "245760",
      "uploadedAt": "2026-06-15",
      "downloadUrl": "http://localhost:8080/mock-download/contrato.pdf",
      "documentId": "008"
    }
  ],
  "clientValidation": {
    "approvedByClient": true
  },
  "history": [
    {
      "at": "2026-07-03T14:20:00Z",
      "from": "DRAFT",
      "to": "SUBMITTED"
    }
  ],
  "llmResult": {
    "requestId": "REQ-2026-07-03-000001",
    "status": "NEEDS_CORRECTION",
    "score": 0.78,
    "summary": "Faltam anexos comprobatórios.",
    "structuredReport": {},
    "missingFields": [],
    "missingDocuments": ["comprovante_entrega"],
    "inconsistencies": [],
    "recommendations": ["Anexar comprovante de entrega assinado."],
    "canResubmit": true,
    "reviewedAt": "2026-07-03T15:05:00Z"
  }
}
```

## Observação de segurança

O front-end controla UX e visibilidade de menus, mas o backend deve validar permissões, ownership, status, acesso aos arquivos e escopo do usuário autenticado.

## Variáveis de ambiente esperadas

Essas variáveis são usadas no projeto e devem estar disponíveis no ambiente de execução:

```bash
NEXT_PUBLIC_APP_NAME="Validador de Ações Judiciais"
NEXT_PUBLIC_BACKEND_URL="http://localhost:8080"
NEXT_PUBLIC_API_BASE_URL="https://<api-base-url>"
NEXT_PUBLIC_MOCK_API="true"
NEXT_PUBLIC_ALLOWED_FILE_EXTENSIONS="pdf,doc,docx,png,jpg,jpeg"
NEXT_PUBLIC_MAX_TOTAL_UPLOAD_MB="10"
NEXT_PUBLIC_ENABLE_AUTH_GUARD="true"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<valor-secreto>"
ENABLE_AUTH_GUARD="true"
AUTH_MICROSOFT_ENTRA_ID_ID="<client-id>"
AUTH_MICROSOFT_ENTRA_ID_SECRET="<client-secret>"
AUTH_MICROSOFT_ENTRA_TENANT_ID="<tenant-id>"
AUTH_MICROSOFT_ENTRA_SCOPE="openid profile email offline_access https://graph.microsoft.com/User.Read"
AUTH_ENTRA_GROUP_DEJUR=""
AUTH_ENTRA_GROUP_ADMIN="aba73bba-18c4-4d44-93ce-757f3808d357"
```

## Observações finais

- O uso do Microsoft Entra ID foi implementado via provider Azure AD do NextAuth.
- A navegação e a UI fazem parte do front-end, porém o backend continua sendo o responsável pela validação final de permissões e dados sensíveis.
- Em produção, o deploy é centralizado no servidor `GEQD066`, com runner shell e imagem Docker `niiadev/dejur-flow-front`.
