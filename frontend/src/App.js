// App.js - Main app file with page transitions

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Payment from './pages/Payment';

// Pages
import Home              from './pages/Home';
import Login             from './pages/Login';
import Register          from './pages/Register';
import ProductDetail     from './pages/ProductDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import SellerDashboard   from './pages/SellerDashboard';
import AdminDashboard    from './pages/AdminDashboard';
import SellerShop        from './pages/SellerShop';

// Components
import Navbar          from './components/Navbar';
import Footer          from './components/Footer';
import PrivateRoute    from './components/PrivateRoute';
import PageTransition  from './components/PageTransition';

const AppRoutes = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>

          {/* Public */}
          <Route path="/" element={
            <PageTransition><Home /></PageTransition>
          } />
          <Route path="/login" element={
            <PageTransition><Login /></PageTransition>
          } />
          <Route path="/register" element={
            <PageTransition><Register /></PageTransition>
          } />
          <Route path="/product/:id" element={
            <PageTransition><ProductDetail /></PageTransition>
          } />
          <Route path="/shop/:id" element={
            <PageTransition><SellerShop /></PageTransition>
          } />
          <Route path="/payment" element={<Payment />} />

          {/* Customer Only */}
          <Route path="/customer" element={
            <PrivateRoute role="customer">
              <PageTransition><CustomerDashboard /></PageTransition>
            </PrivateRoute>
          } />

          {/* Seller Only */}
          <Route path="/seller" element={
            <PrivateRoute role="seller">
              <PageTransition><SellerDashboard /></PageTransition>
            </PrivateRoute>
          } />

          {/* Admin Only */}
          <Route path="/admin" element={
            <PrivateRoute role="admin">
              <PageTransition><AdminDashboard /></PageTransition>
            </PrivateRoute>
          } />

        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;