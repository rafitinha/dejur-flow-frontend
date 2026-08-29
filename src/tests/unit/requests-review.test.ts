import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatRequestDetailsForClipboard,
  writeTextToClipboard,
} from '@/features/requests/clipboard';
import type { JudicialRequestDetail } from '@/features/requests/types';

const baseRequest: JudicialRequestDetail = {
  requestId: 'REQ-001',
  status: 'APPROVED',
  checklistType: 'RECUPERACAO_VASILHAMES',
  createdBy: { name: 'Ana', email: 'ana@geq.com' },
  company: {
    name: 'Empresa GEQ',
    cnpj: '00.000.000/0001-00',
    uf: 'CE',
    city: 'Fortaleza',
  },
  debtor: {
    name: 'Devedora Ltda',
    cnpj: '11.111.111/0001-11',
    uf: 'RJ',
    city: 'Rio de Janeiro',
  },
  financial: {
    amount: 125000,
    currency: 'BRL',
    dueDate: '2026-08-10',
  },
  agreementAttempts: [],
  factsSummary: 'Resumo de fatos\ncom quebras de linha.',
  opinion: { recommendedAction: 'Aprovar' },
  documents: [
    {
      documentId: 'doc-1',
      name: 'Contrato.pdf',
      type: 'PDF',
      size: 1500,
      uploadedAt: '2026-08-10T10:00:00.000Z',
    },
  ],
  clientValidation: { approvedByClient: true },
  history: [{ at: '2026-08-10T09:00:00.000Z', from: 'DRAFT', to: 'APPROVED' }],
  data: {
    checklistType: 'RECUPERACAO_VASILHAMES',
    data: {
      p13Quantity: 5,
      p20Quantity: 2,
      p45Quantity: 1,
      historicalAmount: '1000',
      updatedAmount: '1200',
    },
  },
};

describe('clipboard formatting', () => {
  it('monta texto estruturado com seções e valores formatados', () => {
    const text = formatRequestDetailsForClipboard(baseRequest);

    expect(text).toContain('SOLICITAÇÃO');
    expect(text).toContain('DADOS DA EMPRESA');
    expect(text).toContain('Resumo de fatos');
    expect(text).toContain('Contrato.pdf');
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
  });

  it('inclui campos separados de confirmação e valores atualizados', () => {
    const request: JudicialRequestDetail = {
      ...baseRequest,
      checklistType: 'COBRANCA_MULTA_CONTRATUAL',
      data: {
        checklistType: 'COBRANCA_MULTA_CONTRATUAL',
        data: {
          contractType: 'Prestação de serviços',
          breachedClause: 'Cláusula de inadimplência',
          firstCycleFinished: true,
          maxDiscount: '1500',
          confirmationRole: 'Diretor',
          confirmationDate: '2026-08-15',
          value: '25000,00',
          index: 'INPC',
          updatedAt: '2026-08-15',
        },
      },
    };

    const text = formatRequestDetailsForClipboard(request);

    expect(text).toContain('Cargo');
    expect(text).toContain('Diretor');
    expect(text).toContain('Data da confirmação');
    expect(text).toContain('2026-08-15');
    expect(text).toContain('Valor');
    expect(text).toContain('INPC');
    expect(text).toContain('Primeiro ciclo finalizado');
    expect(text).toContain('Sim');
  });

  it('retorna suporte não disponível quando a clipboard não existe', async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    const result = await writeTextToClipboard('texto de teste');

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('unsupported');
    }
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
