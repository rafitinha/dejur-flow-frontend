'use client';
import { useEffect, useState } from 'react';
import { ChecklistType } from '@/features/requests/types';
import { ChecklistTypeSelector } from './ChecklistTypeSelector';
import { FileUpload } from './FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const steps = ['Tipo', 'Empresa e devedora', 'Dados específicos', 'Acordo', 'Valores', 'Resumo', 'Parecer', 'Documentos', 'Confirmação'];

export function ChecklistWizard() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ChecklistType>();
  const [files, setFiles] = useState<File[]>([]);
  useEffect(() => { localStorage.setItem('draft-checklist', JSON.stringify({ step, type, updatedAt: new Date().toISOString() })); }, [step, type]);
  return <section className="space-y-6"><h1 className="text-2xl font-bold">Nova solicitação</h1><ol className="flex flex-wrap gap-2">{steps.map((s,i)=><li key={s} className={`rounded-full px-3 py-1 text-xs ${i===step?'bg-brand-700 text-white':'bg-slate-200'}`}>{i+1}. {s}</li>)}</ol>
    <div className="rounded-2xl border bg-white p-6">
      {step===0 && <><h2 className="font-semibold mb-4">Qual ação judicial deseja validar?</h2><ChecklistTypeSelector value={type} onChange={setType}/></>}
      {step===1 && <SimpleCompanyDebtor />}
      {step===2 && <SpecificFields type={type} />}
      {step===3 && <GenericSection title="Tentativas de acordo e cobrança" placeholder="Descreva tentativas, meios de contato, responsáveis e resultados." />}
      {step===4 && <GenericSection title="Valores, índices e atualização" placeholder="Informe índice, juros, multa, termo inicial/final e descontos." />}
      {step===5 && <GenericSection title="Breve resumo dos fatos" placeholder="Descreva o histórico do caso e o motivo da recusa/dificuldade." textarea />}
      {step===6 && <GenericSection title="Parecer da área responsável" placeholder="Informe situação financeira, chance de êxito e posicionamento." textarea />}
      {step===7 && <FileUpload onFiles={setFiles}/>}      
      {step===8 && <Review type={type} files={files}/>}      
    </div>
    <div className="flex justify-between"><Button disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))}>Voltar</Button><Button disabled={step===0 && !type} onClick={()=> step===8 ? alert('Mock: solicitação submetida como PROCESSING') : setStep(s=>Math.min(8,s+1))}>{step===8?'Confirmar e submeter':'Avançar'}</Button></div>
  </section>;
}
function SimpleCompanyDebtor(){return <div className="grid gap-4 md:grid-cols-2"><Input placeholder="Razão social GEQ"/><Input placeholder="CNPJ GEQ"/><Input placeholder="Cidade"/><Input placeholder="UF"/><Input placeholder="Nome empresarial da devedora"/><Input placeholder="CNPJ da devedora"/><Input placeholder="Endereço completo"/><Input placeholder="Confirmado por / cargo / data"/></div>}
function SpecificFields({type}:{type?:ChecklistType}){ if(type==='RECUPERACAO_VASILHAMES') return <div className="grid gap-4 md:grid-cols-3"><Input placeholder="Qtd P-13"/><Input placeholder="Qtd P-20"/><Input placeholder="Qtd P-45"/><Input placeholder="Valor histórico"/><Input placeholder="Valor total atualizado"/><Input placeholder="Motivo da recusa"/></div>; if(type==='COBRANCA_TITULOS') return <div className="grid gap-4 md:grid-cols-2"><Input placeholder="Tipo de título"/><Input placeholder="Número do título"/><Input placeholder="Avalista/Fiador"/><Input placeholder="Outras garantias"/></div>; return <div className="grid gap-4 md:grid-cols-2"><Input placeholder="Tipo de contrato"/><Input placeholder="Cláusula descumprida"/><Input placeholder="1º ciclo finalizado?"/><Input placeholder="Maior desconto autorizado"/></div>}
function GenericSection({title,placeholder,textarea}:{title:string;placeholder:string;textarea?:boolean}){return <div><h2 className="font-semibold mb-4">{title}</h2>{textarea?<Textarea placeholder={placeholder}/>:<Input placeholder={placeholder}/>}</div>}
function Review({type,files}:{type?:ChecklistType;files:File[]}){return <div><h2 className="font-semibold">Revisão final</h2><p className="mt-2 text-slate-600">Tipo: {type}</p><p className="text-slate-600">Arquivos: {files.length}</p><p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm">Revise todos os campos. Após aprovação pela LLM, não será possível reenviar.</p></div>}
