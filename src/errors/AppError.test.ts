import { describe, it, expect } from 'vitest';
import { AppError } from './AppError.ts';

describe('AppError', () => {
  it('é instância de Error', () => {
    expect(new AppError('msg', 400)).toBeInstanceOf(Error);
  });

  it('tem name igual a AppError', () => {
    expect(new AppError('msg', 400).name).toBe('AppError');
  });

  it('preserva message e statusCode', () => {
    const error = new AppError('Recurso não encontrado', 404);
    expect(error.message).toBe('Recurso não encontrado');
    expect(error.statusCode).toBe(404);
  });

  it('usa 400 como statusCode padrão', () => {
    expect(new AppError('Entrada inválida').statusCode).toBe(400);
  });

  it('tem stack trace com o ponto de lançamento', () => {
    const error = new AppError('msg', 400);
    expect(typeof error.stack).toBe('string');
    expect(error.stack).toContain('AppError');
    expect(error.stack).toContain('msg');
  });

  it('é capturável como Error e serializa message e statusCode', () => {
    try {
      throw new AppError('Falha simulada', 409);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(409);
      expect((error as Error).message).toBe('Falha simulada');
    }
  });
});
