import { describe, expect, it } from 'vitest';

import { initialWizardForm } from '@/components/forms/checklist/wizard/types';
import {
  mapRequestDetailToWizardForm,
  mapWizardFormToCreateRequestPayload,
  parseAgreementAttempts,
} from '@/features/requests/mappers';
import type { JudicialRequestDetail } from '@/features/requests/types';

describe('request payload mappers', () => {
  it('converts the flat wizard state to the structured create payload expected by the API', () => {
    const formData = {
      ...initialWizardForm,
      companyLegalName: 'Empresa Credora SA',
      companyCnpj: '24.265.750/0001-53',
      companyUf: 'SP',
      companyCity: 'Sao Paulo',
      debtorLegalName: 'Distribuidora Exemplo LTDA',
      debtorCnpj: '17.409.361/0001-99',
      debtorAddress: 'Rua Oliveira Rosas, Nª 1212 Santana,PE',
      addressConfirmedBy: 'Fulano de Cicrano',
      addressConfirmedByRole: 'Gerente',
      addressConfirmedByDate: '2026-06-30',
      ctTitleType: 'TESTE',
      ctTitleNumber: '12132',
      ctGuarantor: 'Yoewdwewe',
      ctOtherGuarantees: 'Yo e Nosoutros',
      agreementDetails: '2026-06-15 - email: sem resposta',
      financialValue: '152.340,55',
      financialIndex: 'IPCA',
      financialUpdatedDate: '2026-06-30',
      factsSummary:
        'Inadimplencia superior a 90 dias com notificacoes enviadas.',
      opinionDetails: 'Ajuizamento',
    };

    const requestPayload = mapWizardFormToCreateRequestPayload(
      formData,
      'COBRANCA_TITULOS',
    );

    expect(requestPayload.checklistType).toBe('COBRANCA_TITULOS');
    expect(requestPayload.company).toMatchObject({
      name: 'Empresa Credora SA',
      cnpj: '24265750000153',
      uf: 'SP',
      city: 'Sao Paulo',
    });
    expect(requestPayload.debtor).toMatchObject({
      name: 'Distribuidora Exemplo LTDA',
      cnpj: '17409361000199',
      debtorAddress: 'Rua Oliveira Rosas, Nª 1212 Santana,PE',
      addressConfirmedBy: 'Fulano de Cicrano',
      addressConfirmedByRole: 'Gerente',
      addressConfirmedByDate: '2026-06-30',
    });
    expect(requestPayload.financial).toMatchObject({
      amount: 152340.55,
      currency: 'BRL',
      dueDate: '2026-06-30',
      index: 'IPCA',
    });
    expect(requestPayload.agreementAttempts).toEqual([
      {
        date: '2026-06-15',
        channel: 'email',
        result: 'sem resposta',
      },
    ]);
    expect(requestPayload.checklistDetails).toMatchObject({
      checklistType: 'COBRANCA_TITULOS',
      titleType: 'TESTE',
      titleNumber: '12132',
      guarantor: 'Yoewdwewe',
      otherGuarantees: 'Yo e Nosoutros',
    });
    expect(requestPayload.factsSummary).toBe(
      'Inadimplencia superior a 90 dias com notificacoes enviadas.',
    );
    expect(requestPayload.opinion).toMatchObject({
      recommendedAction: 'Ajuizamento',
    });
  });

  it('ignores free-form agreement text that cannot be mapped into a structured attempt', () => {
    expect(
      parseAgreementAttempts('sfswfwefew we fwefwe ewfew wefw efwe'),
    ).toEqual([]);
  });

  it.each([
    {
      checklistType: 'COBRANCA_TITULOS',
      formData: {
        ...initialWizardForm,
        companyLegalName: 'Empresa Credora SA',
        companyCnpj: '24.265.750/0001-53',
        companyUf: 'SP',
        companyCity: 'Sao Paulo',
        debtorLegalName: 'Distribuidora Exemplo LTDA',
        debtorCnpj: '17.409.361/0001-99',
        debtorAddress: 'Rua Oliveira Rosas, Nª 1212 Santana,PE',
        addressConfirmedBy: 'Fulano de Cicrano',
        addressConfirmedByRole: 'Gerente',
        addressConfirmedByDate: '2026-06-30',
        ctTitleType: 'TESTE',
        ctTitleNumber: '12132',
        ctGuarantor: 'Yoewdwewe',
        ctOtherGuarantees: 'Yo e Nosoutros',
        agreementDetails: '2026-06-15 - email: sem resposta',
        financialValue: '152.340,55',
        financialIndex: 'IPCA',
        financialUpdatedDate: '2026-06-30',
        factsSummary: 'Resumo final dos fatos.',
        opinionDetails: 'Ajuizamento',
      },
      expected: {
        checklistType: 'COBRANCA_TITULOS',
        checklistDetails: {
          checklistType: 'COBRANCA_TITULOS',
          titleType: 'TESTE',
          titleNumber: '12132',
          guarantor: 'Yoewdwewe',
          otherGuarantees: 'Yo e Nosoutros',
        },
      },
    },
    {
      checklistType: 'COBRANCA_MULTA_CONTRATUAL',
      formData: {
        ...initialWizardForm,
        companyLegalName: 'Empresa Credora SA',
        companyCnpj: '24.265.750/0001-53',
        companyUf: 'SP',
        companyCity: 'Sao Paulo',
        debtorLegalName: 'Distribuidora Exemplo LTDA',
        debtorCnpj: '17.409.361/0001-99',
        debtorAddress: 'Rua A, 123',
        addressConfirmedBy: 'Maria Souza',
        addressConfirmedByRole: 'Diretor',
        addressConfirmedByDate: '2026-06-30',
        mcContractType: 'Prestação de serviços',
        mcBreachedClause: 'Cláusula 10',
        mcFirstCycleFinished: true,
        mcMaxDiscount: '1500',
        agreementDetails: '2026-06-15 - telefone: sem resposta',
        financialValue: '25.000,00',
        financialIndex: 'INPC',
        financialUpdatedDate: '2026-06-30',
        factsSummary: 'Contrato descumprido com inadimplência.',
        opinionDetails: 'Cobrança judicial',
      },
      expected: {
        checklistType: 'COBRANCA_MULTA_CONTRATUAL',
        checklistDetails: {
          checklistType: 'COBRANCA_MULTA_CONTRATUAL',
          contractType: 'Prestação de serviços',
          breachedClause: 'Cláusula 10',
          firstCycleFinished: true,
          maxDiscount: '1500',
        },
      },
    },
    {
      checklistType: 'RECUPERACAO_VASILHAMES',
      formData: {
        ...initialWizardForm,
        companyLegalName: 'Empresa Credora SA',
        companyCnpj: '24.265.750/0001-53',
        companyUf: 'SP',
        companyCity: 'Sao Paulo',
        debtorLegalName: 'Distribuidora Exemplo LTDA',
        debtorCnpj: '17.409.361/0001-99',
        debtorAddress: 'Rua B, 456',
        addressConfirmedBy: 'Ana Paula',
        addressConfirmedByRole: 'Gerente',
        addressConfirmedByDate: '2026-06-30',
        rvP13: '10',
        rvP20: '20',
        rvP45: '30',
        rvHistoricalAmount: '1200,00',
        rvUpdatedAmount: '1500,50',
        rvRefusalReason: 'Não houve recolhimento do valor do vasilhame.',
        agreementDetails: '2026-06-15 - email: sem resposta',
        financialValue: '1500,50',
        financialIndex: 'IPCA',
        financialUpdatedDate: '2026-06-30',
        factsSummary: 'Vasilhames não retornados e sem regularização.',
        opinionDetails: 'Recuperação judicial',
      },
      expected: {
        checklistType: 'RECUPERACAO_VASILHAMES',
        checklistDetails: {
          checklistType: 'RECUPERACAO_VASILHAMES',
          p13Quantity: '10',
          p20Quantity: '20',
          p45Quantity: '30',
          historicalAmount: '1200,00',
          updatedAmount: '1500,50',
          refusalReason: 'Não houve recolhimento do valor do vasilhame.',
        },
      },
    },
  ])(
    'builds the exact metadata contract for $checklistType',
    ({ checklistType, formData, expected }) => {
      const payload = mapWizardFormToCreateRequestPayload(
        formData,
        checklistType as Parameters<
          typeof mapWizardFormToCreateRequestPayload
        >[1],
      );

      expect(payload).toMatchObject({
        company: {
          name: 'Empresa Credora SA',
          cnpj: '24265750000153',
          uf: 'SP',
          city: 'Sao Paulo',
        },
        debtor: {
          name: 'Distribuidora Exemplo LTDA',
          cnpj: '17409361000199',
          debtorAddress: formData.debtorAddress,
        },
        financial: {
          amount: Number(
            (formData.financialValue ?? '0').replace('.', '').replace(',', '.'),
          ),
          currency: 'BRL',
          dueDate: '2026-06-30',
          index: formData.financialIndex,
        },
        ...expected,
      });
      expect(payload.checklistType).toBe(checklistType);

      expect(payload).not.toHaveProperty('data');
      expect(Object.keys(payload)).toEqual(
        expect.arrayContaining([
          'checklistType',
          'company',
          'debtor',
          'financial',
          'agreementAttempts',
          'factsSummary',
          'opinion',
          'checklistDetails',
        ]),
      );
    },
  );

  it('loads a structured response from the API into the wizard flat state without mutating the API object', () => {
    const detail: JudicialRequestDetail = {
      requestId: 'REQ-2026-07-03-000001',
      status: 'NEEDS_CORRECTION',
      checklistType: 'COBRANCA_TITULOS',
      createdBy: {
        name: 'Maria Silva',
        email: 'maria.silva@empresa.com',
      },
      company: {
        name: 'Empresa Credora SA',
        cnpj: '24265750000153',
        uf: 'SP',
        city: 'Sao Paulo',
      },
      debtor: {
        name: 'Distribuidora Exemplo LTDA',
        cnpj: '17409361000199',
        uf: 'RJ',
        city: 'Rio de Janeiro',
        debtorAddress: 'Rua Oliveira Rosas, Nª 1212 Santana,PE',
        addressConfirmedBy: 'Fulano de Cicrano',
        addressConfirmedByRole: 'Gerente',
        addressConfirmedByDate: '2026-06-30',
      },
      financial: {
        amount: 152340.55,
        currency: 'BRL',
        dueDate: '2026-06-30',
        index: 'IPCA',
      },
      agreementAttempts: [
        {
          date: '2026-06-15',
          channel: 'email',
          result: 'sem resposta',
        },
      ],
      factsSummary:
        'Inadimplencia superior a 90 dias com notificacoes enviadas.',
      opinion: {
        recommendedAction: 'Ajuizamento',
      },
      documents: [],
      clientValidation: {
        approvedByClient: true,
      },
      history: [],
      checklistDetails: {
        checklistType: 'COBRANCA_TITULOS',
        titleType: 'TESTE',
        titleNumber: '12132',
        guarantor: 'Yoewdwewe',
        otherGuarantees: 'Yo e Nosoutros',
      },
      llmResult: {
        requestId: 'REQ-2026-07-03-000001',
        status: 'NEEDS_CORRECTION',
        score: 0.78,
        summary: 'Faltam anexos comprobatórios.',
        structuredReport: {},
        missingFields: [],
        missingDocuments: ['comprovante_entrega'],
        inconsistencies: [],
        recommendations: ['Anexar comprovante de entrega assinado.'],
        canResubmit: true,
        reviewedAt: '2026-07-03T15:05:00Z',
      },
    };

    const wizardForm = mapRequestDetailToWizardForm(detail);

    expect(wizardForm.companyLegalName).toBe('Empresa Credora SA');
    expect(wizardForm.companyCnpj).toBe('24.265.750/0001-53');
    expect(wizardForm.debtorLegalName).toBe('Distribuidora Exemplo LTDA');
    expect(wizardForm.debtorCnpj).toBe('17.409.361/0001-99');
    expect(wizardForm.financialValue).toBe('152.340,55');
    expect(wizardForm.financialIndex).toBe('IPCA');
    expect(wizardForm.financialUpdatedDate).toBe('2026-06-30');
    expect(wizardForm.agreementDetails).toBe(
      '2026-06-15 - email: sem resposta',
    );
    expect(wizardForm.ctTitleType).toBe('TESTE');
    expect(wizardForm.ctTitleNumber).toBe('12132');
    expect(wizardForm.ctGuarantor).toBe('Yoewdwewe');
    expect(wizardForm.ctOtherGuarantees).toBe('Yo e Nosoutros');
    expect(wizardForm.factsSummary).toBe(
      'Inadimplencia superior a 90 dias com notificacoes enviadas.',
    );
    expect(wizardForm.opinionDetails).toBe('Ajuizamento');
    expect(detail.company.cnpj).toBe('24265750000153');
    expect(detail.checklistDetails.checklistType).toBe('COBRANCA_TITULOS');
    expect('checklistType' in detail.checklistDetails).toBe(true);
  });

  it('loads checklist details from the top-level checklistType when the nested discriminator is missing', () => {
    const detail = {
      requestId: 'REQ-2026-07-03-000001',
      status: 'NEEDS_CORRECTION',
      checklistType: 'COBRANCA_TITULOS',
      createdBy: {
        name: 'Maria Silva',
        email: 'maria.silva@empresa.com',
      },
      company: {
        name: 'Empresa Credora SA',
        cnpj: '24265750000153',
        uf: 'SP',
        city: 'Sao Paulo',
      },
      debtor: {
        name: 'Distribuidora Exemplo LTDA',
        cnpj: '17409361000199',
        uf: 'RJ',
        city: 'Rio de Janeiro',
        debtorAddress: 'Rua Oliveira Rosas, Nª 1212 Santana,PE',
        addressConfirmedBy: 'Fulano de Cicrano',
        addressConfirmedByRole: 'Gerente',
        addressConfirmedByDate: '2026-06-30',
      },
      financial: {
        amount: 152340.55,
        currency: 'BRL',
        dueDate: '2026-06-30',
        index: 'IPCA',
      },
      agreementAttempts: [
        { date: '2026-06-15', channel: 'email', result: 'sem resposta' },
      ],
      factsSummary:
        'Inadimplencia superior a 90 dias com notificacoes enviadas.',
      opinion: { recommendedAction: 'Ajuizamento' },
      documents: [],
      clientValidation: { approvedByClient: true },
      history: [],
      checklistDetails: {
        titleType: 'TESTE',
        titleNumber: '12132',
        guarantor: 'Yoewdwewe',
        otherGuarantees: 'Yo e Nosoutros',
      },
    } as unknown as JudicialRequestDetail;

    const wizardForm = mapRequestDetailToWizardForm(detail);

    expect(wizardForm.ctTitleType).toBe('TESTE');
    expect(wizardForm.ctTitleNumber).toBe('12132');
    expect(wizardForm.ctGuarantor).toBe('Yoewdwewe');
    expect(wizardForm.ctOtherGuarantees).toBe('Yo e Nosoutros');
    expect(wizardForm.opinionDetails).toBe('Ajuizamento');
  });
});
