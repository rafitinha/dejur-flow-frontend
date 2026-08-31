export const REQUESTS_API_ROUTES = {
  list: '/api/v1/requests',
  listExportCsv: '/api/v1/requests/export/csv',
  listExportExcel: '/api/v1/requests/export/xlsx',
  approved: '/api/v1/requests/approved',
  byId: (requestId: string) => `/api/v1/requests/${requestId}`,
  exportPdf: (requestId: string) => `/api/v1/requests/${requestId}/export/pdf`,
  exportCsv: (requestId: string) => `/api/v1/requests/${requestId}/export/csv`,
  exportExcel: (requestId: string) =>
    `/api/v1/requests/${requestId}/export/xlsx`,
  downloadDocument: (requestId: string, documentId: string) =>
    `/api/v1/requests/${requestId}/documents/${documentId}/download`,
} as const;
