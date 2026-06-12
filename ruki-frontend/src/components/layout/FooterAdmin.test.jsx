// @vitest-environment jsdom
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminFooter from './AdminFooter';

vi.mock('framer-motion', () => ({
  motion: {
    a: ({ children, whileHover, ...props }) => <a {...props}>{children}</a>,
  },
}));

afterEach(() => { cleanup(); });

describe('AdminFooter', () => {
  const renderComponent = () => render(<MemoryRouter><AdminFooter /></MemoryRouter>);

  it('renders the admin brand and main copy', () => {
    const { getByRole, getByText } = renderComponent();
    expect(getByRole('heading', { name: /zona admin ruki/i, level: 5 })).toBeInTheDocument();
    expect(getByText(/se forjan atletas, gestionando el éxito desde el estilo\./i)).toBeInTheDocument();
  });

  it('renders the expected navigation links', () => {
    const { getByRole } = renderComponent();
    expect(getByRole('link', { name: /ver tienda pública/i })).toHaveAttribute('href', '/');
    expect(getByRole('link', { name: /gestión de productos/i })).toHaveAttribute('href', '/admin/inventario');
  });

  it('renders the current year in the copyright', () => {
    const { getByText } = renderComponent();
    const currentYear = new Date().getFullYear();
    expect(getByText(new RegExp(`©\\s*${currentYear}\\s*RUKI\\. Panel de Administración\\.`, 'i'))).toBeInTheDocument();
  });

  it('marks the secondary links as disabled styling placeholders', () => {
    const { getByRole } = renderComponent();
    expect(getByRole('link', { name: /blog \(próximamente\)/i })).toHaveClass('disabled-link');
  });

  it('renders the four social icon links', () => {
    const { container } = renderComponent();
    expect(container.querySelectorAll('a.admin-social-icon')).toHaveLength(4);
  });
});