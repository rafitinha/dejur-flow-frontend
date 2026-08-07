import React, { ChangeEvent, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from 'lucide-react';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

type UploadFile = {
  id: string;
  file: File;
  status: UploadStatus;
  error?: string;
};

type FileUploadProps = {
  onFiles: (files: File[]) => void | Promise<void>;
  onRemove?: (file: File) => void;
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

function createFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}

export function FileUpload({
  onFiles,
  onRemove,
  error,
  maxTotalSizeMB = 10,
  accept = DEFAULT_ACCEPT,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadFile[]>([]);
  const [localError, setLocalError] = useState<string>();
  const maxBytes = maxTotalSizeMB * 1024 * 1024;

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (!selectedFiles.length) return;

    setLocalError(undefined);

    const currentTotal = items.reduce(
      (total, item) => total + item.file.size,
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
      e.target.value = '';
      return;
    }

    const newItems: UploadFile[] = selectedFiles.map((file) => ({
      id: createFileId(file),
      file,
      status: 'uploading',
    }));

    setItems((current) => [...current, ...newItems]);

    try {
      await onFiles(selectedFiles);
      const uploadedIds = new Set(newItems.map((item) => item.id));
      setItems((current) =>
        current.map((item) =>
          uploadedIds.has(item.id)
            ? { ...item, status: 'success', error: undefined }
            : item,
        ),
      );
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : 'Não foi possível enviar o arquivo.';
      const failedIds = new Set(newItems.map((item) => item.id));
      setItems((current) =>
        current.map((item) =>
          failedIds.has(item.id)
            ? { ...item, status: 'error', error: message }
            : item,
        ),
      );
    } finally {
      e.target.value = '';
    }
  }

  function removeFile(id: string) {
    const itemToRemove = items.find((item) => item.id === id);

    if (!itemToRemove) {
      return;
    }

    setItems((currentItems) => currentItems.filter((item) => item.id !== id));

    onRemove?.(itemToRemove.file);
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
          {items.map((item) => (
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
                  title={item.file.name}
                >
                  {item.file.name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-slate-500">
                    {formatFileSize(item.file.size)}
                  </span>

                  {item.status === 'uploading' && (
                    <span className="inline-flex items-center gap-1 text-blue-600">
                      <LoaderCircle
                        className="animate-spin"
                        size={13}
                        aria-hidden="true"
                      />
                      Processando...
                    </span>
                  )}

                  {item.status === 'success' && (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 size={13} aria-hidden="true" />
                      Adicionado
                    </span>
                  )}

                  {item.status === 'error' && (
                    <span
                      className="inline-flex items-center gap-1 text-red-600"
                      title={item.error}
                    >
                      <AlertCircle size={13} aria-hidden="true" />
                      Erro no envio
                    </span>
                  )}
                </div>

                {item.status === 'uploading' && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />
                  </div>
                )}

                {item.status === 'error' && item.error && (
                  <p className="mt-1 text-xs text-red-600">{item.error}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeFile(item.id)}
                disabled={item.status === 'uploading'}
                aria-label={`Excluir ${item.file.name}`}
                title={
                  item.status === 'uploading'
                    ? 'Aguarde o envio terminar'
                    : 'Excluir arquivo'
                }
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FileUploadPreview() {
  async function uploadFiles(files: File[]) {
    await new Promise((resolve) => setTimeout(resolve, 1600));

    // Substitua pela sua chamada real. Exemplo:
    // const formData = new FormData();
    // files.forEach((file) => formData.append('files', file));
    // const response = await fetch('/api/upload', { method: 'POST', body: formData });
    // if (!response.ok) throw new Error('Falha ao enviar os arquivos.');
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 sm:p-10">
      <FileUpload
        onFiles={uploadFiles}
        onRemove={(file) => console.log('Arquivo removido:', file.name)}
      />
    </main>
  );
}
