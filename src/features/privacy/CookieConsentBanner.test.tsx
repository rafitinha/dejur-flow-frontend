import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CookieConsentBanner } from './CookieConsentBanner';

const mockUsePathname = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUsePathname.mockReturnValue('/');
  });

  it('renderiza o banner na tela de entrada e salva consentimento ao aceitar todos', () => {
    render(<CookieConsentBanner />);

    expect(screen.getByText(/privacidade e cookies/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /aceitar todos/i }));

    expect(
      screen.queryByText(/privacidade e cookies/i),
    ).not.toBeInTheDocument();

    const stored = JSON.parse(
      localStorage.getItem('validador-consent') ?? 'null',
    );
    expect(stored).not.toBeNull();
    expect(stored.preferences.functional).toBe(true);
    expect(stored.preferences.analytics).toBe(true);
    expect(stored.preferences.marketing).toBe(true);
  });

  it('abre o modal de preferências e salva uma escolha customizada', () => {
    render(<CookieConsentBanner />);

    fireEvent.click(
      screen.getByRole('button', { name: /configurar cookies/i }),
    );

    expect(screen.getByText(/preferências de cookies/i)).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    fireEvent.click(
      screen.getByRole('button', { name: /salvar preferências/i }),
    );

    const stored = JSON.parse(
      localStorage.getItem('validador-consent') ?? 'null',
    );
    expect(stored).not.toBeNull();
    expect(stored.preferences.functional).toBe(true);
  });

  it('não renderiza o banner fora das telas de entrada', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(<CookieConsentBanner />);

    expect(
      screen.queryByText(/privacidade e cookies/i),
    ).not.toBeInTheDocument();
  });
});
