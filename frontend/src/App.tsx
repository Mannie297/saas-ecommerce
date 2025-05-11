import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import BestSellersPage from './pages/BestSellersPage';
import MeatSeafoodPage from './pages/MeatSeafoodPage';
import GroceriesPage from './pages/GroceriesPage';
import DrinksPage from './pages/DrinksPage';
import SnacksPage from './pages/SnacksPage';
import PersonalCarePage from './pages/PersonalCarePage';
import ClearancePage from './pages/ClearancePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProtectedRoute from './components/ProtectedRoute';
import CategoryPage from './pages/CategoryPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow pt-32 pb-8">
                  <div className="container mx-auto px-4">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/category/:categoryId" element={<CategoryPage />} />
                      <Route path="/" element={<HomePage />} />
                      <Route path="/best-sellers" element={<BestSellersPage />} />
                      <Route path="/meat-seafood" element={<MeatSeafoodPage />} />
                      <Route path="/groceries" element={<GroceriesPage />} />
                      <Route path="/drinks" element={<DrinksPage />} />
                      <Route path="/snacks" element={<SnacksPage />} />
                      <Route path="/personal-care" element={<PersonalCarePage />} />
                      <Route path="/clearance" element={<ClearancePage />} />
                      <Route path="/product/:id" element={<ProductDetailsPage />} />
                      <Route path="/search" element={<SearchResultsPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/payment-success" element={<PaymentSuccessPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route
                        path="/admin/orders"
                        element={
                          <AdminProtectedRoute>
                            <AdminOrdersPage />
                          </AdminProtectedRoute>
                        }
                      />

                      {/* Protected Routes */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </div>
                </main>
                <Footer />
              </div>
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
