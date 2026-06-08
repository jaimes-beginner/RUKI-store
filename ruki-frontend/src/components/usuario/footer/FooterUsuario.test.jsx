/** @vitest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import Footer from './FooterUsuario';

describe('FooterUsuario', () => {
  test('renderiza logo, secciones y año actual', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByAltText('RUKI')).toBeTruthy();
    expect(screen.getByText(/TIENDA/i)).toBeTruthy();
    expect(screen.getByText(/AYUDA/i)).toBeTruthy();
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeTruthy();

    const faqLinks = screen.getAllByRole('link', { name: /faq/i });
    expect(faqLinks.length).toBeGreaterThan(0);
  });
});
