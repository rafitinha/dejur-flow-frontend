'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  getRequestById,
  listApprovedRequests,
  listMyRequests,
  submitRequest,
  type ListMyRequestsFilters,
} from '@/features/requests/api';

function useToken() {
  const { data: session, status } = useSession();
  return {
    token: session?.accessToken,
    isAuthenticated:
      status === 'authenticated' && Boolean(session?.accessToken),
  };
}

export function useRequests(filters: ListMyRequestsFilters) {
  const { token, isAuthenticated } = useToken();

  return useQuery({
    queryKey: ['requests', filters, token],
    enabled: isAuthenticated,
    queryFn: () => listMyRequests(filters, token),
    staleTime: 30_000,
  });
}

export function useApprovedRequests(filters: ListMyRequestsFilters) {
  const { token, isAuthenticated } = useToken();

  return useQuery({
    queryKey: ['approved-requests', filters, token],
    enabled: isAuthenticated,
    queryFn: () => listApprovedRequests(filters, token),
    staleTime: 30_000,
  });
}

export function useRequestById(id: string) {
  const { token, isAuthenticated } = useToken();

  return useQuery({
    queryKey: ['request', id, token],
    queryFn: () => getRequestById(id, token),
    enabled: Boolean(id) && isAuthenticated,
    staleTime: 30_000,
  });
}

export function useSubmitRequest() {
  const { token, isAuthenticated } = useToken();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!isAuthenticated || !token) {
        throw new Error('Usuário não autenticado');
      }
      return submitRequest(formData, token);
    },
  });
}
