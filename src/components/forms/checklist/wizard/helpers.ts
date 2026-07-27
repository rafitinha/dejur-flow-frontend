import { z } from 'zod';
import { getStates } from '@brazilian-utils/brazilian-utils';

export const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

export const stateOptions = getStates();
export const stateCodeSet: Set<string> = new Set(
  stateOptions.map((state) => state.code),
);

export function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function toDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function toMoneyMask(value: string) {
  const normalized = value.replace(/[^\d,]/g, '');
  const [integer, decimal] = normalized.split(',');
  if (!decimal) return integer;
  return `${integer},${decimal.slice(0, 2)}`;
}

export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function resolveStateCodeFromInput(input: string) {
  const query = normalizeText(input);
  if (!query) return '';

  const state = stateOptions.find((item) => {
    const byCode = normalizeText(item.code) === query;
    const byName = normalizeText(item.name) === query;
    return byCode || byName;
  });

  return state?.code ?? input.toUpperCase().slice(0, 2);
}

export function isValidStateCode(
  value: string,
): value is (typeof stateOptions)[number]['code'] {
  return stateCodeSet.has(value);
}

export function getZodFieldErrors(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path.join('.');
    if (key) acc[key] = issue.message;
    return acc;
  }, {});
}
