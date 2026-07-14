import http from 'node:http';
const port = 8080;
const json = (res, status, data) => { res.writeHead(status, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'}); res.end(JSON.stringify(data)); };
const server = http.createServer((req,res)=>{
  if(req.method === 'OPTIONS') return json(res, 204, {});
  if(req.url?.startsWith('/api/v1/requests/submit') && req.method === 'POST') return json(res, 202, { requestId:'REQ-2026-07-03-000123', status:'PROCESSING', queuePosition:2 });
  if(req.url?.startsWith('/api/v1/requests/drafts') && req.method === 'POST') return json(res, 201, { requestId:'REQ-2026-07-03-000122', status:'DRAFT' });
  if(req.url?.startsWith('/api/v1/admin/requests/approved')) return json(res, 200, [{ requestId:'REQ-2026-07-03-000001', checklistType:'COBRANCA_MULTA_CONTRATUAL', debtorName:'Empresa Devedora LTDA', debtorCnpj:'11.111.111/0001-11', status:'APPROVED', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), createdByEmail:'usuario@empresa.com', llmScore:0.94 }]);
  if(req.url?.startsWith('/api/v1/requests')) return json(res, 200, [{ requestId:'REQ-2026-07-03-000001', checklistType:'COBRANCA_MULTA_CONTRATUAL', debtorName:'Empresa Devedora LTDA', debtorCnpj:'11.111.111/0001-11', status:'APPROVED', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), createdByEmail:'usuario@empresa.com', llmScore:0.94 }]);
  if(req.url?.startsWith('/api/v1/notifications')) return json(res, 200, [{ id:'not-1', title:'Solicitação aprovada', read:false }]);
  json(res, 404, { error:'Not found' });
});
server.listen(port, ()=>console.log(`Mock API running on http://localhost:${port}`));
