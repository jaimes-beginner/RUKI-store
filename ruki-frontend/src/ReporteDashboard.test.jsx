// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ReporteDashboard } from './components/admin/gestion/ReporteDashboard';
import { obtenerProductosActivos } from './services/ProductoService';
import { obtenerUsuarios } from './services/UsuarioService';
import { obtenerPedidoPorId, obtenerTodosLosPedidos } from './services/PedidoService';

// Mock del servicio de productos: devuelve datos simulados para los tests.
vi.mock('../../../services/ProductoService', () => ({
  obtenerProductosActivos: vi.fn(),
}));

// Mock del servicio de usuarios: evita llamadas reales al backend.
vi.mock('../../../services/UsuarioService', () => ({
  obtenerUsuarios: vi.fn(),
}));

// Mock del servicio de pedidos: controlamos respuestas para distintos escenarios.
vi.mock('../../../services/PedidoService', () => ({
  obtenerPedidoPorId: vi.fn(),
  obtenerTodosLosPedidos: vi.fn(),
}));

// Mock simple de framer-motion para que los componentes animados no fallen en tests.
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

// Datos simulados usados por las pruebas: productos, usuarios y pedidos.
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

// Limpia el DOM después de cada test y restaura mocks para empezar limpio.
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ReporteDashboard', () => {
  // Antes de cada test: limpiamos mocks y devolvemos los datos simulados.
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerProductosActivos.mockResolvedValue(mockProductos);
    obtenerUsuarios.mockResolvedValue(mockUsuarios);
    obtenerTodosLosPedidos.mockResolvedValue(mockPedidos);
  });

  // Función que monta el componente dentro de un router de memoria.
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ReporteDashboard />
      </MemoryRouter>,
    );

  // Test: muestra un estado de carga y luego KPIs calculados.
  it('shows initial loading state and then renders calculated KPIs', async () => {
    const { getByText, queryByText, getAllByText } = renderComponent();

    // Verificamos que primero aparece el texto de carga.
    expect(getByText(/sincronizando red de datos/i)).toBeInTheDocument();

    // Esperamos que la carga desaparezca.
    await waitFor(() => {
      expect(queryByText(/sincronizando red de datos/i)).not.toBeInTheDocument();
    });

    // Comprobamos que se muestren los títulos de los KPIs.
    expect(getByText('Inventario Total')).toBeInTheDocument();
    expect(getByText('Base de Usuarios')).toBeInTheDocument();
    expect(getByText(/Pedidos Pendientes/i)).toBeInTheDocument();

    // Revisamos algunos valores que deberían aparecer (monto y contadores).
    expect(getAllByText(/\$\s?45\.000/i).length).toBeGreaterThan(0);
    expect(getAllByText('2').length).toBeGreaterThan(0);
    expect(getAllByText('3').length).toBeGreaterThan(0);
    expect(getAllByText('1').length).toBeGreaterThan(0);
  });

  // Test: comprueba porcentajes de salud del inventario.
  it('calculates inventory health percentages correctly', async () => {
    const { getByText, getAllByText } = renderComponent();

    // Esperamos que se renderice el porcentaje y el mensaje de reabastecimiento.
    await waitFor(() => {
      expect(getByText(/33%\s*(optimo|óptimo)/i)).toBeInTheDocument();
      expect(getByText(/2 productos requieren reabastecimiento/i)).toBeInTheDocument();
    });
  });

  // Test: lista los pedidos recientes en la tabla de actividad.
  it('lists latest orders in recent activity table', async () => {
    const { getByText, getAllByText } = renderComponent();

    // Esperamos que los IDs de pedido estén visibles.
    await waitFor(() => {
      expect(getByText('#101')).toBeInTheDocument();
      expect(getByText('#102')).toBeInTheDocument();
      expect(getByText('#103')).toBeInTheDocument();
    });

    // Verificamos distintos estados que deben mostrarse en la tabla.
    expect(getByText('OK')).toBeInTheDocument();
    expect(getByText('CANCELADO')).toBeInTheDocument();
    expect(getAllByText('PENDIENTE').length).toBeGreaterThan(0);
  });

  // Test: rastrea un pedido por ID y muestra sus detalles.
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

    // Simulamos que la API devuelve el pedido solicitado.
    obtenerPedidoPorId.mockResolvedValue(mockPedidoIndividual);

    const { getByPlaceholderText, getByRole, getByText } = renderComponent();

    // Esperamos que el dashboard principal esté listo.
    await waitFor(() => {
      expect(getByText('Centro de Control')).toBeInTheDocument();
    });

    // Ingresamos un ID y pulsamos rastrear.
    fireEvent.change(getByPlaceholderText(/ej: 15\.\.\./i), {
      target: { value: '15' },
    });

    fireEvent.click(getByRole('button', { name: /rastrear/i }));

    // Verificamos que se llamó al servicio con el ID correcto.
    expect(obtenerPedidoPorId).toHaveBeenCalledWith('15');

    // Esperamos que los detalles del pedido aparezcan.
    await waitFor(() => {
      expect(getByText('Orden #15')).toBeInTheDocument();
      expect(getByText(/\$\s?60\.000/i)).toBeInTheDocument();
      expect(getByText('Polera RUKI CrossFit')).toBeInTheDocument();
      expect(getByText('x2')).toBeInTheDocument();
    });
  });

  // Test: muestra mensaje claro cuando no se encuentra el pedido (404).
  it('shows controlled message when tracker returns 404', async () => {
    // Simulamos que la búsqueda por ID falla con 404.
    obtenerPedidoPorId.mockRejectedValue({ status: 404 });

    const { getByPlaceholderText, getByRole, getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Centro de Control')).toBeInTheDocument();
    });

    fireEvent.change(getByPlaceholderText(/ej: 15\.\.\./i), {
      target: { value: '999' },
    });

    fireEvent.click(getByRole('button', { name: /rastrear/i }));

    // Esperamos que aparezca el mensaje de pedido no encontrado.
    await waitFor(() => {
      expect(getByText('Pedido no encontrado.')).toBeInTheDocument();
    });
  });

  // Test: si la carga inicial falla, debe mostrarse un error global.
  it('shows global error alert when initial load fails', async () => {
    const errorMensaje = 'Error critico de conexion al servidor central.';
    // Hacemos que la llamada a pedidos falle para ver el manejo de error.
    obtenerTodosLosPedidos.mockRejectedValue(new Error(errorMensaje));

    const { getByText } = renderComponent();

    // Esperamos que el mensaje de error se muestre.
    await waitFor(() => {
      expect(getByText(errorMensaje)).toBeInTheDocument();
    });
  });
});
