import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import Loading from "./components/Loading";

// PUBLIC ROUTES
const PublicLayout = lazy(() => import("./components/PublicLayout"))
const HomePage = lazy(() => import("./auth/Home"))
const RegisterPage = lazy(() => import("./auth/Register"))
const LoginPage = lazy(() => import("./auth/Login"))
const ResetPasswordPage = lazy(() => import("./auth/ResetPassword"))
const NewPasswordPage = lazy(() => import("./auth/NewPassword"))
const Smartphones = lazy(() => import("./auth/Smartphones"))
const Smartphone = lazy(() => import("./auth/Smartphone"))

// ADMIN ROUTES
const AdminLayout = lazy(() => import("./components/AdminLayout"))
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboard"))
const CategoriesPage = lazy(() => import("./pages/admin/Categories"))
const ProductsPage = lazy(() => import("./pages/admin/Products"))
const OrdersPage = lazy(() => import("./pages/admin/Orders"))
const CustomersPage = lazy(() => import("./pages/admin/Customers"))

// CUSTOMER ROUTES
const CustomerLayout = lazy(() => import("./components/CustomerLayout"))
//const CustomerDashboardPage = lazy(() => import("./pages/customer/CustomerDashboard"))
const CustomerProfilePage = lazy(() => import("./pages/customer/CustomerProfile"))
const CustomerOrdersPage = lazy(() => import("./pages/customer/CustomerOrders"))
const CustomerCartPage = lazy(() => import("./pages/customer/CustomerCart"))

// ERROR ROUTE
const ErrorPage = lazy(() => import("./ErrorPage"))

function App() {

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/productos/:query" element={<Smartphones />} />
              <Route path="/los_productos/:id" element={<Smartphone />} />
              <Route path="/recuperar_password" element={<ResetPasswordPage />} />
              <Route path="/nuevo_password" element={<NewPasswordPage />} />
            </Route>
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
              <Route path="/tienda/los_productos/:id" element={<Smartphone />} />
              <Route path="/perfil" element={<CustomerProfilePage />} />
              <Route path="/pedidos" element={<CustomerOrdersPage />} />
              <Route path="/carrito" element={<CustomerCartPage />} />
            </Route>

          </Route>

          <Route path="/*" element={<ErrorPage />} />

        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
