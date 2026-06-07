// @vitest-environment jsdom

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PantallaInicio from './PantallaInicio';
import { useAuth } from '../../../contexts/AuthContext';

// Mock del contexto de autenticación
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock ligero de framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('PantallaInicio', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra botones de auth cuando no está autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, usuario: null });

    render(
      <MemoryRouter>
        <PantallaInicio />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Explorar Colección/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear Cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
  });

  it('muestra panel de control cuando está autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, usuario: { role: 'CUSTOMER' } });

    render(
      <MemoryRouter>
        <PantallaInicio />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Mi Panel de Control/i)).toBeInTheDocument();
  });
});
