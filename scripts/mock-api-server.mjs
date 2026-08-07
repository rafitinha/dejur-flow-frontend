import http from 'node:http';

const port = 8080;

const json = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
  });
  res.end(JSON.stringify(data));
};

const exampleRequestId = 'REQ-2026-07-03-000001';

const exampleRequestDetail = {
  requestId: exampleRequestId,
  status: 'DRAFT',
  checklistType: 'COBRANCA_MULTA_CONTRATUAL',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdByEmail: 'usuario@empresa.com',
  llmScore: 0.94,
  companyLegalName: 'Empresa Credora S.A.',
  companyCnpj: '12.345.678/0001-90',
  companyUf: 'SP',
  companyCity: 'Sao Paulo',
  debtorLegalName: 'Empresa Devedora LTDA',
  debtorCnpj: '11.111.111/0001-11',
  debtorAddress: 'Rua Exemplo, 123 - Centro - Sao Paulo/SP',
  addressConfirmedBy: 'Maria Souza - Analista - 24/07/2026',
  mcContractType: 'Comodato',
  mcBreachedClause: 'Clausula 5 - Penalidade por atraso',
  mcFirstCycleFinished: 'SIM',
  mcMaxDiscount: '15,00',
  agreementDetails:
    'Foram realizadas 3 tentativas por e-mail e telefone, sem retorno conclusivo.',
  financialDetails:
    'Indice IPCA, juros 1% a.m., termo inicial 01/01/2026, descontos inexistentes.',
  factsSummary:
    'Houve descumprimento do contrato de fornecimento e recusa em negociar parcelamento.',
  opinionDetails:
    'Area responsavel entende viavel a cobranca com alta chance de exito, conforme documentos anexos.',
  documents: [
    {
      name: 'Contrato.pdf',
      type: 'application/pdf',
      size: 245760,
      uploadedAt: new Date().toISOString(),
      downloadUrl: 'http://localhost:8080/mock-download/contrato.pdf',
    },
  ],
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});

  if (req.url?.startsWith('/api/v1/requests/submit') && req.method === 'POST')
    return json(res, 202, {
      requestId: 'REQ-2026-07-03-000123',
      status: 'PROCESSING',
      queuePosition: 2,
    });

  if (req.url?.startsWith('/api/v1/requests/drafts') && req.method === 'POST')
    return json(res, 201, {
      requestId: 'REQ-2026-07-03-000122',
      status: 'DRAFT',
    });

  if (
    req.url?.startsWith(`/api/v1/requests/${exampleRequestId}`) &&
    req.method === 'GET'
  )
    return json(res, 200, exampleRequestDetail);

  if (req.url?.startsWith('/api/v1/requests/') && req.method === 'GET')
    return json(res, 200, {
      requestId: 'REQ-2026-07-03-000999',
      status: 'DRAFT',
    });

  if (req.url?.startsWith('/api/v1/requests/') && req.method === 'PUT') {
    const requestId = req.url.split('/').pop();
    return json(res, 200, {
      requestId,
      status: 'DRAFT',
      updatedAt: new Date().toISOString(),
    });
  }

  if (req.url?.startsWith('/api/v1/admin/requests/approved'))
    return json(res, 200, [
      {
        requestId: exampleRequestId,
        checklistType: 'COBRANCA_MULTA_CONTRATUAL',
        debtorName: 'Empresa Devedora LTDA',
        debtorCnpj: '11.111.111/0001-11',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByEmail: 'usuario@empresa.com',
        llmScore: 0.94,
      },
    ]);

  if (req.url?.startsWith('/api/v1/requests'))
    return json(res, 200, [
      {
        requestId: exampleRequestId,
        checklistType: 'COBRANCA_MULTA_CONTRATUAL',
        debtorName: 'Empresa Devedora LTDA',
        debtorCnpj: '11.111.111/0001-11',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByEmail: 'usuario@empresa.com',
        llmScore: 0.94,
      },
    ]);

  if (req.url?.startsWith('/api/v1/notifications'))
    return json(res, 200, [
      { id: 'not-1', title: 'Solicitação aprovada', read: false },
    ]);

  json(res, 404, { error: 'Not found' });
});

server.listen(port, () =>
  console.log(`Mock API running on http://localhost:${port}`),
);
