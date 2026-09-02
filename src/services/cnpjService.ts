import { isValidCnpj } from '@/lib/utils/cnpj';

export type CnpjProvider = 'brasilapi' | 'receitaws' | 'cnpjws';

export type CnpjLookupCode =
  | 'CNPJ_INVALIDO'
  | 'CNPJ_NAO_ENCONTRADO'
  | 'LIMITE_EXCEDIDO'
  | 'SERVICO_INDISPONIVEL'
  | 'TIMEOUT'
  | 'ERRO_DESCONHECIDO';

export type DadosEmpresa = {
  razaoSocial: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  cep: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  uf: string;
  fonte: CnpjProvider;
};

export class CnpjLookupError extends Error {
  code: CnpjLookupCode;

  constructor(code: CnpjLookupCode, message: string) {
    super(message);
    this.name = 'CnpjLookupError';
    this.code = code;
  }
}

const PROVIDER_TIMEOUT_MS = 10000;

function normalizarCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

export function mergeCompanyData<
  T extends Record<string, string | null | undefined>,
>(currentValues: T, nextValues: Partial<T>): T {
  const merged = { ...currentValues };

  Object.entries(nextValues).forEach(([key, value]) => {
    const nextValue = typeof value === 'string' ? value.trim() : '';
    if (nextValue) {
      merged[key as keyof T] = nextValue as T[keyof T];
    }
  });

  return merged;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
}

function stringValue(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  return '';
}

function hasMinimalCompanyData(data: Partial<DadosEmpresa>): boolean {
  return Boolean(
    data.razaoSocial ||
    data.nomeFantasia ||
    data.situacaoCadastral ||
    data.logradouro ||
    data.cidade ||
    data.uf,
  );
}

function createFetchWithTimeout(
  url: string,
  signal?: AbortSignal,
): Promise<Response> {
  if (signal?.aborted) {
    return Promise.reject(
      new CnpjLookupError('TIMEOUT', 'Consulta de CNPJ cancelada.'),
    );
  }

  const controller = new AbortController();
  const abortFromSignal = () => controller.abort();

  if (signal) {
    signal.addEventListener('abort', abortFromSignal, { once: true });
  }

  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  return fetch(url, {
    signal: controller.signal,
    headers: {
      Accept: 'application/json',
    },
  }).finally(() => {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', abortFromSignal);
    }
  });
}

function mapResponseError(status: number): CnpjLookupError {
  switch (status) {
    case 400:
      return new CnpjLookupError('CNPJ_INVALIDO', 'Informe um CNPJ válido.');
    case 404:
      return new CnpjLookupError(
        'CNPJ_NAO_ENCONTRADO',
        'CNPJ não encontrado. Preencha os dados da empresa manualmente.',
      );
    case 408:
      return new CnpjLookupError('TIMEOUT', 'Timeout ao consultar o CNPJ.');
    case 429:
      return new CnpjLookupError(
        'LIMITE_EXCEDIDO',
        'Limite de requisições excedido. Tente novamente mais tarde.',
      );
    default:
      if (status >= 500) {
        return new CnpjLookupError(
          'SERVICO_INDISPONIVEL',
          'Não foi possível consultar o CNPJ neste momento.',
        );
      }

      return new CnpjLookupError(
        'ERRO_DESCONHECIDO',
        'Erro desconhecido ao consultar o CNPJ.',
      );
  }
}

export function mapearBrasilApi(response: unknown): DadosEmpresa {
  const source = asRecord(response);

  return {
    razaoSocial: stringValue(source.razao_social),
    nomeFantasia: stringValue(source.nome_fantasia),
    situacaoCadastral: stringValue(source.descricao_situacao_cadastral),
    cep: stringValue(source.cep),
    tipoLogradouro: stringValue(source.descricao_tipo_de_logradouro),
    logradouro: stringValue(source.logradouro),
    numero: stringValue(source.numero),
    complemento: stringValue(source.complemento),
    bairro: stringValue(source.bairro),
    cidade: stringValue(source.municipio),
    estado: stringValue(source.estado),
    uf: stringValue(source.uf),
    fonte: 'brasilapi',
  };
}

export function mapearReceitaWs(response: unknown): DadosEmpresa {
  const source = asRecord(response);

  return {
    razaoSocial: stringValue(source.nome),
    nomeFantasia: stringValue(source.fantasia),
    situacaoCadastral: stringValue(source.situacao),
    cep: stringValue(source.cep),
    tipoLogradouro: '',
    logradouro: stringValue(source.logradouro),
    numero: stringValue(source.numero),
    complemento: stringValue(source.complemento),
    bairro: stringValue(source.bairro),
    cidade: stringValue(source.municipio),
    estado: '',
    uf: stringValue(source.uf),
    fonte: 'receitaws',
  };
}

export function mapearCnpjWs(response: unknown): DadosEmpresa {
  const source = asRecord(response);
  const estabelecimento = asRecord(source.estabelecimento);
  const cidade = asRecord(estabelecimento.cidade);
  const estado = asRecord(estabelecimento.estado);

  return {
    razaoSocial: stringValue(source.razao_social),
    nomeFantasia: stringValue(estabelecimento.nome_fantasia),
    situacaoCadastral: stringValue(estabelecimento.situacao_cadastral),
    cep: stringValue(estabelecimento.cep),
    tipoLogradouro: stringValue(estabelecimento.tipo_logradouro),
    logradouro: stringValue(estabelecimento.logradouro),
    numero: stringValue(estabelecimento.numero),
    complemento: stringValue(estabelecimento.complemento),
    bairro: stringValue(estabelecimento.bairro),
    cidade: stringValue(
      cidade.nome ?? asRecord(estabelecimento.municipio).nome,
    ),
    estado: stringValue(estado.nome),
    uf: stringValue(estado.sigla ?? source.uf),
    fonte: 'cnpjws',
  };
}

export async function consultarBrasilApi(
  cnpj: string,
  signal?: AbortSignal,
): Promise<DadosEmpresa> {
  const endpoint = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
  const response = await createFetchWithTimeout(endpoint, signal).catch(
    (error) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new CnpjLookupError('TIMEOUT', 'Timeout ao consultar BrasilAPI.');
      }

      throw new CnpjLookupError(
        'SERVICO_INDISPONIVEL',
        'BrasilAPI indisponível.',
      );
    },
  );

  if (!response.ok) {
    throw mapResponseError(response.status);
  }

  const payload = await response.json().catch(() => {
    throw new CnpjLookupError(
      'ERRO_DESCONHECIDO',
      'Resposta inválida recebida da BrasilAPI.',
    );
  });

  const dados = mapearBrasilApi(payload);
  if (!hasMinimalCompanyData(dados)) {
    throw new CnpjLookupError(
      'CNPJ_NAO_ENCONTRADO',
      'CNPJ não encontrado na BrasilAPI.',
    );
  }

  return dados;
}

export async function consultarReceitaWs(
  cnpj: string,
  signal?: AbortSignal,
): Promise<DadosEmpresa> {
  const endpoint = `https://receitaws.com.br/v1/cnpj/${cnpj}`;
  const response = await createFetchWithTimeout(endpoint, signal).catch(
    (error) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new CnpjLookupError('TIMEOUT', 'Timeout ao consultar ReceitaWS.');
      }

      throw new CnpjLookupError(
        'SERVICO_INDISPONIVEL',
        'ReceitaWS indisponível.',
      );
    },
  );

  if (!response.ok) {
    throw mapResponseError(response.status);
  }

  const payload = await response.json().catch(() => {
    throw new CnpjLookupError(
      'ERRO_DESCONHECIDO',
      'Resposta inválida recebida da ReceitaWS.',
    );
  });

  if (payload?.status === 'ERROR') {
    throw new CnpjLookupError(
      'CNPJ_NAO_ENCONTRADO',
      payload?.message ?? 'CNPJ não encontrado na ReceitaWS.',
    );
  }

  const dados = mapearReceitaWs(payload);
  if (!hasMinimalCompanyData(dados)) {
    throw new CnpjLookupError(
      'CNPJ_NAO_ENCONTRADO',
      'CNPJ não encontrado na ReceitaWS.',
    );
  }

  return dados;
}

export async function consultarCnpjWs(
  cnpj: string,
  signal?: AbortSignal,
): Promise<DadosEmpresa> {
  const endpoint = `https://publica.cnpj.ws/cnpj/${cnpj}`;
  const response = await createFetchWithTimeout(endpoint, signal).catch(
    (error) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new CnpjLookupError('TIMEOUT', 'Timeout ao consultar CNPJ.ws.');
      }

      throw new CnpjLookupError(
        'SERVICO_INDISPONIVEL',
        'CNPJ.ws indisponível.',
      );
    },
  );

  if (!response.ok) {
    throw mapResponseError(response.status);
  }

  const payload = await response.json().catch(() => {
    throw new CnpjLookupError(
      'ERRO_DESCONHECIDO',
      'Resposta inválida recebida da CNPJ.ws.',
    );
  });

  const dados = mapearCnpjWs(payload);
  if (!hasMinimalCompanyData(dados)) {
    throw new CnpjLookupError(
      'CNPJ_NAO_ENCONTRADO',
      'CNPJ não encontrado na CNPJ.ws.',
    );
  }

  return dados;
}

export async function consultarCnpj(
  cnpj: string,
  signal?: AbortSignal,
): Promise<DadosEmpresa> {
  const normalized = normalizarCnpj(cnpj);

  if (normalized.length !== 14 || !isValidCnpj(normalized)) {
    throw new CnpjLookupError('CNPJ_INVALIDO', 'Informe um CNPJ válido.');
  }

  const providers = [
    () => consultarBrasilApi(normalized, signal),
    () => consultarReceitaWs(normalized, signal),
    () => consultarCnpjWs(normalized, signal),
  ];

  let lastError: CnpjLookupError | null = null;

  for (const provider of providers) {
    try {
      return await provider();
    } catch (error) {
      if (error instanceof CnpjLookupError) {
        if (error.code === 'CNPJ_INVALIDO') {
          throw error;
        }

        lastError = error;
        continue;
      }

      lastError = new CnpjLookupError(
        'ERRO_DESCONHECIDO',
        'Erro desconhecido ao consultar CNPJ.',
      );
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new CnpjLookupError(
    'CNPJ_NAO_ENCONTRADO',
    'CNPJ não encontrado. Preencha os dados da empresa manualmente.',
  );
}
