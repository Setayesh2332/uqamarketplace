import React, { useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
} from "mdb-react-ui-kit";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn({ email, password });
      navigate("/");
    } catch (err) {
      setError(err?.message ?? "Une erreur est survenue lors de la connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MDBContainer
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#E8F0F7" }}
    >
      <MDBRow className="w-100">
        <MDBCol col="12" className="d-flex justify-content-center">
          <MDBCard
            className="text-dark my-5 mx-auto"
            style={{
              borderRadius: "1rem",
              maxWidth: "400px",
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
              <h2 className="fw-bold mb-0 text-white">LOGIN</h2>
            </div>
            <MDBCardBody className="p-5 d-flex flex-column align-items-center mx-auto w-100">
              <p className="text-dark mb-4 text-center">
                Connectez-vous pour accéder à vos annonces et messages.
              </p>

              <form onSubmit={handleLogin} className="w-100">
                <MDBInput
                  wrapperClass="mb-4 mx-0 w-100"
                  labelClass="text-dark"
                  label="Email address"
                  id="loginEmail"
                  type="email"
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <MDBInput
                  wrapperClass="mb-3 mx-0 w-100"
                  labelClass="text-dark"
                  label="Password"
                  id="loginPassword"
                  type="password"
                  size="lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

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
                    Mot de passe oublié ?
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
                  {submitting ? "Connexion…" : "Login"}
                </MDBBtn>
              </form>

              <div className="mt-4">
                <p className="mb-0 text-center">
                  Nouveau sur la plateforme ?{" "}
                  <Link
                    to="/signup"
                    className="fw-bold"
                    style={{ textDecoration: "none", color: "#4361ee" }}
                  >
                    Créez un compte
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
