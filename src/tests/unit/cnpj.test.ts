import { describe, expect, it } from 'vitest';
import { isValidCnpj } from '@/lib/utils/cnpj';
describe('isValidCnpj', () => {
  it('aceita CNPJ válido formatado', () => expect(isValidCnpj('11.222.333/0001-81')).toBe(true));
  it('aceita CNPJ válido sem formato', () => expect(isValidCnpj('11222333000181')).toBe(true));
  it('rejeita dígito errado', () => expect(isValidCnpj('11.222.333/0001-82')).toBe(false));
  it('rejeita dígitos repetidos', () => expect(isValidCnpj('11.111.111/1111-11')).toBe(false));
  it('rejeita tamanho incorreto', () => expect(isValidCnpj('123')).toBe(false));
});
