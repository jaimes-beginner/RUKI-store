import { Routes, Route } from 'react-router-dom'
import { PaginaPrincipalCliente } from './page/Cliente/PaginaPrinicpal.jsx'
import { PaginaNuevosCliente } from './page/Cliente/PaginaNuevos.jsx'
import { PaginaSaleCliente } from './page/Cliente/PaginaSale.jsx'
import { PaginaProductosCliente } from './page/Cliente/PaginaProductos.jsx'
import { PaginaBlogCliente } from './page/Cliente/BlogPagina.jsx'
import { PaginaFAQCliente } from './page/Cliente/FAQPagina.jsx'
import { CrearUsuarioAdmin } from './page/Admin/CrearUsuarioAdmin.jsx'
import { CrearReporteDashboard } from './page/Admin/CrearReporteDashboard.jsx'
import { Login } from './page/Login/LoginUsuario.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaPrincipalCliente />} />
      <Route path="/new-arrivals" element={<PaginaNuevosCliente />} />
      <Route path="/productos" element={<PaginaProductosCliente />} />
      <Route path="/noticias" element={<PaginaBlogCliente />} />
      <Route path="/faq" element={<PaginaFAQCliente />} />
      <Route path="/sale" element={<PaginaSaleCliente />} />
      <Route path="/admin" element={<CrearUsuarioAdmin />} />
      <Route path="/admin/crear-usuario" element={<CrearUsuarioAdmin />} />
      <Route path="/admin/reporte-dashboard" element={<CrearReporteDashboard />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App
