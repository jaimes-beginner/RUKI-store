// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NavbarAdmin } from './NavbarAdmin';
import { useAuth } from '../../../contexts/AuthContext';


// Mock para `useNavigate` de react-router, usamos una función simulada.
const mockNavigate = vi.fn();

// Mock sencillo del contexto de autenticación para controlar `useAuth`.
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Reemplazamos `useNavigate` por nuestra función mock para evitar navegación real.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock ligero de framer-motion para que las animaciones no afecten los tests.
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, animate, initial, exit, transition, ...props }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Borra el DOM y restaura mocks después de cada test.
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('NavbarAdmin', () => {
  // Función simulada para logout que usamos en los tests.
  const mockLogout = vi.fn();

  beforeEach(() => {
    // Limpiamos los mocks antes de cada test.
    vi.clearAllMocks();

    // `useAuth` devuelve un objeto con usuario y función logout.
    useAuth.mockReturnValue({
      logout: mockLogout,
      usuario: { firstName: 'Carlos', email: 'carlos@ruki.com' },
    });

    // Simulamos que confirm() devuelve true por defecto.
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  // Función que monta el componente dentro de un router de memoria.
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <NavbarAdmin />
      </MemoryRouter>,
    );

  // Test: muestra la inicial del nombre y el nombre completo del usuario.
  it('renders user info from auth context', () => {
    const { getByText } = renderComponent();

    expect(getByText('C')).toBeInTheDocument();
    expect(getByText('Carlos')).toBeInTheDocument();
  });

  // Test: usa datos por defecto si no hay `usuario` en el contexto.
  it('uses fallback user info when usuario is missing', () => {
    useAuth.mockReturnValue({
      logout: mockLogout,
      usuario: null,
    });

    const { getByText } = renderComponent();

    expect(getByText('A')).toBeInTheDocument();
    expect(getByText('Administrador')).toBeInTheDocument();
  });

  // Test: abre el menú al hacer click en el toggle de perfil.
  it('opens the admin menu when clicking the profile toggle', () => {
    const { container, queryByText, getByText } = renderComponent();

    // Antes de abrir no debe verse el correo.
    expect(queryByText('carlos@ruki.com')).not.toBeInTheDocument();

    const profileButton = container.querySelector('.admin-dropdown-toggle');
    expect(profileButton).toBeInTheDocument();
    fireEvent.click(profileButton);

    // Al abrir debe mostrarse el texto y el correo.
    expect(getByText('CONECTADO COMO')).toBeInTheDocument();
    expect(getByText('carlos@ruki.com')).toBeInTheDocument();
    expect(getByText(/cerrar sesión/i)).toBeInTheDocument();
  });

  // Test: cierra sesión y navega a /login cuando se acepta confirmación.
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

  // Test: si el usuario cancela la confirmación, no se cierra sesión.
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

  // Test: verifica que estén los enlaces principales de navegación.
  it('renders all primary navigation links', () => {
    const { getByRole } = renderComponent();

    expect(getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /productos/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /usuarios/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /logística/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /pos \/ tienda/i })).toBeInTheDocument();
  });
});
