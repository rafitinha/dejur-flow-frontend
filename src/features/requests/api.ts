import { JudicialRequestListItem } from './types';

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:8080';

export type ListMyRequestsFilters = {
  status?: string;
  startDate?: string;
  endDate?: string;
  debtorCnpj?: string;
};

export async function listMyRequests(
  filters: ListMyRequestsFilters = {},
): Promise<JudicialRequestListItem[]> {
  const query = new URLSearchParams();
  if (filters.status) query.set('status', filters.status);
  if (filters.startDate) query.set('startDate', filters.startDate);
  if (filters.endDate) query.set('endDate', filters.endDate);
  if (filters.debtorCnpj) query.set('debtorCnpj', filters.debtorCnpj);

  const endpoint = query.toString()
    ? `${baseUrl}/api/v1/requests?${query.toString()}`
    : `${baseUrl}/api/v1/requests`;

  const r = await fetch(endpoint, { cache: 'no-store' });
  if (!r.ok) throw new Error('Erro ao consultar solicitações');
  return r.json();
}

export async function getRequestById(requestId: string) {
  const r = await fetch(`${baseUrl}/api/v1/requests/${requestId}`, {
    cache: 'no-store',
  });
  if (!r.ok) throw new Error('Erro ao consultar detalhes da solicitação');
  return r.json();
}

export async function submitRequest(formData: FormData) {
  const r = await fetch(`${baseUrl}/api/v1/requests/submit`, {
    method: 'POST',
    body: formData,
  });
  if (!r.ok) throw new Error('Erro ao submeter solicitação');
  return r.json();
}
