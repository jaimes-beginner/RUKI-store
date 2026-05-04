import React from 'react'
import BlogPagina from '../../components/usuario/blog/BlogPagina'
import NavbarUsuario from '../../components/usuario/navbar/NavabarUsuarios'
import FooterUsuario from '../../components/usuario/footer/FooterUsuario'

export function PaginaBlogCliente() {
  return (
    <>
      <NavbarUsuario />
      <BlogPagina />
      <FooterUsuario />
    </>
  )
}
