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
import { AdminRoute } from './security/AdminRoute.jsx'
import { InventarioAdmin } from './components/admin/gestion/InventarioAdmin.jsx'
import { InventarioAdminPage } from './page/Admin/InventarioAdminPage.jsx'
import { UsuariosAdminPage } from './page/Admin/UsuariosAdminPage.jsx'
import { PedidosAdminPage } from './page/Admin/PedidosAdminPage.jsx'

function App() {
  return (
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<PaginaPrincipalCliente />} />
        <Route path="/new-arrivals" element={<PaginaNuevosCliente />} />
        <Route path="/productos" element={<PaginaProductosCliente />} />
        <Route path="/noticias" element={<PaginaBlogCliente />} />
        <Route path="/faq" element={<PaginaFAQCliente />} />
        <Route path="/sale" element={<PaginaSaleCliente />} />
        <Route path="/login" element={<Login />} />

        {/* RUTAS PRIVADAS DE ADMINISTRADOR */}
        <Route path="/admin" element={
          <AdminRoute>
            <CrearUsuarioAdmin />
          </AdminRoute>
        } />

        <Route path="/admin/crear-usuario" element={
          <AdminRoute>
            <CrearUsuarioAdmin />
          </AdminRoute>
        } />

        <Route path="/admin/reporte-dashboard" element={
          <AdminRoute>
            <CrearReporteDashboard />
          </AdminRoute>
        } />

        <Route path="/inventario-admin" element={
          <AdminRoute>
            <InventarioAdminPage />
          </AdminRoute>
        } />
        <Route path="/usuarios-admin" element={
          <AdminRoute>
            <UsuariosAdminPage />
          </AdminRoute>
        } />
        <Route path="/pedidos-admin" element={
          <AdminRoute>
            <PedidosAdminPage />
          </AdminRoute>
        } />
      </Routes>
  )
}

export default App
