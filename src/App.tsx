import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./lib/ProtectedRoute";
import { PublicRoute } from "./lib/PublicRoute";

import AdminLayout from "./lib/AdminLayout";
import CustomerLayout from "./lib/CustomerLayout";

import HomePage from "./auth/Home";
import RegisterPage from "./auth/Register";
import LoginPage from "./auth/Login";
import ResetPasswordPage from "./auth/ResetPassword";

import AdminDashboardPage from "./pages/admin/AdminDashboard";
import ProductsPage from "./pages/admin/Products";
import OrdersPage from "./pages/admin/Orders";
import CustomersPage from "./pages/admin/Customers";

import CustomerDashboardPage from "./pages/customer/CustomerDashboard";
import CustomerProfilePage from "./pages/customer/CustomerProfile";
import CustomerOrdersPage from "./pages/customer/CustomerOrders";
import CustomerCartPage from "./pages/customer/CustomerCart";
import CategoriesPage from "./pages/admin/Categories";
import ErrorPage from "./ErrorPage";


function App() {

  return (
    <Router>
      <Routes>

        <Route element={<PublicRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>

          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<AdminDashboardPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/ordenes" element={<OrdersPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
          </Route>

          <Route element={<CustomerLayout />}>
            <Route path="/my_dashboard" element={<CustomerDashboardPage />} />
            <Route path="/perfil" element={<CustomerProfilePage />} />
            <Route path="/pedidos" element={<CustomerOrdersPage />} />
            <Route path="/carrito" element={<CustomerCartPage />} />
          </Route>

        </Route>

        <Route path="/*" element={<ErrorPage />} />
      </Routes>
    </Router>
  )
}

export default App
