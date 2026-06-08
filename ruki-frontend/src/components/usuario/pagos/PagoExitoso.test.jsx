// @vitest-environment jsdom

import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks
const mockNavigate = vi.fn();
const mockClearCart = vi.fn();

vi.mock('../../../contexts/CartContext', () => ({
  useCart: () => ({ clearCart: mockClearCart }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams({ orderId: '12345' })],
  };
});

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('PagoExitoso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('vacía el carrito al montarse y muestra número de orden, y botones navegan', async () => {
    const mod = await vi.importActual('./PagoExitoso');
    const PagoExitoso = mod.default || mod.PagoExitoso;

    render(<PagoExitoso />);

    expect(mockClearCart).toHaveBeenCalled();

    // orderId aparece con '#12345'
    expect(screen.getByText(/#12345/)).toBeTruthy();

    // Botones navegan correctamente
    const seguirComprar = screen.getByText(/Seguir comprando/i);
    const volverInicio = screen.getByText(/Volver al inicio/i);

    fireEvent.click(seguirComprar);
    expect(mockNavigate).toHaveBeenCalledWith('/productos');

    fireEvent.click(volverInicio);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
