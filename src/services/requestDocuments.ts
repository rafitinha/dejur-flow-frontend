const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.REACT_APP_API_URL ??
  'https://SEU-MOCK.postman.co';

export type DeleteRequestDocumentsPayload = {
  requestId: string;
  userId: string;
  documents: Array<{ documentId: string }>;
};

export type UploadRequestDocumentsPayload = {
  requestId: string;
  userId: string;
  files: File[];
};

export async function deleteRequestDocuments({
  requestId,
  userId,
  documents,
}: DeleteRequestDocumentsPayload) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/requests/${requestId}/documents`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId, documents }),
    },
  );

  if (!response.ok) {
    throw new Error('N\u00e3o foi poss\u00edvel remover os documentos.');
  }

  return response.status === 204 ? undefined : response.json();
}

export async function uploadRequestDocuments({
  requestId,
  userId,
  files,
}: UploadRequestDocumentsPayload) {
  const formData = new FormData();
  formData.append('requestId', requestId);
  formData.append('userId', userId);
  files.forEach((file) => formData.append('files', file));

  const response = await fetch(
    `${API_BASE_URL}/api/v1/requests/${requestId}/documents`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error('N\u00e3o foi poss\u00edvel enviar os documentos.');
  }

  return response.status === 204 ? undefined : response.json();
}