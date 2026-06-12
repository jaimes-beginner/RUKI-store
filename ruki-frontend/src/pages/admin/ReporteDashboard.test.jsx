// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage'; // <-- Importación actualizada
import { obtenerTodosLosProductosAdmin } from '@/services/ProductoService'; // <-- Alias
import { obtenerUsuarios } from '@/services/UsuarioService'; // <-- Alias
import { obtenerPedidoPorId, obtenerTodosLosPedidos } from '@/services/PedidoService'; // <-- Alias

// Mocks actualizados con el alias @/
vi.mock('@/services/ProductoService', () => ({
  obtenerTodosLosProductosAdmin: vi.fn(), // <-- Actualizado al nombre correcto de la función
}));

vi.mock('@/services/UsuarioService', () => ({
  obtenerUsuarios: vi.fn(),
}));

vi.mock('@/services/PedidoService', () => ({
  obtenerPedidoPorId: vi.fn(),
  obtenerTodosLosPedidos: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, variants, whileHover, whileTap, ...props }) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, initial, animate, exit, transition, variants, whileHover, whileTap, ...props }) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockProductos = [
  { id: 1, name: 'Polera RUKI CrossFit', stock: 10 },
  { id: 2, name: 'Short Tecnico Savage', stock: 3 },
  { id: 3, name: 'Munequeras Heavy Duty', stock: 2 },
];

const mockUsuarios = [
  { id: 1, email: 'atleta1@gmail.com' },
  { id: 2, email: 'atleta2@gmail.com' },
];

const mockPedidos = [
  { id: 101, estado: 'COMPLETED', montoTotal: 45000, fechaPedido: '2026-05-20' },
  { id: 102, estado: 'PENDIENTE', montoTotal: 25000, fechaPedido: '2026-05-25' },
  { id: 103, status: 'CANCELED', totalAmount: 15000, createdAt: '2026-05-26' },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('DashboardPage', () => { // <-- Nombre actualizado
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerTodosLosProductosAdmin.mockResolvedValue(mockProductos); // <-- Actualizado
    obtenerUsuarios.mockResolvedValue(mockUsuarios);
    obtenerTodosLosPedidos.mockResolvedValue(mockPedidos);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

  it('shows initial loading state and then renders calculated KPIs', async () => {
    const { getByText, queryByText, getAllByText } = renderComponent();

    expect(getByText(/sincronizando red de datos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(queryByText(/sincronizando red de datos/i)).not.toBeInTheDocument();
    });

    expect(getByText('Inventario Total')).toBeInTheDocument();
    expect(getByText('Base de Usuarios')).toBeInTheDocument();
    expect(getByText(/Pedidos Pendientes/i)).toBeInTheDocument();

    expect(getAllByText(/\$\s?45\.000/i).length).toBeGreaterThan(0);
    expect(getAllByText('2').length).toBeGreaterThan(0);
    expect(getAllByText('3').length).toBeGreaterThan(0);
    expect(getAllByText('1').length).toBeGreaterThan(0);
  });

  it('calculates inventory health percentages correctly', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(/33%\s*(optimo|óptimo)/i)).toBeInTheDocument();
      expect(getByText(/2 productos requieren reabastecimiento/i)).toBeInTheDocument();
    });
  });

  it('lists latest orders in recent activity table', async () => {
    const { getByText, getAllByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('#101')).toBeInTheDocument();
      expect(getByText('#102')).toBeInTheDocument();
      expect(getByText('#103')).toBeInTheDocument();
    });

    expect(getByText('OK')).toBeInTheDocument();
    expect(getByText('CANCELADO')).toBeInTheDocument();
    expect(getAllByText('PENDIENTE').length).toBeGreaterThan(0);
  });

  it('tracks an order by ID successfully', async () => {
    const mockPedidoIndividual = {
      id: 15,
      estado: 'PENDING',
      montoTotal: 60000,
      detalles: [
        { productoId: 1, cantidad: 2, subTotal: 40000 },
        { productoId: 2, cantidad: 1, precioEnCompra: 20000 },
      ],
    };

    obtenerPedidoPorId.mockResolvedValue(mockPedidoIndividual);

    const { getByPlaceholderText, getByRole, getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Centro de Control')).toBeInTheDocument();
    });

    fireEvent.change(getByPlaceholderText(/ej: 15\.\.\./i), {
      target: { value: '15' },
    });

    fireEvent.click(getByRole('button', { name: /rastrear/i }));

    expect(obtenerPedidoPorId).toHaveBeenCalledWith('15');

    await waitFor(() => {
      expect(getByText('Orden #15')).toBeInTheDocument();
      expect(getByText(/\$\s?60\.000/i)).toBeInTheDocument();
      expect(getByText('Polera RUKI CrossFit')).toBeInTheDocument();
      expect(getByText('x2')).toBeInTheDocument();
    });
  });

  it('shows controlled message when tracker returns 404', async () => {
    obtenerPedidoPorId.mockRejectedValue({ status: 404 });

    const { getByPlaceholderText, getByRole, getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Centro de Control')).toBeInTheDocument();
    });

    fireEvent.change(getByPlaceholderText(/ej: 15\.\.\./i), {
      target: { value: '999' },
    });

    fireEvent.click(getByRole('button', { name: /rastrear/i }));

    await waitFor(() => {
      expect(getByText('Pedido no encontrado.')).toBeInTheDocument();
    });
  });

  it('shows global error alert when initial load fails', async () => {
    const errorMensaje = 'Error critico de conexion al servidor central.';
    obtenerTodosLosPedidos.mockRejectedValue(new Error(errorMensaje));

    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(errorMensaje)).toBeInTheDocument();
    });
  });
});