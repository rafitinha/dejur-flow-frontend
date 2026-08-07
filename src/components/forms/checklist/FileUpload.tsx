import { ChangeEvent, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  LoaderCircle,
  RotateCcw,
  Trash2,
  UploadCloud,
} from 'lucide-react';

import type { UploadItem } from '@/types/upload';

type FileUploadProps = {
  items: UploadItem[];
  onAdd: (files: File[]) => Promise<void> | void;
  onRemove: (item: UploadItem) => Promise<void> | void;
  error?: string;
  maxTotalSizeMB?: number;
  accept?: string;
};

const DEFAULT_ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusContent(item: UploadItem) {
  switch (item.status) {
    case 'existing':
      return <span className="text-slate-600">Já anexado</span>;
    case 'pending_upload':
      return <span className="text-blue-600">Será enviado na confirmação</span>;
    case 'pending_delete':
      return (
        <span className="inline-flex items-center gap-1 text-red-600">
          <AlertCircle size={13} aria-hidden="true" />
          Será removido na confirmação
        </span>
      );
    case 'uploading':
      return (
        <span className="inline-flex items-center gap-1 text-blue-600">
          <LoaderCircle className="animate-spin" size={13} aria-hidden="true" />
          Enviando...
        </span>
      );
    case 'deleting':
      return (
        <span className="inline-flex items-center gap-1 text-red-600">
          <LoaderCircle className="animate-spin" size={13} aria-hidden="true" />
          Removendo...
        </span>
      );
    case 'success':
      return (
        <span className="inline-flex items-center gap-1 text-emerald-600">
          <CheckCircle2 size={13} aria-hidden="true" />
          Enviado
        </span>
      );
    case 'error':
      return (
        <span
          className="inline-flex items-center gap-1 text-red-600"
          title={item.error}
        >
          <AlertCircle size={13} aria-hidden="true" />
          Erro no envio
        </span>
      );
  }
}

export function FileUpload({
  items,
  onAdd,
  onRemove,
  error,
  maxTotalSizeMB = 10,
  accept = DEFAULT_ACCEPT,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string>();
  const maxBytes = maxTotalSizeMB * 1024 * 1024;

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;

    setLocalError(undefined);

    const currentTotal = items.reduce(
      (total, item) =>
        item.status === 'pending_delete' ? total : total + (item.size ?? 0),
      0,
    );
    const selectedTotal = selectedFiles.reduce(
      (total, file) => total + file.size,
      0,
    );

    if (currentTotal + selectedTotal > maxBytes) {
      setLocalError(
        `O tamanho total dos arquivos deve ser de até ${maxTotalSizeMB} MB.`,
      );
      event.target.value = '';
      return;
    }

    try {
      await onAdd(selectedFiles);
    } catch (addError) {
      setLocalError(
        addError instanceof Error
          ? addError.message
          : 'Não foi possível adicionar o arquivo.',
      );
    } finally {
      event.target.value = '';
    }
  }

  async function handleRemove(item: UploadItem) {
    setLocalError(undefined);

    try {
      await onRemove(item);
    } catch (removeError) {
      setLocalError(
        removeError instanceof Error
          ? removeError.message
          : 'Não foi possível atualizar o arquivo.',
      );
    }
  }

  const visibleError = localError || error;

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-5 shadow-sm">
      <label
        className={`block cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all hover:border-blue-400 hover:bg-blue-50/40 ${
          visibleError
            ? 'border-red-400 bg-red-50/30'
            : 'border-slate-300 bg-slate-50'
        }`}
        title="Arquivos permitidos: PDF, DOC, DOCX, PNG e JPG/JPEG."
      >
        <span className="mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <UploadCloud size={20} aria-hidden="true" />
        </span>
        <span className="block font-semibold text-slate-900">
          Anexar documentos comprobatórios
        </span>
        <p className="mt-1 text-sm text-slate-500">
          PDF, DOC, DOCX, PNG e JPG/JPEG — até {maxTotalSizeMB} MB no total
        </p>
        <span className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
          Selecionar arquivos
        </span>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
        />
      </label>

      {visibleError && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle
            className="mt-0.5 shrink-0"
            size={16}
            aria-hidden="true"
          />
          <p>{visibleError}</p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="mt-5 space-y-3" aria-label="Arquivos anexados">
          {items.map((item) => {
            const isProcessing =
              item.status === 'uploading' || item.status === 'deleting';
            const isUndo = item.status === 'pending_delete';

            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <FileText size={19} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-slate-900"
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    {item.size !== undefined && (
                      <span className="text-slate-500">
                        {formatFileSize(item.size)}
                      </span>
                    )}
                    {getStatusContent(item)}
                  </div>

                  {item.status === 'uploading' && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />
                    </div>
                  )}

                  {item.error && (
                    <p className="mt-1 text-xs text-red-600">{item.error}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void handleRemove(item)}
                  disabled={isProcessing}
                  aria-label={`${isUndo ? 'Desfazer exclusão de' : 'Excluir'} ${item.name}`}
                  title={isUndo ? 'Desfazer exclusão' : 'Excluir arquivo'}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isUndo ? (
                    <RotateCcw size={17} aria-hidden="true" />
                  ) : (
                    <Trash2 size={17} aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default FileUpload;
