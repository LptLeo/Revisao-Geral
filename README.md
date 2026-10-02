# API de E-commerce

API RESTful desenvolvida com **Node.js, Express 5 e TypeScript**, focada em arquitetura em camadas, modelagem de dados relacionais e regras de negócio com controle de concorrência.

O projeto foi estruturado para simular o backend de um e-commerce em ambiente de produção, cobrindo desde autenticação segura e validação estrita de dados de entrada até operações transacionais no banco de dados.

---

## 🛠️ Tecnologias e Ferramentas

| Componente                   | Tecnologia                  | Papel na Aplicação                                                                          |
| :--------------------------- | :-------------------------- | :------------------------------------------------------------------------------------------ |
| **Runtime & Linguagem**      | Node.js (v22+) & TypeScript | Execução assíncrona, tipagem estática e suporte a ECMAScript Modules (ESM)                  |
| **Framework Web**            | Express 5                   | Criação de rotas, middlewares globais e tratamento nativo de erros assíncronos              |
| **Banco de Dados**           | PostgreSQL 18 (via Docker)  | Armazenamento relacional com suporte a transações ACID e integridade referencial            |
| **ORM**                      | TypeORM                     | Mapeamento objeto-relacional, gerenciamento de entidades e consultas ao banco               |
| **Validação de Dados**       | Zod 4                       | Validação de schema no parsing de variáveis de ambiente e DTOs das requisições              |
| **Segurança & Criptografia** | bcrypt & jsonwebtoken       | Criptografia de senhas (salt rounds) e controle de sessão via JWT (Access & Refresh Tokens) |

---

## 🏛️ Arquitetura e Estrutura do Backend

A API adota uma **Arquitetura em Camadas (Layered Architecture)** para garantir separação clara de responsabilidades, testabilidade e facilidade de manutenção:

- **Middlewares (`src/middlewares/`):** Interceptam requisições antes de chegarem ao fluxo principal. Contam com uma fábrica de validação genérica com Zod (`validateBody`), tratamento de funções assíncronas (`asyncHandler`) e um manipulador global de erros (`GlobalErrorHandler`).
- **Controllers (`src/controllers/`):** Recebem as requisições HTTP, orquestram o fluxo de entrada e devolvem a resposta formatada com o status HTTP adequado.
- **Services (`src/services/`):** Isolam todas as regras de negócio da aplicação. São independentes do framework web e conversam diretamente com a camada de persistência.
- **DTOs & Schemas (`src/dtos/`):** Definem os contratos de dados esperados pela API e garantem validação e sanitização dos dados antes de qualquer processamento.
- **Entities (`src/entities/`):** Modelagem relacional das tabelas do banco de dados utilizando decorators do TypeORM.
- **Configs (`src/configs/`):** Inicialização do DataSource do TypeORM e validação das variáveis de ambiente em tempo de inicialização (_fail-fast_).

---

## 🚀 Como Rodar o Projeto Localmente

Siga o passo a passo abaixo para executar a API na sua máquina:

### 1. Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 22 ou superior recomendada)
- [Docker e Docker Compose](https://www.docker.com/)

### 2. Clonar o repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd Express-Revisao-Geral
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no modelo abaixo:

```env
# Modo da aplicação
MODE=development

# Conexão com o Banco de Dados (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=ecommerce_db
DB_EXTERNAL_PORT=5432

# Servidor HTTP
SV_PORT=3000

# Criptografia e Autenticação (JWT)
BCRYPT_SALT=12
# As chaves secretas precisam ter no mínimo 64 caracteres
JWT_SECRET=coloque_uma_chave_secreta_muito_longa_com_mais_de_64_caracteres_aqui
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=coloque_outra_chave_secreta_muito_longa_com_mais_de_64_caracteres_aqui
JWT_REFRESH_EXPIRES_IN=7d
```

### 5. Subir o Banco de Dados com Docker

Inicie o container do PostgreSQL em segundo plano:

```bash
docker compose up -d db
```

### 6. Iniciar a API em modo de desenvolvimento

Execute o comando abaixo para iniciar o servidor com recarregamento automático (_hot-reload_):

```bash
npm run dev
```

Se tudo estiver correto, o console exibirá:

```text
Servidor rodando na porta 3000
```

---

## 📝 Padrão de Commits

Este projeto adota o padrão **[Conventional Commits](https://www.conventionalcommits.org/)** com as mensagens escritas em inglês.

### Formato

```text
<tipo>: <descrição curta>
```

### Tipos aceitos

`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

### Exemplos

```text
feat: add refresh token rotation
fix: prevent duplicate email on register
docs: update setup instructions
refactor: extract reusable email schema
```

### Validação automática

- **Local (husky):** ao commitar, o hook `commit-msg` valida a mensagem e o hook `pre-commit` roda `npm run validate-code` (testes, typecheck, lint e formatação).
- **CI:** pull requests passam por um job dedicado que valida todas as mensagens de commit do PR.

Para testar uma mensagem manualmente:

```bash
echo "feat: add something" | npm run commitlint
```

---

## 🎯 Domínios e Estágios da Aplicação

### 1. Modelo Relacional e Entidades

Mapeamento de entidades com integridade referencial estrita e chaves estrangeiras:

- `User` (clientes e administradores)
- `Address` (endereços de entrega vinculados ao usuário)
- `Category` (categorização de produtos)
- `Product` (catálogo, preços e estoque)
- `Order` & `OrderItem` (pedidos e itens associados)
- `Coupon` (regras e cupons de desconto)

### 2. Autenticação e Sessão

- Fluxo seguro de cadastro de usuários com hash de senha via `bcrypt`.
- Emissão de **Access Token** (tempo de vida curto para rotas privadas) e **Refresh Token** (tempo de vida longo para renovação de sessão).
- Sanitização automática de senhas nas respostas HTTP.

### 3. Validação Estrita e Tratamento de Erros

- Middleware genérico que intercepta o corpo da requisição (`validateBody`), descartando propriedades inesperadas e bloqueando requisições com dados incorretos.
- Tratamento centralizado de erros em `GlobalErrorHandler`, mapeando automaticamente erros de validação (`ZodError`), regras de negócio (`AppError`) e falhas não esperadas (`500`).

### 4. Testes Automatizados

- **Testes unitários** com **Vitest** (`npm test`) cobrindo o núcleo de autenticação (`AuthService`, `ensureRole`, `ensureOwner`) com mocks de repositório — sem dependência de banco real.
- **Testes de aceite (E2E)** via **Postman / Newman** na pasta `postman/` (`npm run test:e2e` — a ser implementado na TECH04).
- Integração no CI: validação roda em todo PR (`validate-code` + testes).

### 5. Regras de Negócio e Concorrência (Roadmap)

- Cálculo dinâmico de carrinho, aplicação de descontos por cupom e validações de elegibilidade.
- Fechamento de pedidos com **transações de banco de dados** e controle de concorrência com bloqueio pessimista (`pessimistic lock`), prevenindo vendas inconsistentes quando múltiplos clientes disputam as últimas unidades de estoque.
