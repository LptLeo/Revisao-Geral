# Loja Virtual

Loja virtual full-stack construída para praticar **múltiplos estágios de lógica**: de dados relacionais e autenticação até regras de negócio complexas e transações sob concorrência.

## Stack

| Camada     | Tecnologia                                          |
| ---------- | --------------------------------------------------- |
| Backend    | Express 5, TypeScript (ESM), tsx                    |
| ORM        | TypeORM + PostgreSQL (Docker)                       |
| Validação  | Zod 4                                               |
| Frontend   | *(a definir: React + Vite?)*                        |
| Autenticação | *(a definir: JWT?)*                               |

## Páginas

- **Página inicial (Catálogo)** — listagem de produtos com filtros e paginação
- **Página do Produto** — detalhes, variações e estoque
- **Página de Login / Registro** — autenticação de usuário
- **Página do Usuário / Configurações / Preferências** — perfil, endereços e histórico de pedidos
- **Página de Carrinho** — itens, cupons e cálculo de valores
- **Página de Pagamento** — fechamento do pedido

## Estágios de lógica (roadmap)

### 1. Dados relacionais (TypeORM)

Entidades com relacionamentos reais: `User` → `Order` → `OrderItem` → `Product`, endereços de entrega, estoque, categorias. Migrations + seed para desenvolvimento.

### 2. Autenticação e autorização

Registro/login com hash de senha, geração e validação de token, middlewares de proteção de rota e **roles** (cliente vs. administrador).

### 3. Validação avançada (Zod 4)

Schemas compostos e reutilizáveis, refinements `superRefine` para regras condicionais (cupom expirado, combinação de campos), sanitização e mensagens de erro customizadas — com o padrão já usado no `env.ts`.

### 4. Regras de negócio complexas

Carrinho com cálculo de totais, cupom de desconto, frete por CEP, impostos e regra de disponibilidade de estoque no momento do checkout.

### 5. Transações e concorrência

Criação de pedido atômica (reserva de estoque + criação da ordem + esvaziamento do carrinho em uma única transação), com bloqueio de linha (`FOR UPDATE`) para impedir venda além do estoque quando dois pedidos disputam o mesmo produto.

## Estrutura planejada

```
src/
├── config/       # env (Zod) e AppDataSource
├── entities/     # TypeORM entities
├── controllers/  # camada HTTP (req/res)
├── services/     # regras de negócio
├── middleware/   # auth, error handler
├── routes/       # roteamento
├── schemas/      # validação Zod
└── utils/

client/           # frontend (a definir)
```

## Status

- [x] Validação de variáveis de ambiente com Zod 4 (`src/config/env.ts`)
- [x] TypeORM configurado com PostgreSQL no Docker
- [ ] Estágio 1 — Dados relacionais
- [ ] Estágio 2 — Autenticação e autorização
- [ ] Estágio 3 — Validação avançada
- [ ] Estágio 4 — Regras de negócio complexas
- [ ] Estágio 5 — Transações e concorrência