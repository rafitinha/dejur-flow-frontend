import { JudicialRequestListItem } from './types';
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';
export async function listMyRequests(): Promise<JudicialRequestListItem[]> { const r = await fetch(`${baseUrl}/api/v1/requests`, { cache:'no-store' }); if(!r.ok) throw new Error('Erro ao consultar solicitações'); return r.json(); }
export async function submitRequest(formData: FormData) { const r = await fetch(`${baseUrl}/api/v1/requests/submit`, { method:'POST', body: formData }); if(!r.ok) throw new Error('Erro ao submeter solicitação'); return r.json(); }
