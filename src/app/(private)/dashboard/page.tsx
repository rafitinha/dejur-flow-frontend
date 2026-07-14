import Link from 'next/link';
import { StatusTag } from '@/components/ui/StatusTag';
const items = [
  { id:'REQ-2026-07-03-000001', tipo:'Multa Contratual', devedora:'Empresa Devedora LTDA', status:'PROCESSING' as const },
  { id:'REQ-2026-07-03-000002', tipo:'Títulos', devedora:'Comercial Exemplo ME', status:'NEEDS_CORRECTION' as const },
];
export default function DashboardPage() { return <div><h1 className="text-2xl font-bold">Dashboard</h1><div className="mt-6 grid grid-cols-4 gap-4"><Card title="Rascunhos" value="3"/><Card title="Processando" value="1"/><Card title="Aprovadas" value="8"/><Card title="Pendências" value="2"/></div><Link href="/solicitacoes/nova" className="mt-6 inline-block rounded-lg bg-brand-700 px-4 py-2 text-white">Nova solicitação</Link><section className="mt-8 rounded-xl border bg-white p-4"><h2 className="font-semibold">Recentes</h2><div className="mt-4 grid gap-3">{items.map(i=><div key={i.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{i.id}</p><p className="text-sm text-slate-600">{i.tipo} • {i.devedora}</p></div><StatusTag status={i.status}/></div>)}</div></section></div> }
function Card({title,value}:{title:string;value:string}){return <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>}
