import fs from 'node:fs';
JSON.parse(fs.readFileSync('docs/openapi/openapi.json', 'utf-8'));
JSON.parse(
  fs.readFileSync(
    'docs/postman/Validador_Acoes_Judiciais.postman_collection.json',
    'utf-8',
  ),
);
console.log('Schemas JSON válidos.');
