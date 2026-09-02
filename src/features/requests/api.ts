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

export type ApiUser = {
  id: number | string;
  name: string;
  email: string;
};

export enum PeriodType {
  TODAY = 'TODAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  CUSTOM = 'CUSTOM',
}

export enum ComparisonPeriod {
  YESTERDAY = 'YESTERDAY',
  PREVIOUS_PERIOD = 'PREVIOUS_PERIOD',
  PREVIOUS_WEEK = 'PREVIOUS_WEEK',
  PREVIOUS_MONTH = 'PREVIOUS_MONTH',
}

export enum ChecklistType {
  CONTRACTUAL_FINE = 'CONTRACTUAL_FINE',
  TITLE_COLLECTION = 'TITLE_COLLECTION',
  CONTAINER_RECOVERY = 'CONTAINER_RECOVERY',
}

export interface DashboardPeriod {
  type: PeriodType;
  startDate: string;
  endDate: string;
}

export interface UnderAiAnalysisIndicator {
  count: number;
  variation: number;
  comparisonPeriod: ComparisonPeriod;
}

export interface ApprovedIndicator {
  count: number;
  approvalRate: number;
  comparisonPeriod: ComparisonPeriod;
}

export interface RejectedIndicator {
  count: number;
  hasReasonsForReview: boolean;
  comparisonPeriod: ComparisonPeriod;
}

export interface DashboardIndicators {
  underAiAnalysis: UnderAiAnalysisIndicator;
  approved: ApprovedIndicator;
  rejected: RejectedIndicator;
}

export interface ChecklistTypeDistribution {
  type: ChecklistType;
  description: string;
  count: number;
  percentage: number;
}

export interface JudicialDashboardSummaryResponse {
  period: DashboardPeriod;
  indicators: DashboardIndicators;
  checklistTypeDistribution: ChecklistTypeDistribution[];
  totalChecklists: number;
  lastUpdatedAt: string;
}

export type ListMyRequestsFilters = {
  status?: string;
  startDate?: string;
  endDate?: string;
  debtorCnpj?: string;
  userIds?: string;
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

export type EntityTaxIdType = 'CPF' | 'CNPJ';
export type EntityStatus = 'ACTIVE' | 'INACTIVE';
export type EntityType = 'ORGANIZATIONAL' | 'DEBTOR' | 'PHYSICAL_PERSON';

export type EntityAddress = {
  street: string;
  number?: string | null;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Entity = {
  id?: string;
  name: string;
  legalName: string;
  taxId: string;
  taxIdType: EntityTaxIdType;
  address: EntityAddress;
  status: EntityStatus;
  type: EntityType;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type EntityListFilters = {
  name?: string;
  taxId?: string;
  taxIdType?: EntityTaxIdType;
  type?: EntityType;
  createdAt?: string;
  updatedAt?: string;
  limit?: number;
  offset?: number;
  index?: number;
};

export async function listUsers(accessToken?: string): Promise<ApiUser[]> {
  const endpoint = `${baseUrl}/api/v1/users`;
  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });

  if (!r.ok) throw new Error('Erro ao consultar usuários');
  return r.json() as Promise<ApiUser[]>;
}

export async function getDashboardSummary(
  periodType: PeriodType = PeriodType.LAST_7_DAYS,
  accessToken?: string,
): Promise<JudicialDashboardSummaryResponse> {
  const query = new URLSearchParams({ periodType });
  const endpoint = `${baseUrl}/api/v1/dashboard/summary?${query.toString()}`;

  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });

  if (!r.ok) throw new Error('Erro ao consultar resumo do dashboard');
  return r.json() as Promise<JudicialDashboardSummaryResponse>;
}

// ---------------------------------------------------------------------------
// Funcoes de API
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
  if (filters.userIds) query.set('userIds', filters.userIds);
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
  if (filters.userIds) query.set('userIds', filters.userIds);
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

export async function listEntities(
  filters: EntityListFilters = {},
  accessToken?: string,
): Promise<Entity[]> {
  const query = new URLSearchParams();
  if (filters.name) query.set('name', filters.name);
  if (filters.taxId) query.set('taxId', filters.taxId);
  if (filters.taxIdType) query.set('taxIdType', filters.taxIdType);
  if (filters.type) query.set('type', filters.type);
  if (filters.createdAt) query.set('createdAt', filters.createdAt);
  if (filters.updatedAt) query.set('updatedAt', filters.updatedAt);
  if (filters.limit !== undefined) query.set('limit', String(filters.limit));
  if (filters.offset !== undefined) query.set('offset', String(filters.offset));
  if (filters.index !== undefined) query.set('index', String(filters.index));

  const endpoint = `${baseUrl}/api/v1/entities${query.toString() ? `?${query.toString()}` : ''}`;
  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });

  if (!r.ok) throw new Error('Erro ao consultar entidades');
  const body = await r.json();

  if (Array.isArray(body)) {
    return body as Entity[];
  }

  if (body && Array.isArray(body.items)) {
    return body.items as Entity[];
  }

  return [];
}

export async function getEntityById(
  entityId: string,
  accessToken?: string,
): Promise<Entity> {
  const endpoint = `${baseUrl}/api/v1/entities/${entityId}`;
  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: buildHeaders(accessToken),
  });

  if (!r.ok) throw new Error('Erro ao consultar entidade');
  return r.json() as Promise<Entity>;
}

export async function createEntity(
  payload: Partial<Entity>,
  accessToken?: string,
): Promise<Entity> {
  const r = await fetch(`${baseUrl}/api/v1/entities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildHeaders(accessToken),
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) throw new Error('Erro ao criar entidade');
  return r.json() as Promise<Entity>;
}

export async function updateEntity(
  entityId: string,
  payload: Partial<Entity>,
  accessToken?: string,
): Promise<Entity> {
  const r = await fetch(`${baseUrl}/api/v1/entities/${entityId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...buildHeaders(accessToken),
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) throw new Error('Erro ao atualizar entidade');
  return r.json() as Promise<Entity>;
}

export async function patchEntityStatus(
  entityId: string,
  status: EntityStatus,
  accessToken?: string,
): Promise<Entity> {
  const r = await fetch(`${baseUrl}/api/v1/entities/${entityId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildHeaders(accessToken),
    },
    body: JSON.stringify({ status }),
  });

  if (!r.ok) throw new Error('Erro ao atualizar status da entidade');
  return r.json() as Promise<Entity>;
}
