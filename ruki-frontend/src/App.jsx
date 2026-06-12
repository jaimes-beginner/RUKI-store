import { Routes, Route } from 'react-router-dom';

// LAYOUTS
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// SEGURIDAD
import PublicRoute from '@/routes/PublicRoute';
import AdminRoute from '@/routes/AdminRoute';

// PÁGINAS DE CLIENTE / TIENDA
import HomePage from '@/pages/shop/HomePage';
import ProductsPage from '@/pages/shop/ProductsPage';
import ProductDetailPage from '@/pages/shop/ProductDetailPage';
import NewArrivalsPage from '@/pages/shop/NewArrivalsPage';
import SalePage from '@/pages/shop/SalePage';
import CheckoutPage from '@/pages/shop/CheckoutPage';
import PaymentSuccessPage from '@/pages/shop/PaymentSuccessPage';

// PÁGINAS DE USUARIO
import BlogPage from '@/pages/user/BlogPage';
import FAQPage from '@/pages/user/FAQPage';
import ProfilePage from '@/pages/user/ProfilePage';
import MyOrdersPage from '@/pages/user/MyOrdersPage';

// PÁGINAS DE AUTENTICACIÓN
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// PÁGINAS DE ADMINISTRADOR
import DashboardPage from '@/pages/admin/DashboardPage';
import InventoryPage from '@/pages/admin/InventoryPage';
import UsersPage from '@/pages/admin/UsersPage';
import OrdersPage from '@/pages/admin/OrdersPage';
import POSPage from '@/pages/admin/POSPage';

function App() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS Y DE CLIENTE */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-arrivals" element={<NewArrivalsPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="/sale" element={<SalePage />} />
        <Route path="/noticias" element={<BlogPage />} />
        <Route path="/faq" element={<FAQPage />} />

        {/* RUTAS PROTEGIDAS DE CLIENTE */}
        <Route path="/mi-perfil" element={<ProfilePage />} />
        <Route path="/mis-pedidos" element={<MyOrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pago-exitoso" element={<PaymentSuccessPage />} />
      </Route>

      {/* RUTAS DE AUTENTICACIÓN */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/crear-usuario" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* RUTAS DE ADMINISTRADOR */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventario" element={<InventoryPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="pedidos" element={<OrdersPage />} />
        <Route path="pos" element={<POSPage />} />
      </Route>

      {/* RUTA 404 (PAGINA NO ENCONTRADA) */}
      <Route path="*" element={<div className="text-center mt-5"><h1>404 - Página no encontrada</h1></div>} />
    </Routes>
  );
}

export default App;