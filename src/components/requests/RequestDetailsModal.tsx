'use client';

import { useEffect, useMemo } from 'react';
import {
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { StatusTag } from '@/components/ui/StatusTag';
import type {
  JudicialRequestDetail,
  RequestDocument,
} from '@/features/requests/types';
import { buildRequestReviewSections } from '@/features/requests/clipboard';
import type { ReviewTextSection } from '@/features/requests/clipboard';

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatBytes(size?: number | string) {
  if (size === undefined || size === null || size === '') return '-';

  const numericSize = typeof size === 'string' ? Number(size) : size;
  if (Number.isNaN(numericSize)) return '-';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = numericSize;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export type RequestDetailsModalProps = {
  open: boolean;
  request: JudicialRequestDetail | null;
  loading: boolean;
  error?: string | null;
  exportingFormat?: 'pdf' | 'csv' | 'excel' | null;
  downloadingDocumentId?: string | null;
  isCopying?: boolean;
  hasCopied?: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onExportPdf: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  onDownloadDocument: (documentId: string) => void;
  onCopyContent: () => void;
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <CardHeader className="mb-3">
        <CardTitle className="text-base text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1 break-words">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-medium text-foreground">{value ?? '-'}</div>
    </div>
  );
}

function ReviewDisplay({ sections }: { sections: ReviewTextSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <SectionCard key={section.title} title={section.title}>
          {section.fields?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {section.fields.map((field) => (
                <InfoRow
                  key={`${section.title}-${field.label}`}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </div>
          ) : null}
          {section.paragraphs?.length ? (
            <div className="space-y-2">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="whitespace-pre-wrap text-sm leading-relaxed text-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
          {section.items?.length ? (
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="rounded border border-border bg-muted/40 p-2 text-sm text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </SectionCard>
      ))}
    </div>
  );
}

export function RequestDetailsModal({
  open,
  request,
  loading,
  error,
  exportingFormat,
  downloadingDocumentId,
  isCopying,
  hasCopied,
  onClose,
  onRetry,
  onExportPdf,
  onExportCsv,
  onExportExcel,
  onDownloadDocument,
  onCopyContent,
}: RequestDetailsModalProps) {
  const sections = useMemo(() => {
    if (!request) return [];
    return buildRequestReviewSections(request);
  }, [request]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title="Detalhes da solicitação"
      description="Revise os dados da solicitação e realize ações de exportação, download e cópia estruturada."
    >
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-6 text-center">
            <Loader2 size={22} className="animate-spin text-primary" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Carregando dados da solicitação...
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Aguarde enquanto o sistema busca as informações.
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="space-y-3 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            <p>{error}</p>
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Tentar novamente
              </Button>
            ) : null}
          </div>
        ) : null}

        {!loading && !error && request ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/25 p-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Solicitação {request.requestId}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusTag status={request.status} />
                  <span className="text-sm text-muted-foreground">
                    {request.checklistType}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyContent}
                  disabled={isCopying || !request}
                >
                  {isCopying ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : hasCopied ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                  {isCopying
                    ? 'Copiando...'
                    : hasCopied
                      ? 'Copiado'
                      : 'Copiar conteúdo'}
                </Button>
              </div>
            </div>

            <SectionCard title="Resumo da solicitação">
              <div className="grid gap-3 md:grid-cols-2">
                <InfoRow label="Solicitação" value={request.requestId} />
                <InfoRow
                  label="Status"
                  value={<StatusTag status={request.status} />}
                />
                <InfoRow label="Checklist" value={request.checklistType} />
                <InfoRow
                  label="Responsável"
                  value={request.createdBy?.name || '-'}
                />
                <InfoRow
                  label="Criada em"
                  value={formatDate(request.createdAt as string | undefined)}
                />
                <InfoRow
                  label="Atualizada em"
                  value={formatDate(request.updatedAt as string | undefined)}
                />
              </div>
            </SectionCard>

            <ReviewDisplay sections={sections} />

            {request.documents?.length ? (
              <SectionCard title="Documentos anexados">
                <div className="space-y-2">
                  {request.documents.map((document: RequestDocument, index) => {
                    const documentId = document.documentId || '';
                    const downloadUrl = document.downloadUrl || '';
                    const canDownloadDocument = Boolean(
                      downloadUrl || documentId,
                    );
                    const documentKey = [
                      documentId,
                      document.name || 'documento',
                      index,
                    ]
                      .filter(Boolean)
                      .join('-');

                    const handleDocumentDownload = () => {
                      if (downloadUrl) {
                        window.open(
                          downloadUrl,
                          '_blank',
                          'noopener,noreferrer',
                        );
                        return;
                      }

                      if (documentId) {
                        onDownloadDocument(documentId);
                      }
                    };

                    return (
                      <div
                        key={documentKey}
                        className="flex flex-col gap-2 rounded border border-border bg-background p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {document.name || 'Documento sem nome'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {document.type || 'Arquivo'} ·{' '}
                            {formatBytes(document.size)} ·{' '}
                            {formatDate(document.uploadedAt)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDocumentDownload}
                          disabled={
                            downloadingDocumentId === documentId ||
                            !canDownloadDocument
                          }
                        >
                          {downloadingDocumentId === documentId ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                          {downloadingDocumentId === documentId
                            ? 'Baixando...'
                            : 'Baixar'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPdf}
          disabled={loading || !request}
        >
          <FileText size={14} />
          {exportingFormat === 'pdf' ? 'Gerando PDF...' : 'Baixar PDF'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={loading || !request}
        >
          <FileText size={14} />
          {exportingFormat === 'csv' ? 'Gerando CSV...' : 'Baixar CSV'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          disabled={loading || !request}
        >
          <FileSpreadsheet size={14} />
          {exportingFormat === 'excel' ? 'Gerando Excel...' : 'Baixar Excel'}
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X size={14} /> Fechar
        </Button>
      </div>
    </Modal>
  );
}
