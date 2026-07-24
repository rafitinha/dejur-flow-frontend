'use client';
import { cn } from '@/lib/utils/cn';

export function FileUpload({
  onFiles,
  error,
}: {
  onFiles: (files: File[]) => void;
  error?: string;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    onFiles(files);
  }

  return (
    <label
      className={cn(
        'block cursor-pointer rounded-xl border-2 border-dashed bg-white p-6 text-center dark:bg-slate-900',
        error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600',
      )}
      title="Arquivos obrigatorios: PDF, DOC, DOCX, PNG e JPG/JPEG."
    >
      <span className="font-medium">Anexar documentos comprobatórios</span>
      <p className="text-sm text-slate-500">
        PDF, DOC, DOCX, PNG, JPG/JPEG até 10 MB no total
      </p>
      <input className="hidden" type="file" multiple onChange={handleChange} />
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </label>
  );
}
