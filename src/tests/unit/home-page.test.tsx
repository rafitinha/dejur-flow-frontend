import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/page';

const replaceMock = vi.fn();
const useSessionMock = vi.fn();

vi.mock('next-auth/react', () => ({
  useSession: () => useSessionMock(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock('@/features/privacy/CookieConsentClient', () => ({
  CookieConsentClient: () => <div data-testid="cookie-banner" />,
}));

describe('HomePage', () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  it('redireciona para a dashboard quando há sessão autenticada', async () => {
    useSessionMock.mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Teste' } },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('mostra os botões de entrada quando não há sessão', () => {
    useSessionMock.mockReturnValue({ status: 'unauthenticated', data: null });

    render(<HomePage />);

    expect(
      screen.getByRole('link', { name: /entrar com microsoft/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /acessar ambiente/i }),
    ).toBeInTheDocument();
  });
});
