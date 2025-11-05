import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MDBContainer, MDBCard, MDBCardBody, MDBSpinner } from "mdb-react-ui-kit";
import { supabase } from "../utils/supabaseClient";
import "./VerifyEmail.css";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    error: "",
  });

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          if (data.session) {
            setStatus({
              loading: false,
              success: true,
              error: "",
            });

            // Redirection vers la page d'accueil après 2 secondes
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 2000);
          } else {
            throw new Error("Impossible de créer la session");
          }
        } else {
          // Si aucun jeton dans le hash, vérifier si l'utilisateur est déjà authentifié
          // (peut avoir cliqué sur le lien deux fois ou déjà vérifié)
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            // L'utilisateur est déjà connecté, probablement déjà vérifié
            setStatus({
              loading: false,
              success: true,
              error: "",
            });

            setTimeout(() => {
              navigate("/", { replace: true });
            }, 2000);
          } else {
            throw new Error("Lien de confirmation invalide ou expiré. Veuillez demander un nouveau lien.");
          }
        }
      } catch (err) {
        setStatus({
          loading: false,
          success: false,
          error: err?.message ?? "Une erreur est survenue lors de la vérification de l'email.",
        });
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <MDBContainer
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#E8F0F7" }}
    >
      <MDBCard
        className="text-dark my-5 mx-auto verify-email-card"
        style={{
          borderRadius: "1rem",
          maxWidth: "500px",
          backgroundColor: "#F5F5F5",
          boxShadow: "0 10px 30px rgba(30, 58, 95, 0.15)",
        }}
      >
        <div
          style={{
            backgroundColor: status.success ? "#2d8659" : status.error ? "#d32f2f" : "#4361ee",
            border: `1px solid ${status.success ? "#2d8659" : status.error ? "#d32f2f" : "#4361ee"}`,
            color: "#ffffff",
            height: "80px",
            borderRadius: "1rem 1rem 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2 className="fw-bold mb-0 text-white">
            {status.loading ? "Vérification en cours..." : status.success ? "Email confirmé !" : "Erreur"}
          </h2>
        </div>
        <MDBCardBody className="p-5 d-flex flex-column align-items-center">
          {status.loading && (
            <div className="text-center">
              <MDBSpinner role="status" className="mb-4">
                <span className="visually-hidden">Chargement...</span>
              </MDBSpinner>
              <p className="text-dark mb-0">Vérification de votre email en cours...</p>
            </div>
          )}

          {status.success && (
            <div className="text-center w-100">
              <div
                className="mb-4"
                style={{
                  fontSize: "3rem",
                  color: "#2d8659",
                }}
              >
                ✓
              </div>
              <p className="text-dark mb-3" style={{ fontSize: "1.1rem" }}>
                Votre email a été confirmé avec succès !
              </p>
              <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                Redirection vers la page d'accueil...
              </p>
            </div>
          )}

          {status.error && (
            <div className="text-center w-100">
              <div
                className="mb-4"
                style={{
                  fontSize: "3rem",
                  color: "#d32f2f",
                }}
              >
                ✗
              </div>
              <p className="text-dark mb-3" style={{ fontSize: "1.1rem" }}>
                {status.error}
              </p>
              <button
                className="btn btn-primary"
                style={{ backgroundColor: "#4361ee", borderColor: "#4361ee" }}
                onClick={() => navigate("/login")}
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default VerifyEmail;

