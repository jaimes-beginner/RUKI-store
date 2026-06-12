// @vitest-environment jsdom
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('HomePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra botones de auth cuando no está autenticado', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    useAuth.mockReturnValue({ isAuthenticated: false, usuario: null });

    render(<MemoryRouter><HomePage /></MemoryRouter>);

    expect(screen.getByText(/Explorar Colección/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear Cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
  });

  it('muestra panel de control cuando está autenticado', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    useAuth.mockReturnValue({ isAuthenticated: true, usuario: { role: 'CUSTOMER' } });

    render(<MemoryRouter><HomePage /></MemoryRouter>);

    expect(screen.getByText(/Mi Panel de Control/i)).toBeInTheDocument();
  });
});