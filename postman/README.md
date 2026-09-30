# Testes de Aceite (Postman / Newman)

Suíte de testes BDD cobrindo as issues **US01 a US07** da API.

## Arquivos

| Arquivo                                         | Descrição                                                             |
| :---------------------------------------------- | :-------------------------------------------------------------------- |
| `Express-Revisao-Geral.postman_collection.json` | Coleção única com um folder por issue (+ um folder de `Setup`).       |
| `local.postman_environment.json`                | Environment com `base_url`, credenciais de admin e IDs fixos do seed. |
| `seed.sql`                                      | Cria as contas de admin e a conta desativada usadas nos cenários.     |

## Pré-requisitos

1. Banco no ar e migrado:
   ```bash
   docker compose up -d db
   ```
2. Servidor rodando (`npm run dev`) em `http://localhost:3000`.
3. Dados de seed inseridos **uma vez** (idempotente):
   ```bash
   docker exec -i postgres-db psql -U lptleo11 -d express-revisao-db < postman/seed.sql
   ```

## Como rodar

### Opção A — Postman (interface)

1. Importe **os dois** arquivos JSON (`collection` e `environment`).
2. Selecione o environment **"Express Revisão Geral - Local"** no canto superior direito.
3. Abra a coleção → **Run** (Collection Runner) → **Run Express Revisão Geral**.
   O folder `00 · Setup` roda primeiro e popula tokens/IDs automaticamente.

### Opção B — Newman (linha de comando)

```bash
npx newman run postman/Express-Revisao-Geral.postman_collection.json \
  -e postman/local.postman_environment.json
```

## Credenciais do seed

| Conta            | E-mail              | Senha       | Role  | Active |
| :--------------- | :------------------ | :---------- | :---- | :----- |
| Admin            | `admin@test.com`    | `Admin@123` | admin | true   |
| Admin secundário | `admin2@test.com`   | `Admin@123` | admin | true   |
| Conta desativada | `inactive@test.com` | `Senha@123` | user  | false  |

> Os usuários `user` dos testes (Alice/Bruno) são criados a cada execução com e-mails únicos.

## Variáveis

Tudo que muda em tempo de execução (tokens, IDs, e-mails) fica nas **collection variables**.
O environment permite sobrescrever `base_url`, credenciais de admin e os IDs fixos do seed.

## Cobertura

| Folder                | Endpoint(s)                               |
| :-------------------- | :---------------------------------------- |
| `00 · Setup`          | Registro + login de `user`/`admin`        |
| `US01 · Registro`     | `POST /auth/register`                     |
| `US02 · Autenticação` | `POST /auth/login`, `/refresh`, `/logout` |
| `US03 · Consulta`     | `GET /user/:id`                           |
| `US04 · Atualização`  | `PUT /user/:id`                           |
| `US05 · Listagem`     | `GET /user`                               |
| `US06 · Soft Delete`  | `DELETE /user/:id`                        |
| `US07 · RBAC`         | `ensureAuthenticated` / `ensureRole`      |
