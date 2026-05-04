import React from 'react'
import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'
import FAQPagina from '../../components/usuario/faq/FAQPagina'

export function PaginaFAQCliente() {
  return (
    <>
      <NavbarUsuario />
      <FAQPagina />
      <FooterUsuario />
    </>
  )
}
