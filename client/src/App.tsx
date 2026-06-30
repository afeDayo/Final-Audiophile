// import "./App.css";

// The root component that sets up routing and global providers.
// "Providers" wrap the app so all child components can access shared data (like the cart or the logged-in user).
// React Router handles navigation - it changes what page renders based on the URL, without full page reloads (SPA behaviour)

import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ----- Route wrappers ----
import RootLayout from "./layout/RootLayout";
import AdminRoute from "./components/AdminRoute";
import { StoreProvider } from "./context/StoreContext";
import { AuthProvider } from "./context/AuthContext";
import RollerLoader from "./components/RollerLoader";

// ------ Lazy Loading ----
const HomePage = lazy(() => import("./pages/HomePage"));
const HeadphonesPage = lazy(() => import("./pages/HeadphonesPage"));
const SpeakersPage = lazy(() => import("./pages/SpeakersPage"));
const EarphonesPage = lazy(() => import("./pages/EarphonesPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const TermsAndConditionsPage = lazy(
  () => import("./pages/TermsAndConditionsPage"),
);
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Admin pages - only loaded if user is an admin
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));

function App() {
  return (
    <>
      <AuthProvider>
        <StoreProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#363636",
                  color: "#FFFFFF",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "14px",
                },

                success: {
                  iconTheme: {
                    primary: "#D87D4A",
                    secondary: "#FFFFFF",
                  },
                },
              }}
            />
            <Suspense fallback={<RollerLoader />}>
              <Routes>
                <Route element={<RootLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/headphones" element={<HeadphonesPage />} />
                  <Route path="/speakers" element={<SpeakersPage />} />
                  <Route path="/earphones" element={<EarphonesPage />} />
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/t&c" element={<TermsAndConditionsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </>
  );
}
// https://final-audiophile.vercel.app/
// https://final-audiophile.onrender.com

export default App;
