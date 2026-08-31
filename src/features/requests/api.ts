import { JudicialRequestDetail, JudicialRequestListItem } from './types';
import { REQUESTS_API_ROUTES } from './routes';

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:8080';

/** Monta headers de autenticaÃ§Ã£o condicionalmente. */
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
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
};

// ---------------------------------------------------------------------------
// FunÃ§Ãµes de API
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
  if (filters.limit !== undefined) query.set('limit', String(filters.limit));
  if (filters.sortBy) query.set('sortBy', filters.sortBy);
  if (filters.sortDirection) query.set('sortDirection', filters.sortDirection);

  const qs = query.toString();
  const endpoint = `${baseUrl}/api/v1/requests${qs ? `?${qs}` : ''}`;

  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });

  if (!r.ok) throw new Error('Erro ao consultar solicitaÃ§Ãµes');

  // Suporte a payload paginado (PaginatedResponse) e array legado
  const body = await r.json();
  if (Array.isArray(body)) {
    return {
      items: body as JudicialRequestListItem[],
      totalCount: body.length,
    };
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
  if (filters.limit !== undefined) query.set('limit', String(filters.limit));
  if (filters.sortBy) query.set('sortBy', filters.sortBy);
  if (filters.sortDirection) query.set('sortDirection', filters.sortDirection);

  const qs = query.toString();
  const endpoint = `${baseUrl}/api/v1/requests/approved${qs ? `?${qs}` : ''}`;

  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });

  if (!r.ok) throw new Error('Erro ao consultar solicitaÃ§Ãµes aprovadas');

  const body = await r.json();
  if (Array.isArray(body)) {
    return {
      items: body as JudicialRequestListItem[],
      totalCount: body.length,
    };
  }
  return body as PaginatedResponse<JudicialRequestListItem>;
}

export async function getRequestById(
  requestId: string,
  accessToken?: string,
): Promise<JudicialRequestDetail> {
  const endpoint = `${baseUrl}${REQUESTS_API_ROUTES.byId(requestId)}`;
  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });
  if (!r.ok) throw new Error('Erro ao consultar detalhes da solicitação');
  return r.json() as Promise<JudicialRequestDetail>;
}

export async function exportRequestPdf(
  requestId: string,
  accessToken?: string,
) {
  const endpoint = `${baseUrl}${REQUESTS_API_ROUTES.exportPdf(requestId)}`;
  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });
  if (!r.ok) throw new Error('Não foi possível gerar o arquivo PDF.');
  return r.blob();
}

export async function exportRequestCsv(
  requestId: string,
  accessToken?: string,
) {
  const endpoint = `${baseUrl}${REQUESTS_API_ROUTES.exportCsv(requestId)}`;
  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });
  if (!r.ok) throw new Error('Não foi possível gerar o arquivo CSV.');
  return r.blob();
}

export async function exportRequestExcel(
  requestId: string,
  accessToken?: string,
) {
  const endpoint = `${baseUrl}${REQUESTS_API_ROUTES.exportExcel(requestId)}`;
  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });
  if (!r.ok) throw new Error('Não foi possível gerar o arquivo Excel.');
  return r.blob();
}

export async function downloadRequestDocument(
  requestId: string,
  documentId: string,
  accessToken?: string,
) {
  if (!requestId || !documentId) {
    throw new Error('Parâmetros inválidos para o download do documento.');
  }

  const endpoint = `${baseUrl}${REQUESTS_API_ROUTES.downloadDocument(requestId, documentId)}`;
  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });
  if (!r.ok) throw new Error('Não foi possível baixar o documento.');
  return r.blob();
}

export async function submitRequest(formData: FormData, accessToken?: string) {
  const r = await fetch(`${baseUrl}/api/v1/requests/submit`, {
    method: 'POST',
    body: formData,
    headers: buildHeaders(accessToken),
  });
  if (!r.ok) throw new Error('Erro ao submeter solicitaÃ§Ã£o');
  return r.json();
}
export async function updateRequest(
  requestId: string,
  formData: FormData,
  accessToken?: string,
) {
  const r = await fetch(`${baseUrl}/api/v1/requests/${requestId}`, {
    method: 'PUT',
    body: formData,
    headers: buildHeaders(accessToken),
  });
  if (!r.ok) throw new Error('Erro ao atualizar solicitação');
  return r.json();
}
