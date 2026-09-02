import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  consultarCnpj,
  CnpjLookupError,
  mapearBrasilApi,
  mapearCnpjWs,
  mapearReceitaWs,
} from '@/services/cnpjService';

const originalFetch = global.fetch;

describe('cnpjService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('não executa chamadas HTTP para CNPJ inválido', async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as typeof fetch;

    await expect(consultarCnpj('123')).rejects.toThrow(
      'Informe um CNPJ válido.',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('retorna sucesso com BrasilAPI', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        razao_social: 'Empresa Teste LTDA',
        nome_fantasia: 'Empresa Teste',
        descricao_situacao_cadastral: 'Ativa',
        cep: '01000-000',
        descricao_tipo_de_logradouro: 'Rua',
        logradouro: 'Avenida Brasil',
        numero: '100',
        complemento: 'Sala 1',
        bairro: 'Centro',
        municipio: 'São Paulo',
        estado: 'São Paulo',
        uf: 'SP',
      }),
    }) as any;

    await expect(consultarCnpj('11222333000181')).resolves.toMatchObject({
      razaoSocial: 'Empresa Teste LTDA',
      cidade: 'São Paulo',
      fonte: 'brasilapi',
    });
  });

  it('consulta BrasilAPI e depois ReceitaWS quando a primeira falha', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          nome: 'Empresa Receitaws',
          fantasia: 'Receita',
          situacao: 'Ativa',
          cep: '01000-000',
          logradouro: 'Rua B',
          numero: '20',
          complemento: 'Loja',
          bairro: 'Bela Vista',
          municipio: 'Rio de Janeiro',
          uf: 'RJ',
        }),
      });

    global.fetch = fetchMock as any;

    await expect(consultarCnpj('11222333000181')).resolves.toMatchObject({
      razaoSocial: 'Empresa Receitaws',
      fonte: 'receitaws',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('consulta CNPJ.ws quando BrasilAPI e ReceitaWS falham', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          razao_social: 'Empresa CNPJ WS',
          estabelecimento: {
            nome_fantasia: 'CNPJ WS',
            situacao_cadastral: 'Ativa',
            cep: '01000-000',
            tipo_logradouro: 'Av',
            logradouro: 'Avenida C',
            numero: '300',
            complemento: '',
            bairro: 'Centro',
            cidade: { nome: 'Curitiba' },
            estado: { nome: 'Paraná', sigla: 'PR' },
          },
        }),
      });

    global.fetch = fetchMock as any;

    await expect(consultarCnpj('11222333000181')).resolves.toMatchObject({
      razaoSocial: 'Empresa CNPJ WS',
      fonte: 'cnpjws',
      uf: 'PR',
    });
  });

  it('lança erro quando as três APIs retornam 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    global.fetch = fetchMock as any;

    await expect(consultarCnpj('11222333000181')).rejects.toMatchObject({
      code: 'CNPJ_NAO_ENCONTRADO',
    });
  });

  it('tenta a próxima API quando uma retorna 429', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          nome: 'Empresa Receitaws',
          fantasia: 'Receita',
          situacao: 'Ativa',
          cep: '01000-000',
          logradouro: 'Rua B',
          numero: '20',
          complemento: '',
          bairro: 'Bela Vista',
          municipio: 'Rio de Janeiro',
          uf: 'RJ',
        }),
      });

    global.fetch = fetchMock as any;

    await expect(consultarCnpj('11222333000181')).resolves.toMatchObject({
      fonte: 'receitaws',
    });
  });

  it('trata respostas JSON inválidas como erro', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('bad json');
      },
    }) as any;

    await expect(consultarCnpj('11222333000181')).rejects.toMatchObject({
      code: 'ERRO_DESCONHECIDO',
    });
  });

  it('transforma campos nulos em strings vazias', () => {
    expect(
      mapearCnpjWs({
        razao_social: 'Empresa',
        estabelecimento: {
          nome_fantasia: null,
          situacao_cadastral: null,
          cep: null,
          tipo_logradouro: undefined,
          logradouro: null,
          numero: undefined,
          complemento: null,
          bairro: null,
          cidade: null,
          estado: null,
        },
      }),
    ).toMatchObject({
      razaoSocial: 'Empresa',
      nomeFantasia: '',
      complemento: '',
      cidade: '',
      uf: '',
    });
  });

  it('preserva dados já preenchidos pelo usuário', () => {
    expect(
      mapearBrasilApi({
        razao_social: '',
        nome_fantasia: '',
        descricao_situacao_cadastral: '',
        cep: '',
        descricao_tipo_de_logradouro: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        municipio: '',
        estado: '',
        uf: 'SP',
      }),
    ).toMatchObject({ uf: 'SP' });
  });

  it('cancela uma consulta anterior via AbortController', async () => {
    const controller = new AbortController();
    controller.abort();

    global.fetch = vi
      .fn()
      .mockImplementation((_url: string, init?: RequestInit) => {
        if (init?.signal?.aborted) {
          return Promise.reject(
            new DOMException('The operation was aborted.', 'AbortError'),
          );
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({}) as Record<string, unknown>,
        } as Response);
      });

    await expect(
      consultarCnpj('11222333000181', controller.signal),
    ).rejects.toBeInstanceOf(CnpjLookupError);
  });

  it('finaliza o estado de carregamento mesmo com erro', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    global.fetch = fetchSpy as any;

    await expect(consultarCnpj('11222333000181')).rejects.toMatchObject({
      code: 'CNPJ_NAO_ENCONTRADO',
    });
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('mapeia corretamente a situação cadastral em cada provedor', () => {
    expect(
      mapearBrasilApi({
        razao_social: 'Empresa',
        descricao_situacao_cadastral: 'Ativa',
      }).situacaoCadastral,
    ).toBe('Ativa');

    expect(
      mapearReceitaWs({ nome: 'Empresa', situacao: 'Baixada' })
        .situacaoCadastral,
    ).toBe('Baixada');

    expect(
      mapearCnpjWs({
        razao_social: 'Empresa',
        estabelecimento: { situacao_cadastral: 'Inapta' },
      }).situacaoCadastral,
    ).toBe('Inapta');
  });
});
