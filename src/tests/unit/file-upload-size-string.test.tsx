import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FileUpload from '@/components/forms/checklist/FileUpload';

const makeFile = (name: string, size: number) =>
  new File([new Uint8Array(size)], name, { type: 'application/pdf' });

describe('FileUpload total size validation', () => {
  it('não trata itens existentes com size em string como concatenação', async () => {
    render(
      <FileUpload
        items={[
          {
            id: 'existing-1',
            name: 'contrato.pdf',
            type: 'application/pdf',
            size: '245760',
            status: 'existing',
            downloadUrl: 'http://localhost:8080/mock-download/contrato.pdf',
          },
        ]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const newFile = makeFile('novo.pdf', 100);

    fireEvent.change(input, { target: { files: [newFile] } });

    expect(
      screen.queryByText(/O tamanho total dos arquivos deve ser de até/i),
    ).not.toBeInTheDocument();
  });
});
