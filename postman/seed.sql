-- ============================================================================
-- Seed de dados fixos para os testes de Postman
-- ============================================================================
-- Cria contas com IDs fixos e senhas conhecidas para permitir os cenários
-- que dependem de um administrador e de uma conta desativada.
--
-- Credenciais:
--   admin@test.com   / Admin@123   (role: admin, active: true)
--   admin2@test.com  / Admin@123   (role: admin, active: true)
--   inactive@test.com/ Senha@123   (role: user,  active: false)
--
-- Como rodar (container do Postgres em execução):
--   docker exec -i postgres-db psql -U lptleo11 -d express-revisao-db < postman/seed.sql
--
-- É idempotente: pode ser executado quantas vezes quiser.
-- Os hashes abaixo foram gerados com bcrypt (custo 12).
-- ============================================================================

INSERT INTO "user" (id, name, email, password, role, active, "createdAt", "updatedAt")
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Administrador',
    'admin@test.com',
    '$2b$12$NIxbu1BcdOXujdA7ssV98eqQE92MbgFpQn2gcdCUfeptGae5ERoKO',
    'admin',
    true,
    now(),
    now()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Administrador Secundário',
    'admin2@test.com',
    '$2b$12$NIxbu1BcdOXujdA7ssV98eqQE92MbgFpQn2gcdCUfeptGae5ERoKO',
    'admin',
    true,
    now(),
    now()
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Conta Inativa',
    'inactive@test.com',
    '$2b$12$RJtQtto8TQI8B8RpZNcJpOg5t4bi5h0nRVpTHWmO2xyAuAei2VCTq',
    'user',
    false,
    now(),
    now()
  )
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  "updatedAt" = now();
