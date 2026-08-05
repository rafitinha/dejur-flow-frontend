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
const useToken = () => useSession().data?.accessToken;
export function useRequests(filters: ListMyRequestsFilters) {
  const token = useToken();
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: () => listMyRequests(filters, token),
    staleTime: 30_000,
  });
}
export function useApprovedRequests(filters: ListMyRequestsFilters) {
  const token = useToken();
  return useQuery({
    queryKey: ['approved-requests', filters],
    queryFn: () => listApprovedRequests(filters, token),
    staleTime: 30_000,
  });
}
export function useRequestById(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['request', id],
    queryFn: () => getRequestById(id, token),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
export function useSubmitRequest() {
  const token = useToken();
  return useMutation({
    mutationFn: (formData: FormData) => submitRequest(formData, token),
  });
}
