export function isValidCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const calculate = (length: number) => {
    let factor = length - 7;
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * factor--;
      if (factor < 2) factor = 9;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return (
    calculate(12) === Number(digits[12]) && calculate(13) === Number(digits[13])
  );
}

export function formatDocument(value: string): string {
  const numbersOnly = value.replace(/\D/g, '');

  if (numbersOnly.length === 11) {
    // CPF: 000.000.000-00
    return numbersOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  if (numbersOnly.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return numbersOnly.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    );
  }

  return numbersOnly;
}

/*
export const documentUtils = {
  format: formatDocument,
};*/
