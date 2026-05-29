// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NavbarAdmin } from './NavbarAdmin';
import { useAuth } from '../../../contexts/AuthContext';

const mockNavigate = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, animate, initial, exit, transition, ...props }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('NavbarAdmin', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      logout: mockLogout,
      usuario: { firstName: 'Carlos', email: 'carlos@ruki.com' },
    });

    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <NavbarAdmin />
      </MemoryRouter>,
    );

  it('renders user info from auth context', () => {
    const { getByText } = renderComponent();

    expect(getByText('C')).toBeInTheDocument();
    expect(getByText('Carlos')).toBeInTheDocument();
  });

  it('uses fallback user info when usuario is missing', () => {
    useAuth.mockReturnValue({
      logout: mockLogout,
      usuario: null,
    });

    const { getByText } = renderComponent();

    expect(getByText('A')).toBeInTheDocument();
    expect(getByText('Administrador')).toBeInTheDocument();
  });

  it('opens the admin menu when clicking the profile toggle', () => {
    const { container, queryByText, getByText } = renderComponent();

    expect(queryByText('carlos@ruki.com')).not.toBeInTheDocument();

    const profileButton = container.querySelector('.admin-dropdown-toggle');
    expect(profileButton).toBeInTheDocument();
    fireEvent.click(profileButton);

    expect(getByText('CONECTADO COMO')).toBeInTheDocument();
    expect(getByText('carlos@ruki.com')).toBeInTheDocument();
    expect(getByText(/cerrar sesión/i)).toBeInTheDocument();
  });

  it('logs out and navigates to login when confirmation is accepted', () => {
    const { container, getByRole } = renderComponent();

    const profileButton = container.querySelector('.admin-dropdown-toggle');
    expect(profileButton).toBeInTheDocument();
    fireEvent.click(profileButton);

    fireEvent.click(getByRole('button', { name: /cerrar sesión/i }));

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Estás seguro de cerrar sesión en la consola de administrador?',
    );
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('does not log out when confirmation is canceled', () => {
    window.confirm.mockImplementation(() => false);

    const { container, getByRole } = renderComponent();

    const profileButton = container.querySelector('.admin-dropdown-toggle');
    expect(profileButton).toBeInTheDocument();
    fireEvent.click(profileButton);

    fireEvent.click(getByRole('button', { name: /cerrar sesión/i }));

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders all primary navigation links', () => {
    const { getByRole } = renderComponent();

    expect(getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /productos/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /usuarios/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /logística/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /pos \/ tienda/i })).toBeInTheDocument();
  });
});
