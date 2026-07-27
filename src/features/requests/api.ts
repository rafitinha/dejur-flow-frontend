import { JudicialRequestListItem } from './types';

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:8080';

/** Monta headers de autenticação condicionalmente. */
function buildHeaders(accessToken?: string): HeadersInit {
  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type ListMyRequestsFilters = {
  status?: string;
  startDate?: string;
  endDate?: string;
  debtorCnpj?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
};

// ---------------------------------------------------------------------------
// Funções de API
// ---------------------------------------------------------------------------

export async function listMyRequests(
  filters: ListMyRequestsFilters = {},
  accessToken?: string,
): Promise<PaginatedResponse<JudicialRequestListItem>> {
  const query = new URLSearchParams();
  if (filters.status) query.set('status', filters.status);
  if (filters.startDate) query.set('startDate', filters.startDate);
  if (filters.endDate) query.set('endDate', filters.endDate);
  if (filters.debtorCnpj) query.set('debtorCnpj', filters.debtorCnpj);
  if (filters.pageIndex !== undefined)
    query.set('pageIndex', String(filters.pageIndex));
  if (filters.pageSize !== undefined)
    query.set('pageSize', String(filters.pageSize));
  if (filters.sortBy) query.set('sortBy', filters.sortBy);
  if (filters.sortDirection) query.set('sortDirection', filters.sortDirection);

  const qs = query.toString();
  const endpoint = `${baseUrl}/api/v1/requests${qs ? `?${qs}` : ''}`;

  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });

  if (!r.ok) throw new Error('Erro ao consultar solicitações');

  // Suporte a payload paginado (PaginatedResponse) e array legado
  const body = await r.json();
  if (Array.isArray(body)) {
    return { items: body as JudicialRequestListItem[], totalCount: body.length };
  }
  return body as PaginatedResponse<JudicialRequestListItem>;
}

export async function listApprovedRequests(
  filters: ListMyRequestsFilters = {},
  accessToken?: string,
): Promise<PaginatedResponse<JudicialRequestListItem>> {
  const query = new URLSearchParams();
  if (filters.status) query.set('status', filters.status);
  if (filters.startDate) query.set('startDate', filters.startDate);
  if (filters.endDate) query.set('endDate', filters.endDate);
  if (filters.debtorCnpj) query.set('debtorCnpj', filters.debtorCnpj);
  if (filters.pageIndex !== undefined)
    query.set('pageIndex', String(filters.pageIndex));
  if (filters.pageSize !== undefined)
    query.set('pageSize', String(filters.pageSize));
  if (filters.sortBy) query.set('sortBy', filters.sortBy);
  if (filters.sortDirection) query.set('sortDirection', filters.sortDirection);

  const qs = query.toString();
  const endpoint = `${baseUrl}/api/v1/requests/approved${qs ? `?${qs}` : ''}`;

  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });

  if (!r.ok) throw new Error('Erro ao consultar solicitações aprovadas');

  const body = await r.json();
  if (Array.isArray(body)) {
    return { items: body as JudicialRequestListItem[], totalCount: body.length };
  }
  return body as PaginatedResponse<JudicialRequestListItem>;
}

export async function getRequestById(
  requestId: string,
  accessToken?: string,
) {
  const r = await fetch(`${baseUrl}/api/v1/requests/${requestId}`, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });
  if (!r.ok) throw new Error('Erro ao consultar detalhes da solicitação');
  return r.json();
}

export async function submitRequest(
  formData: FormData,
  accessToken?: string,
) {
  const r = await fetch(`${baseUrl}/api/v1/requests/submit`, {
    method: 'POST',
    body: formData,
    headers: buildHeaders(accessToken),
  });
  if (!r.ok) throw new Error('Erro ao submeter solicitação');
  return r.json();
}
