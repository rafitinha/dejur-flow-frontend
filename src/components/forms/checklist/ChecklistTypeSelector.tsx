import { ChecklistType } from '@/features/requests/types';
const options: { value: ChecklistType; title: string; description: string }[] = [
  { value:'RECUPERACAO_VASILHAMES', title:'Recuperação de Vasilhames', description:'Contrato de comodato, NF, notificação, AR e evidências.' },
  { value:'COBRANCA_TITULOS', title:'Cobrança de Títulos', description:'Cheque, duplicata, nota promissória, confissão de dívida ou contratos.' },
  { value:'COBRANCA_MULTA_CONTRATUAL', title:'Cobrança de Multa Contratual', description:'Contrato descumprido, cálculo, notificação e pareceres.' },
];
export function ChecklistTypeSelector({ value, onChange }: { value?: ChecklistType; onChange: (v: ChecklistType)=>void }) { return <div className="grid gap-3 md:grid-cols-3">{options.map(o=><button type="button" key={o.value} onClick={()=>onChange(o.value)} className={`rounded-xl border bg-white p-4 text-left ${value===o.value?'border-brand-700 ring-2 ring-brand-500':'border-slate-200'}`}><h3 className="font-semibold">{o.title}</h3><p className="mt-2 text-sm text-slate-600">{o.description}</p></button>)}</div> }
