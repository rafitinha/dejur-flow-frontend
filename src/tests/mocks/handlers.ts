import { http, HttpResponse } from 'msw';
const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';
export const handlers = [
  http.get(`${base}/api/v1/requests`, () =>
    HttpResponse.json([
      {
        requestId: 'REQ-2026-07-03-000001',
        checklistType: 'COBRANCA_MULTA_CONTRATUAL',
        debtorName: 'Empresa Devedora LTDA',
        debtorCnpj: '11.111.111/0001-11',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByEmail: 'usuario@empresa.com',
        llmScore: 0.94,
      },
    ]),
  ),
  http.post(`${base}/api/v1/requests/submit`, () =>
    HttpResponse.json(
      {
        requestId: 'REQ-2026-07-03-000123',
        status: 'PROCESSING',
        queuePosition: 3,
      },
      { status: 202 },
    ),
  ),
];
