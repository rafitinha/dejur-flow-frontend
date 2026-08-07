'use client';
import type { ChangeEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function FileUpload({
  onFiles,
  error,
}: {
  onFiles: (files: File[]) => void;
  error?: string;
}) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    onFiles(files);
  }

  return (
    <label
      className={cn(
        'block cursor-pointer rounded-xl border-2 border-dashed bg-card p-6 text-center transition-all hover:border-primary/45',
        error ? 'border-danger/70' : 'border-border',
      )}
      title="Arquivos obrigatorios: PDF, DOC, DOCX, PNG e JPG/JPEG."
    >
      <span className="mx-auto mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
        <UploadCloud size={18} aria-hidden="true" />
      </span>
      <span className="block font-medium text-foreground">
        Anexar documentos comprobatórios
      </span>
      <p className="text-body mt-1">
        PDF, DOC, DOCX, PNG, JPG/JPEG até 10 MB no total
      </p>
      <input className="hidden" type="file" multiple onChange={handleChange} />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </label>
  );
}
