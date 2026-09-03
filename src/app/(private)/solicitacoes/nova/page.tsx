'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import {
  ChecklistWizard,
  ChecklistWizardSubmitParams,
} from '@/components/forms/checklist/ChecklistWizard';
import { useToast } from '@/components/ui/Toast';
import { submitRequest } from '@/features/requests/api';
import { mapWizardFormToCreateRequestPayload } from '@/features/requests/mappers';

export default function NewRequestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const token = session?.accessToken;

  const handleSubmit = useCallback(
    async ({
      requestPayload,
      formData,
      checklistType,
      newFiles,
    }: ChecklistWizardSubmitParams) => {
      if (!token) {
        const error = new Error('Usuário não autenticado');
        showToast({
          title: 'Sessão expirada.',
          description: 'Faça login novamente para enviar a solicitação.',
          variant: 'error',
        });
        throw error;
      }

      try {
        const payload =
          requestPayload ??
          mapWizardFormToCreateRequestPayload(formData, checklistType);

        const fd = new FormData();
        fd.append('metadata', JSON.stringify(payload));
        newFiles.forEach((file: File) => fd.append('files', file));

        const response = await submitRequest(fd, token);

        showToast({
          title: 'Solicitação enviada com sucesso.',
          description: 'Sua solicitação foi enviada para processamento.',
          variant: 'success',
        });

        if (response?.requestId) {
          router.push(`/solicitacoes/${response.requestId}`);
        }

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível enviar a solicitação.';

        showToast({
          title: 'Falha ao enviar solicitação.',
          description: message,
          variant: 'error',
        });

        throw error;
      }
    },
    [router, showToast, token],
  );

  return <ChecklistWizard mode="create" onSubmit={handleSubmit} />;
}
