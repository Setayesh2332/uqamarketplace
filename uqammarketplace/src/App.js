import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import SignUp from "./pages/signUp";
import Profile from "./pages/profile";
import HomePage from "./pages/HomePage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return null
  }
  if (!user) {
    return <Navigate to = "/login" replace />
  }

  return children 
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={(
              <ProtectedRoute>
              <HomePage />
              </ProtectedRoute>
            )}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={(
            <ProtectedRoute>
              <Profile />
              </ProtectedRoute>)} />
          <Route path="/homepage" element={(
            <ProtectedRoute>
              <HomePage />
              </ProtectedRoute>
            )} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;
