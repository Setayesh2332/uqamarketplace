import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import SignUp from "./pages/signUp";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/profile";
import HomePage from "./pages/HomePage";
import Sell from "./pages/Sell";
import PublishSuccess from "./pages/PublishSuccess";
import ListingDetail from "./pages/ListingDetail";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Page d'accueil protégée avec Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HomePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Auth - SANS Layout (pas de footer sur login/signup) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Profil avec Layout */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Vendre avec Layout */}
            <Route
              path="/sell"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sell />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Détails d'une annonce avec Layout */}
            <Route
              path="/listing/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListingDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Page de succès après publication avec Layout */}
            <Route
              path="/publish-success"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PublishSuccess />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
