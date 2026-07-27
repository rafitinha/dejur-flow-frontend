import { render, screen } from '@testing-library/react';
import { vi, describe, expect, it } from 'vitest';
import { Profile } from '@/components/auth/Profile';
vi.mock('next-auth/react', () => ({ useSession: vi.fn(() => ({ status: 'authenticated', data: { user: { name: 'Maria Silva', email: 'maria@empresa.com', roles: [], groups: [] } } })) }));
describe('Profile', () => {
  it('renderiza nome, email e avatar fallback', () => {
    render(<Profile />); expect(screen.getByText('Maria Silva')).toBeInTheDocument(); expect(screen.getByText('maria@empresa.com')).toBeInTheDocument(); expect(screen.getByText('MS')).toBeInTheDocument();
  });
});
