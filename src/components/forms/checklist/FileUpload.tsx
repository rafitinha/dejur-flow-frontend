'use client';
const allowed = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];
export function FileUpload({ onFiles }: { onFiles: (files: File[]) => void }) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const total = files.reduce((s, f) => s + f.size, 0);
    if (total > 10 * 1024 * 1024)
      return alert('O tamanho total dos arquivos não pode ultrapassar 10 MB.');
    if (files.some((f) => !allowed.includes(f.type)))
      return alert('Formato inválido. Use PDF, Word ou imagem.');
    onFiles(files);
  }
  return (
    <label className="block rounded-xl border-2 border-dashed bg-white p-6 text-center cursor-pointer">
      <span className="font-medium">Anexar documentos comprobatórios</span>
      <p className="text-sm text-slate-500">
        PDF, DOC, DOCX, PNG, JPG/JPEG até 10 MB no total
      </p>
      <input className="hidden" type="file" multiple onChange={handleChange} />
    </label>
  );
}
