import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";


import CustomerLayout from "./components/CustomerLayout";

import HomePage from "./auth/Home";
import RegisterPage from "./auth/Register";
import LoginPage from "./auth/Login";
//import ResetPasswordPage from "./auth/ResetPassword";
import Smartphones from "./auth/Smartphones";
import Smartphone from "./auth/Smartphone";

import AdminDashboardPage from "./pages/admin/AdminDashboard";
import ProductsPage from "./pages/admin/Products";
import OrdersPage from "./pages/admin/Orders";
import CustomersPage from "./pages/admin/Customers";

//import CustomerDashboardPage from "./pages/customer/CustomerDashboard";
import CustomerProfilePage from "./pages/customer/CustomerProfile";
import CustomerOrdersPage from "./pages/customer/CustomerOrders";
import CustomerCartPage from "./pages/customer/CustomerCart";
import CategoriesPage from "./pages/admin/Categories";
import ErrorPage from "./ErrorPage";
import AdminLayout from "./components/AdminLayout";




function App() {

  return (
    <Router>
      <Routes>

        <Route element={<PublicRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/celulares" element={<Smartphones />} />
          <Route path="/celulares/:id" element={<Smartphone />} />
          {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
        </Route>

        <Route element={<ProtectedRoute />}>

          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<AdminDashboardPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/ordenes" element={<OrdersPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
          </Route>

          <Route element={<CustomerLayout />} path="/">
            <Route path="/tienda" element={<HomePage />} />
            <Route path="/tienda/productos/:query" element={<Smartphones />} />
            <Route path="/tienda/celulares/:id" element={<Smartphone />} />
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
