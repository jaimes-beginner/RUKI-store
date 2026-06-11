// @vitest-environment jsdom

import React from 'react';
import { cleanup, render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
// @vitest-environment jsdom

import React from 'react';
import { cleanup, render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { FooterAdmin } from './components/admin/footer/FooterAdmin';

// Mock simple de framer-motion para evitar animaciones en los tests.
// Reemplazamos `motion.a` por un <a> normal que solo muestra su contenido.
vi.mock('framer-motion', () => ({
  motion: {
    a: ({ children, whileHover, ...props }) => <a {...props}>{children}</a>,
  },
}));

// Borra los elementos del DOM después de cada test para que no interfieran.
afterEach(() => {
  cleanup();
});

// Conjunto de tests del componente FooterAdmin.
describe('FooterAdmin', () => {
  // Función que renderiza el componente dentro de un router de memoria.
  // Necesario porque el footer usa enlaces y queremos simular navegación.
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <FooterAdmin />
      </MemoryRouter>,
    );

  // Verifica que muestra el título y los textos importantes del footer.
  it('renders the admin brand and main copy', () => {
    const { getByRole, getByText } = renderComponent();

    // Busca un heading con texto 'Zona Admin RUKI' y nivel 5.
    expect(
      getByRole('heading', { name: /zona admin ruki/i, level: 5 }),
    ).toBeInTheDocument();

    // Verifica frases específicas que deben aparecer en el footer.
    expect(
      getByText(/se forjan atletas, gestionando el éxito desde el estilo\./i),
    ).toBeInTheDocument();
    expect(
      getByText(/gestionando la comunidad de ruki, un wod a la vez\./i),
    ).toBeInTheDocument();
  });

  // Comprueba que los enlaces principales llevan a las rutas correctas.
  it('renders the expected navigation links', () => {
    const { getByRole } = renderComponent();

    // Comprueba que el enlace a la tienda pública existe y apunta a '/'.
    expect(getByRole('link', { name: /ver tienda pública/i })).toHaveAttribute(
      'href',
      '/',
    );

    // Comprueba que el enlace a la gestión de productos apunta a '/inventario-admin'.
    expect(getByRole('link', { name: /gestión de productos/i })).toHaveAttribute(
      'href',
      '/inventario-admin',
    );
  });

  // Comprueba que el copyright incluye el año actual.
  it('renders the current year in the copyright', () => {
    const { getByText } = renderComponent();

    const currentYear = new Date().getFullYear();
    // Buscamos el año actual en el texto, sin importar espacios o formato.
    expect(
      getByText(
        new RegExp(`©\\s*${currentYear}\\s*RUKI\\. Panel de Administración\\.`, 'i'),
      ),
    ).toBeInTheDocument();
  });

  // Verifica que ciertos enlaces secundarios estén marcados como deshabilitados.
  // Se usan como marcadores (por ejemplo, "Próximamente").
  it('marks the secondary links as disabled styling placeholders', () => {
    const { getByRole } = renderComponent();

    expect(getByRole('link', { name: /blog \(próximamente\)/i })).toHaveClass(
      'disabled-link',
    );
    expect(getByRole('link', { name: /soporte técnico/i })).toHaveClass(
      'disabled-link',
    );
    expect(getByRole('link', { name: /política de privacidad/i })).toHaveClass(
      'disabled-link',
    );
    expect(getByRole('link', { name: /términos de uso/i })).toHaveClass(
      'disabled-link',
    );
  });

  // Verifica que hay 4 enlaces de iconos sociales con la clase correcta.
  it('renders the four social icon links', () => {
    const { container } = renderComponent();

    expect(container.querySelectorAll('a.admin-social-icon')).toHaveLength(4);
  });
});