import type { Metadata } from 'next';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

const headingFont = Manrope({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Validador de Ações Judiciais',
  description: 'Sistema de checklist e validação de ações judiciais com LLM.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
