import React, { useState, useEffect } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
} from "mdb-react-ui-kit";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabaseClient";
import "./auth-transitions.css";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [animationClass, setAnimationClass] = useState("auth-card-enter-from-right");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Vérifier si redirigé depuis l'inscription
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setShowSuccessMessage(true);
      // Supprimer le paramètre de requête de l'URL
      navigate("/login", { replace: true });
      // Masquer le message après 5 secondes
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    // Si on vient de signup, animer depuis la gauche
    if (location.state?.from === "signup") {
      setAnimationClass("auth-card-enter-from-left");
    } else {
      // Sinon, animer depuis la droite (par défaut)
      setAnimationClass("auth-card-enter-from-right");
    }
  }, [location.pathname, location.state]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Authentification réussie, on vérifie que le profil existe
      // (le trigger devrait créer le profil automatiquement, mais on valide quand même)
      if (authData?.user?.id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", authData.user.id)
          .single();

        // Log seulement les vraies erreurs (pas les "not found" qui peuvent arriver)
        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        }
        // On navigue même si le profil n'existe pas (l'utilisateur est authentifié)
      }

      await signIn({ email, password });
      navigate("/");
    } catch (err) {
      const errorCode = err?.code || err?.status;
      
      if (errorCode === "invalid_credentials" || errorCode === 400) {
        setError(t("login.errorInvalidCredentials"));
      } else if (errorCode === "too_many_requests" || errorCode === 429) {
        setError(t("login.errorTooManyRequests"));
      } else {
        setError(t("login.error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MDBContainer
      fluid
      className="d-flex align-items-center justify-content-center auth-page-container"
      style={{ minHeight: "100vh", backgroundColor: "#E8F0F7" }}
    >
      <MDBRow className="w-100">
        <MDBCol col="12" className="d-flex flex-column align-items-center">
          <img
            src="/images/logo/logo.png"
            alt="UQAMarketplace Logo"
            style={{
              height: "70px",
              width: "auto",
              objectFit: "contain",
              marginBottom: "24px",
            }}
          />
          
          <MDBCard
            className={`text-dark my-2 mx-auto auth-card ${animationClass}`}
            style={{
              borderRadius: "1rem",
              maxWidth: "400px",
              width: "100%",
              backgroundColor: "#F5F5F5",
              boxShadow: "0 10px 30px rgba(30, 58, 95, 0.15)",
            }}
          >
            <div
              style={{
                backgroundColor: "#4361ee",
                border: "1px solid #4361ee",
                color: "#ffffff",
                height: "80px",
                borderRadius: "1rem 1rem 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h2 className="fw-bold mb-0 text-white">{t("login.title")}</h2>
            </div>
            <MDBCardBody className="p-5 d-flex flex-column align-items-center mx-auto w-100">
              <p className="text-dark mb-4 text-center">
                {t("login.description")}
              </p>

              {showSuccessMessage && (
                <div
                  className="mb-4 px-3 py-2 w-100"
                  style={{
                    borderRadius: "0.75rem",
                    backgroundColor: "rgba(45, 160, 101, 0.14)",
                    color: "#1b6e3c",
                    fontSize: "0.95rem",
                    border: "1px solid rgba(45, 160, 101, 0.22)",
                  }}
                >
                  ✓ {t("login.registrationSuccess")}
                </div>
              )}

              <form onSubmit={handleLogin} className="w-100">
                <MDBInput
                  wrapperClass="mb-4 mx-0 w-100"
                  labelClass="text-dark"
                  label={t("login.emailLabel")}
                  id="loginEmail"
                  type="email"
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="login-password-wrapper mb-3">
                  <MDBInput
                    wrapperClass="mx-0 w-100"
                    labelClass="text-dark"
                    label={t("login.passwordLabel")}
                    id="loginPassword"
                    type={showPassword ? "text" : "password"}
                    size="lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {error && (
                  <div
                    className="mb-3 px-3 py-2 w-100"
                    style={{
                      borderRadius: "0.75rem",
                      backgroundColor: "rgba(255, 94, 94, 0.1)",
                      color: "#c0392b",
                      fontSize: "0.95rem",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Link
                    className="text-dark fw-bold"
                    to="#!"
                    style={{ textDecoration: "none", color: "#1E3A5F" }}
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>

                <MDBBtn
                  className="mx-0 px-4 w-100"
                  style={{
                    backgroundColor: "#4361ee",
                    border: "1px solid #4361ee",
                    color: "#ffffff",
                  }}
                  size="lg"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? t("login.submitting") : t("login.submitButton")}
                </MDBBtn>
              </form>

              <div className="mt-4">
                  <p className="mb-0 text-center">
                    {t("login.newUser")}{" "}
                    <Link
                      to="/signup"
                      state={{ from: "login" }}
                      className="fw-bold"
                      style={{ textDecoration: "none", color: "#4361ee" }}
                    >
                      {t("login.createAccount")}
                    </Link>
                  </p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;
