import {
  BadgeCheck,
  Building2,
  ClipboardList,
  FileText,
  Handshake,
  ListChecks,
  Paperclip,
  Scale,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type WizardStepDefinition = {
  title: string;
  shortTitle?: string;
  icon: LucideIcon;
};

export const wizardStepDefinitions = [
  { title: 'Tipo', shortTitle: 'Tipo', icon: FileText },
  { title: 'Empresa', shortTitle: 'Empresa', icon: Building2 },
  { title: 'Dados', shortTitle: 'Dados', icon: ClipboardList },
  { title: 'Acordo', shortTitle: 'Acordo', icon: Handshake },
  { title: 'Valores', shortTitle: 'Valores', icon: Wallet },
  { title: 'Resumo', shortTitle: 'Resumo', icon: ListChecks },
  { title: 'Parecer', shortTitle: 'Parecer', icon: Scale },
  { title: 'Documentos', shortTitle: 'Documentos', icon: Paperclip },
  { title: 'Confirmação', shortTitle: 'Confirmação', icon: BadgeCheck },
] as const satisfies readonly WizardStepDefinition[];
