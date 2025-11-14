import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import SignUp from "./pages/signUp";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/profile";
import HomePage from "./pages/HomePage";
import MessagingPage from "./pages/MessagingPage";
import Sell from "./pages/Sell";
import PublishSuccess from "./pages/PublishSuccess";
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
          {/* Page d'accueil protégée */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Profil */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Nouvelles pages (Dev) */}
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <Sell />
              </ProtectedRoute>
            }
          />
          <Route
            path="/publish-success"
            element={
              <ProtectedRoute>
                <PublishSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messaging/:listingId"
            element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            }
          />
  );
}

export default App;
