import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Navbar } from '@/components/layout/Navbar';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const signOutMock = vi.fn();
const useSessionMock = vi.fn();

vi.mock('next-auth/react', () => ({
  useSession: () => useSessionMock(),
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

describe('Navbar', () => {
  beforeEach(() => {
    signOutMock.mockReset();
    useSessionMock.mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Maria Silva', email: 'maria@empresa.com' } },
    });
  });

  it('abre o menu de configurações e faz logout da aplicação', async () => {
    render(<Navbar />);

    fireEvent.click(screen.getByLabelText('Configurações'));

    fireEvent.click(screen.getByRole('menuitem', { name: /logout/i }));

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledWith({
        redirect: false,
        callbackUrl: '/',
      });
    });
  });
});
