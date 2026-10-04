import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env.ts';
import { ensureRole } from './role.middleware.ts';
import { ensureOwner } from './owner.middleware.ts';
import { createEnsureAuthenticated } from './auth.middleware.ts';
import type { Request, Response, NextFunction } from 'express';
import type { Repository } from 'typeorm';
import type { User } from '../entities/user.entity.ts';

const makeRes = (): Response => ({}) as unknown as Response;
const makeNext = (): NextFunction => vi.fn() as unknown as NextFunction;

describe('ensureAuthenticated', () => {
  const signToken = (payload: object, secret: string, expiresIn: string) =>
    jwt.sign(payload, secret, { expiresIn: expiresIn as never });

  const activeUser = { id: 'u1', name: 'Alice', role: 'user', active: true } as unknown as User;
  const inactiveUser = { id: 'u2', name: 'Bob', role: 'user', active: false } as unknown as User;

  const cookieTokenFor = (payload: object) => signToken(payload, env.JWT_SECRET, '1d');
  const bearerTokenFor = (payload: object) => signToken(payload, env.JWT_SECRET, '1d');

  const makeRepo = (user: unknown) =>
    ({ findOneBy: vi.fn().mockResolvedValue(user) }) as unknown as Repository<User>;

  it('rejects sem token (401)', async () => {
    const repo = makeRepo(activeUser);
    const fn = createEnsureAuthenticated(repo);
    const req = {} as Request;
    await expect(fn(req, makeRes(), makeNext())).rejects.toThrow(
      expect.objectContaining({ statusCode: 401 })
    );
    expect(repo.findOneBy).not.toHaveBeenCalled();
  });

  it('rejects token inválido (401) sem consultar o banco', async () => {
    const repo = makeRepo(activeUser);
    const fn = createEnsureAuthenticated(repo);
    const req = { cookies: { accessToken: 'lixo' } } as unknown as Request;
    await expect(fn(req, makeRes(), makeNext())).rejects.toThrow(
      expect.objectContaining({ statusCode: 401 })
    );
    expect(repo.findOneBy).not.toHaveBeenCalled();
  });

  it('rejects token de usuário inativo (401)', async () => {
    const repo = makeRepo(inactiveUser);
    const fn = createEnsureAuthenticated(repo);
    const token = cookieTokenFor({ id: 'u2', name: 'Bob', role: 'user' });
    const req = { cookies: { accessToken: token } } as unknown as Request;
    await expect(fn(req, makeRes(), makeNext())).rejects.toThrow(
      expect.objectContaining({ statusCode: 401, message: 'Usuário inativo ou inexistente' })
    );
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'u2' });
  });

  it('rejects usuário removido/inexistente (401)', async () => {
    const repo = makeRepo(null);
    const fn = createEnsureAuthenticated(repo);
    const token = cookieTokenFor({ id: 'ux', name: 'Joo', role: 'user' });
    const req = { cookies: { accessToken: token } } as unknown as Request;
    await expect(fn(req, makeRes(), makeNext())).rejects.toThrow(
      expect.objectContaining({ statusCode: 401, message: 'Usuário inativo ou inexistente' })
    );
  });

  it('accepts token via cookie (usuário ativo)', async () => {
    const repo = makeRepo(activeUser);
    const fn = createEnsureAuthenticated(repo);
    const token = cookieTokenFor({ id: 'u1', name: 'Alice', role: 'user' });
    const req = { cookies: { accessToken: token } } as unknown as Request;
    const next = makeNext();
    await fn(req, makeRes(), next);
    expect(next).toHaveBeenCalled();
    expect((req as never as Record<string, unknown>).user).toEqual({
      id: 'u1',
      name: 'Alice',
      role: 'user',
    });
  });

  it('accepts token via Bearer (usuário ativo)', async () => {
    const repo = makeRepo(activeUser);
    const fn = createEnsureAuthenticated(repo);
    const token = bearerTokenFor({ id: 'u1', name: 'Alice', role: 'user' });
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as Request;
    const next = makeNext();
    await fn(req, makeRes(), next);
    expect(next).toHaveBeenCalled();
  });
});

describe('ensureRole', () => {
  it('rejects unauthenticated user', () => {
    const req = { user: undefined } as unknown as Request;
    const fn = ensureRole(['admin']);
    expect(() => fn(req, makeRes(), makeNext())).toThrow(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it('rejects insufficient role', () => {
    const req = { user: { id: '1', name: 'Alice', role: 'user' } } as unknown as Request;
    const fn = ensureRole(['admin']);
    expect(() => fn(req, makeRes(), makeNext())).toThrow(
      expect.objectContaining({ statusCode: 403 })
    );
  });

  it('allows permitted role', () => {
    const req = { user: { id: '1', name: 'Bob', role: 'admin' } } as unknown as Request;
    const next = makeNext();
    const fn = ensureRole(['admin']);
    fn(req, makeRes(), next);
    expect(next).toHaveBeenCalled();
  });
});

describe('ensureOwner', () => {
  it('rejects unauthenticated user', () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const fn = ensureOwner(['user']);
    expect(() => fn(req, makeRes(), makeNext())).toThrow(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it('allows admin to access any id', () => {
    const req = {
      user: { id: 'admin-1', role: 'admin', name: 'Adm' },
      params: { id: 'other-id' },
    } as unknown as Request;
    const next = makeNext();
    ensureOwner(['user'])(req, makeRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('allows user to access own id', () => {
    const req = {
      user: { id: '1', role: 'user', name: 'Alice' },
      params: { id: '1' },
    } as unknown as Request;
    const next = makeNext();
    ensureOwner(['user'])(req, makeRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects user accessing other id', () => {
    const req = {
      user: { id: '1', role: 'user', name: 'Alice' },
      params: { id: '2' },
    } as unknown as Request;
    const fn = ensureOwner(['user']);
    expect(() => fn(req, makeRes(), makeNext())).toThrow(
      expect.objectContaining({ statusCode: 403 })
    );
  });
});
