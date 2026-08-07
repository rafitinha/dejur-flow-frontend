import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FileUpload } from '@/components/forms/checklist/FileUpload';
import type { UploadItem } from '@/types/upload';

describe('FileUpload', () => {
  it('delega a remoção sem alterar os itens recebidos', async () => {
    const item: UploadItem = {
      id: 'doc-1',
      documentId: 'doc-1',
      name: 'contrato.pdf',
      size: 1024,
      status: 'existing',
    };
    const onRemove = vi.fn();

    render(<FileUpload items={[item]} onAdd={vi.fn()} onRemove={onRemove} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Excluir contrato.pdf' }),
    );

    await waitFor(() => expect(onRemove).toHaveBeenCalledWith(item));
    expect(screen.getByText('contrato.pdf')).toBeInTheDocument();
    expect(screen.getByText('Já anexado')).toBeInTheDocument();
  });

  it('delega novos arquivos e só os exibe quando chegam por props', async () => {
    const file = new File(['conteúdo'], 'evidencia.pdf', {
      type: 'application/pdf',
      lastModified: 1,
    });
    const onAdd = vi.fn();
    const { container, rerender } = render(
      <FileUpload items={[]} onAdd={onAdd} onRemove={vi.fn()} />,
    );
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');

    expect(input).not.toBeNull();
    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith([file]));
    expect(screen.queryByText('evidencia.pdf')).not.toBeInTheDocument();

    rerender(
      <FileUpload
        items={[
          {
            id: 'new-1',
            file,
            name: file.name,
            type: file.type,
            size: file.size,
            status: 'pending_upload',
          },
        ]}
        onAdd={onAdd}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('evidencia.pdf')).toBeInTheDocument();
    expect(screen.getByText('Será enviado na confirmação')).toBeInTheDocument();
  });

  it('renderiza exclusão pendente como ação reversível', () => {
    render(
      <FileUpload
        items={[
          {
            id: 'doc-2',
            documentId: 'doc-2',
            name: 'notificacao.pdf',
            status: 'pending_delete',
          },
        ]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Será removido na confirmação'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Desfazer exclusão de notificacao.pdf',
      }),
    ).toBeInTheDocument();
  });
});
