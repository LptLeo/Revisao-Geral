import { describe, it, expect, vi } from 'vitest';
import { ensureRole } from './role.middleware.ts';
import { ensureOwner } from './owner.middleware.ts';
import type { Request, Response, NextFunction } from 'express';

const makeRes = (): Response => ({}) as unknown as Response;
const makeNext = (): NextFunction => vi.fn() as unknown as NextFunction;

describe('ensureRole', () => {
  it('rejects unauthenticated user', () => {
    const req = { user: undefined } as unknown as Request;
    const fn = ensureRole(['admin']);
    expect(() => fn(req, makeRes(), makeNext())).toThrowError(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it('rejects insufficient role', () => {
    const req = { user: { id: '1', name: 'Alice', role: 'user' } } as unknown as Request;
    const fn = ensureRole(['admin']);
    expect(() => fn(req, makeRes(), makeNext())).toThrowError(
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
    expect(() => fn(req, makeRes(), makeNext())).toThrowError(
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
    expect(() => fn(req, makeRes(), makeNext())).toThrowError(
      expect.objectContaining({ statusCode: 403 })
    );
  });
});
