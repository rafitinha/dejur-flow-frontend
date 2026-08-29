import { ChecklistType } from '@/features/requests/types';
import { step2Strategies } from './validation';
import { WizardFormData } from './types';

export function ReviewSection({
  checklistType,
  attachedFiles,
  formData,
}: {
  checklistType?: ChecklistType;
  attachedFiles: File[];
  formData: WizardFormData;
}) {
  const strategy = checklistType ? step2Strategies[checklistType] : undefined;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Revisão Final</h2>

      {/* Tipo */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 font-semibold">Dados da Solicitação</h3>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <span className="text-sm text-muted-foreground">Tipo de ação</span>

            <p className="font-medium">{checklistType ?? '-'}</p>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">
              Quantidade de anexos
            </span>

            <p className="font-medium">{attachedFiles.length}</p>
          </div>
        </div>
      </section>

      {/* Empresa */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 font-semibold">Empresa GEQ</h3>

        <div className="grid gap-3 md:grid-cols-2">
          <ReviewField label="Razão Social" value={formData.companyLegalName} />

          <ReviewField label="CNPJ" value={formData.companyCnpj} />

          <ReviewField label="UF" value={formData.companyUf} />

          <ReviewField label="Cidade" value={formData.companyCity} />
        </div>
      </section>

      {/* Devedora */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 font-semibold">Dados da Devedora</h3>

        <div className="grid gap-3 md:grid-cols-2">
          <ReviewField
            label="Nome empresarial"
            value={formData.debtorLegalName}
          />

          <ReviewField label="CNPJ" value={formData.debtorCnpj} />

          <ReviewField label="Endereço" value={formData.debtorAddress} />

          <ReviewField
            label="Confirmado por"
            value={formData.addressConfirmedBy}
          />

          <ReviewField label="Cargo" value={formData.addressConfirmedByRole} />

          <ReviewField
            label="Data da confirmação"
            value={formData.addressConfirmedByDate}
          />
        </div>
      </section>

      {/* Campos específicos */}
      {strategy && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold">Informações Específicas</h3>

          <div className="grid gap-3 md:grid-cols-2">
            {strategy.fields.map((field) => {
              const value = formData[field.key];
              const stringValue =
                typeof value === 'boolean'
                  ? value
                    ? 'Sim'
                    : 'Não'
                  : String(value || '-');

              return (
                <ReviewField
                  key={String(field.key)}
                  label={field.label}
                  value={stringValue}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Tentativas */}
      <ReviewTextSection
        title="Tentativas de Acordo e Cobrança"
        value={formData.agreementDetails}
      />

      {/* Financeiro */}
      <ReviewTextSection
        title="Valores, Índices e Atualização"
        value={
          [
            formData.financialValue ? `Valor: ${formData.financialValue}` : '',
            formData.financialIndex ? `Índice: ${formData.financialIndex}` : '',
            formData.financialUpdatedDate
              ? `Data de atualização: ${formData.financialUpdatedDate}`
              : '',
            formData.financialDetails,
          ]
            .filter(Boolean)
            .join('\n') || undefined
        }
      />

      {/* Fatos */}
      <ReviewTextSection
        title="Resumo dos Fatos"
        value={formData.factsSummary}
      />

      {/* Parecer */}
      <ReviewTextSection
        title="Parecer da Área Responsável"
        value={formData.opinionDetails}
      />

      {/* Arquivos */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 font-semibold">Documentos Anexados</h3>

        {attachedFiles.length === 0 ? (
          <p className="text-muted-foreground">Nenhum documento anexado.</p>
        ) : (
          <ul className="space-y-2">
            {attachedFiles.map((file) => (
              <li
                key={`${file.name}-${file.lastModified}`}
                className="rounded border p-2"
              >
                <div className="font-medium">{file.name}</div>

                <div className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="rounded-md border border-warning/45 bg-warning/10 p-4 text-sm text-warning">
        Revise atentamente todas as informações antes de confirmar o envio. Após
        o processamento não será possível reenviar ou alterar os dados
        informados nesta solicitação.
      </div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{value || '-'}</div>
    </div>
  );
}

function ReviewTextSection({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold">{title}</h3>

      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {value || '-'}
      </div>
    </section>
  );
}
