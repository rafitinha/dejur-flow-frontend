# Índice Técnico do Projeto

> Este documento é um mapa operacional do repositório para desenvolvedores e assistentes de IA.
>
> Ele não substitui o código, o OpenAPI, o Playbook ou o Style Guide.
> Em caso de divergência, o código executável e os contratos formalmente adotados devem ser verificados.

## 1. Identificação

- Projeto: Validador de Ações Judiciais
- Tipo: aplicação front-end corporativa
- Idioma da interface: português
- Framework principal: Next.js com App Router
- Linguagem: TypeScript
- Estilização: Tailwind CSS
- Autenticação prevista: Auth.js/NextAuth com Microsoft Entra ID
- Backend atual: mocks
- Backend definitivo: ainda será implementado
- Gerenciador de pacotes: verificar `package.json` e o arquivo de lock existente

## 2. Objetivo do sistema

O sistema permite criar, editar, submeter e acompanhar solicitações judiciais baseadas em checklists.

Principais tipos de checklist:

- Recuperação de Vasilhames
- Cobrança de Títulos
- Multa Contratual

A solicitação é preenchida em um Wizard de 9 etapas, enviada para validação e disponibilizada para o DEJUR somente quando aprovada.

## 3. Fontes oficiais

Antes de implementar uma alteração, consultar somente as fontes relacionadas à tarefa.

### Produto e arquitetura

- `docs/PLAYBOOK_FRONTEND.md`
  - visão do produto;
  - arquitetura esperada;
  - regras de domínio;
  - Wizard;
  - status;
  - backlog;
  - Definition of Done.

### Design system

- `docs/STYLE_GUIDE.md`
  - cores;
  - tokens semânticos;
  - tipografia;
  - espaçamento;
  - componentes;
  - temas claro e escuro;
  - iconografia;
  - acessibilidade.

### API

- `docs/openapi/openapi.json`
  - fonte dos contratos REST formalizados.

### Postman

- `docs/postman/Validador_Acoes_Judiciais.postman_collection.json`
  - exemplos de chamadas e respostas.

### Documentação técnica resumida para IA

- `docs/ai/FRONTEND_ARCHITECTURE.md`
- `docs/ai/ROUTES_AND_SCREENS.md`
- `docs/ai/DOMAIN_MODEL.md`
- `docs/ai/API_CATALOG.md`
- `docs/ai/COMPONENT_CATALOG.md`
- `docs/ai/TESTING_GUIDE.md`
- `docs/ai/DECISIONS.md`

## 4. Estrutura principal

> Esta seção deve ser atualizada depois da inspeção do repositório.
> Não adicionar caminhos que não existam no código.

### Rotas

- `src/app`
  - rotas e layouts do Next.js App Router.

- `src/app/(private)`
  - rotas que exigem autenticação.

- `src/app/(private)/solicitacoes`
  - listagem, consulta, criação e edição de solicitações.

- `src/app/(private)/solicitacoes/[requestId]/editar/page.tsx`
  - página atualmente responsável pela edição de uma solicitação.
  - verificar no código se também apresenta o modo de visualização.

### Componentes

- `src/components`
  - componentes reutilizáveis e componentes do design system.

### Funcionalidades de domínio

- `src/features`
  - regras, componentes, hooks, schemas e serviços organizados por domínio.
  - confirmar subdiretórios reais antes de documentar.

### Configurações

- `src/config`
  - schemas globais;
  - permissões;
  - roles;
  - status;
  - configurações compartilhadas.

### Bibliotecas e integrações

- `src/lib`
  - cliente HTTP;
  - formatadores;
  - helpers;
  - integração com APIs;
  - configuração de bibliotecas.

### Mocks

- Localizar os handlers MSW e registrar aqui:
  - caminho dos handlers;
  - caminho das fixtures;
  - inicialização no browser;
  - inicialização no Node/testes.

### Testes

- Localizar e registrar:
  - testes unitários;
  - testes de componentes;
  - testes de integração;
  - testes Playwright;
  - utilitários de renderização.

## 5. Fluxos principais

### Criação

1. Usuário seleciona o tipo de ação.
2. Preenche as 9 etapas do Wizard.
3. O sistema salva automaticamente como `DRAFT`.
4. O usuário revisa os dados.
5. O sistema envia metadata e arquivos.
6. A solicitação assume o status `PROCESSING`.
7. O resultado da validação determina aprovação ou necessidade de correção.

### Edição

A edição somente é permitida para:

- `DRAFT`;
- `NEEDS_CORRECTION`;
- `ERROR`.

A edição deve:

- consultar a solicitação pelo `requestId`;
- converter a resposta da API para o modelo do formulário;
- preencher o Wizard;
- preservar documentos existentes;
- identificar documentos novos;
- permitir salvar ou reenviar conforme o status.

### Visualização

A visualização deve apresentar:

- identificação;
- status;
- empresa e devedora;
- dados específicos;
- tentativas de acordo;
- valores;
- resumo dos fatos;
- parecer;
- documentos;
- resultado da validação.

### Download

O download de documento deve utilizar um endpoint ou service próprio.

Não colocar conteúdo mockado diretamente no componente visual.

## 6. Wizard

O formulário possui 9 etapas:

1. Tipo da ação.
2. Empresa e devedora.
3. Dados específicos.
4. Tentativas de acordo.
5. Valores, índices e atualização.
6. Resumo dos fatos.
7. Parecer da área responsável.
8. Upload de documentos.
9. Revisão e confirmação.

Depois de inspecionar o repositório, registrar aqui:

- componente principal do Wizard: `A_LOCALIZAR`;
- definição das etapas: `A_LOCALIZAR`;
- schemas Zod: `A_LOCALIZAR`;
- tipo principal do formulário: `A_LOCALIZAR`;
- estado global ou provider: `A_LOCALIZAR`;
- autosave: `A_LOCALIZAR`;
- mapper API para formulário: `A_LOCALIZAR`;
- mapper formulário para API: `A_LOCALIZAR`.

## 7. Status

- `DRAFT`
  - editável;
  - pode receber salvamento automático.

- `PROCESSING`
  - somente leitura;
  - não deve permitir edição.

- `NEEDS_CORRECTION`
  - editável;
  - pode ser reenviada.

- `ERROR`
  - editável;
  - pode ser reenviada.

- `APPROVED`
  - somente leitura;
  - visível para DEJUR;
  - não pode ser reenviada.

## 8. Perfis

Perfis oficiais:

- `USER`
- `DEJUR`
- `ADMIN`

Depois de inspecionar o código, registrar:

- definição dos roles: `A_LOCALIZAR`;
- configuração da sessão: `A_LOCALIZAR`;
- middleware de autenticação: `A_LOCALIZAR`;
- controle de acesso das rotas: `A_LOCALIZAR`;
- helpers de autorização: `A_LOCALIZAR`.

## 9. Contratos conhecidos

### Criar rascunho
