import { Routes, Route } from 'react-router-dom'
import { PaginaPrincipalCliente } from './page/Cliente/PaginaPrinicpal.jsx'
import { PaginaNuevosCliente } from './page/Cliente/PaginaNuevos.jsx'
import { PaginaSaleCliente } from './page/Cliente/PaginaSale.jsx'
import { PaginaProductosCliente } from './page/Cliente/PaginaProductos.jsx'
import { PaginaBlogCliente } from './page/Cliente/BlogPagina.jsx'
import { PaginaFAQCliente } from './page/Cliente/FAQPagina.jsx'

import { CrearReporteDashboard } from './page/Admin/CrearReporteDashboard.jsx'

import { AdminRoute } from './security/AdminRoute.jsx'
import { InventarioAdmin } from './components/admin/gestion/InventarioAdmin.jsx'
import { InventarioAdminPage } from './page/Admin/InventarioAdminPage.jsx'
import { UsuariosAdminPage } from './page/Admin/UsuariosAdminPage.jsx'
import { PedidosAdminPage } from './page/Admin/PedidosAdminPage.jsx'
import { CheckoutPage } from './page/Cliente/CheckoutPage.jsx'
import { PagoExitosoPage } from './page/Cliente/PagoExitosoPage.jsx'
import { PublicRoute } from './security/PublicRoute.jsx'
import { PerfilPage } from './page/Cliente/PerfilPage.jsx'
import { ProductoDetallePage } from './page/Cliente/ProductoDetallePage.jsx'
import { MisPedidosPage } from './page/Cliente/MisPedidosPage.jsx'
import { RegistrarUsuarioPage } from './page/Auth/RegistrarUsuarioPage.jsx'
import { LoginUsuarioPage } from './page/Auth/LoginUsuarioPage.jsx'


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
        <Route path="/mi-perfil" element={<PerfilPage />} />
        <Route path="/producto/:id" element={<ProductoDetallePage />} />
        <Route path="/mis-pedidos" element={<MisPedidosPage />} />

        <Route path="/crear-usuario" element={
          <PublicRoute>
            <RegistrarUsuarioPage />
          </PublicRoute>
        } />

        <Route path="/login" element={
          <PublicRoute>
            <LoginUsuarioPage />
          </PublicRoute>
        } />

        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pago-exitoso" element={<PagoExitosoPage />} />

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
