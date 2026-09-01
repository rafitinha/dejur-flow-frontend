import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RequestDetailsModal } from '@/components/requests/RequestDetailsModal';
import type { JudicialRequestDetail } from '@/features/requests/types';

const baseRequest: JudicialRequestDetail = {
  requestId: 'REQ-123',
  status: 'APPROVED',
  checklistType: 'COBRANCA_MULTA_CONTRATUAL',
  createdBy: { name: 'Ana', email: 'ana@empresa.com' },
  createdAt: '2026-06-15T00:00:00.000Z',
  updatedAt: '2026-06-15T00:00:00.000Z',
  company: {
    name: 'Empresa Teste',
    cnpj: '11.111.111/0001-11',
    uf: 'SP',
    city: 'São Paulo',
  },
  debtor: {
    name: 'Devedor Teste',
    cnpj: '22.222.222/0001-22',
    uf: 'SP',
    city: 'São Paulo',
    debtorAddress: 'Rua A, 123',
    addressConfirmedBy: 'Ana',
    addressConfirmedByRole: 'Analista',
    addressConfirmedByDate: '2026-06-15',
  },
  financial: {
    amount: 1000,
    currency: 'BRL',
    dueDate: '2026-07-01',
    index: 'IPCA',
  },
  agreementAttempts: [],
  factsSummary: 'Resumo do caso',
  opinion: { recommendedAction: 'Aprovar' },
  documents: [
    {
      name: 'contrato.pdf',
      type: 'CONTRATO',
      size: 245760,
      uploadedAt: '2026-06-15',
      downloadUrl: 'http://localhost:8080/mock-download/contrato.pdf',
    },
  ],
  clientValidation: { approvedByClient: true },
  history: [],
  checklistDetails: {
    checklistType: 'COBRANCA_MULTA_CONTRATUAL',
    contractType: 'Prestação de serviços',
    breachedClause: 'Cláusula de inadimplência',
    firstCycleFinished: true,
    maxDiscount: '1000',
    value: '1000',
    index: 'IPCA',
    updatedAt: '2026-06-15',
  },
};

describe('RequestDetailsModal', () => {
  it('habilita o download quando o payload informa downloadUrl sem documentId', () => {
    const onDownloadDocument = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <RequestDetailsModal
        open
        request={baseRequest}
        loading={false}
        onClose={vi.fn()}
        onExportPdf={vi.fn()}
        onExportCsv={vi.fn()}
        onExportExcel={vi.fn()}
        onDownloadDocument={onDownloadDocument}
        onCopyContent={vi.fn()}
      />,
    );

    const downloadButton = screen.getByRole('button', { name: /^baixar$/i });

    expect(downloadButton).not.toBeDisabled();

    fireEvent.click(downloadButton);

    expect(openSpy).toHaveBeenCalledWith(
      'http://localhost:8080/mock-download/contrato.pdf',
      '_blank',
      'noopener,noreferrer',
    );
    expect(onDownloadDocument).not.toHaveBeenCalled();
  });
});
