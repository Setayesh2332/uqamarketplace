import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MDBContainer, MDBCard, MDBCardBody } from "mdb-react-ui-kit";
import { useAuth } from "../contexts/AuthContext";
import "./signUp.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  studyCycle: "",
  schoolYear: "",
};

function SignUp() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ submitting: false, error: "", success: "" });
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const updateField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setStatus((prev) => ({ ...prev, error: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ submitting: false, error: "", success: "" });

    if (form.password !== form.confirmPassword) {
      setStatus({ submitting: false, error: "Les mots de passe ne correspondent pas.", success: "" });
      return;
    }

    setStatus({ submitting: true, error: "", success: "" });

    try {
      await signUp({
        email: form.email,
        password: form.password,
        metadata: {
          first_name: form.firstName,
          last_name: form.lastName,
          study_cycle: form.studyCycle,
          school_year: form.schoolYear,
        },
      });

      setStatus({
        submitting: false,
        error: "",
        success: "Inscription réussie ! Redirection vers la connexion…",
      });

      setForm(initialForm);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const code = err?.status;
      const message = err?.message ?? "Impossible de créer votre compte pour le moment.";

      if (code === 400 && message.toLowerCase().includes("confirm")) {
        setStatus({
          submitting: false,
          error: "Votre adresse doit être confirmée avant la connexion. Consultez le lien reçu ou contactez l'équipe.",
          success: "",
        });
      } else {
        setStatus({ submitting: false, error: message, success: "" });
      }
    }
  };

  return (
    <MDBContainer fluid className="signup-container">
      <MDBCard className="signup-card">
        <div className="signup-header">
          <span className="signup-badge">Étudiant·e UQAM</span>
          <h2>Créez votre compte marketplace</h2>
          <p>
            Rejoignez la communauté pour publier des annonces, sauvegarder vos trouvailles et
            échanger avec d'autres étudiants.
          </p>
        </div>

        <MDBCardBody className="signup-body">
          {status.error && <div className="signup-alert signup-alert--error">{status.error}</div>}
          {status.success && <div className="signup-alert signup-alert--success">{status.success}</div>}

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <div className="signup-grid">
              <label className="signup-field">
                <span>Prénom *</span>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Ex. Amira"
                  required
                  value={form.firstName}
                  onChange={updateField("firstName")}
                />
              </label>
              <label className="signup-field">
                <span>Nom *</span>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Ex. Tremblay"
                  required
                  value={form.lastName}
                  onChange={updateField("lastName")}
                />
              </label>
            </div>

            <label className="signup-field">
              <span>Courriel UQAM *</span>
              <input
                type="email"
                name="email"
                placeholder="prenom.nom@uqam.ca"
                required
                value={form.email}
                onChange={updateField("email")}
              />
            </label>

            <div className="signup-grid">
              <label className="signup-field">
                <span>Mot de passe *</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Au moins 8 caractères"
                  required
                  value={form.password}
                  onChange={updateField("password")}
                />
              </label>
              <label className="signup-field">
                <span>Confirmer *</span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Répétez le mot de passe"
                  required
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                />
              </label>
            </div>

            <div className="signup-grid">
              <label className="signup-field">
                <span>Cycle d'études *</span>
                <select
                  name="studyCycle"
                  required
                  value={form.studyCycle}
                  onChange={updateField("studyCycle")}
                >
                  <option value="" disabled>
                    Choisissez votre cycle
                  </option>
                  <option value="bachelor">Baccalauréat</option>
                  <option value="master">Maîtrise</option>
                  <option value="phd">Doctorat</option>
                  <option value="certificate">Certificat</option>
                </select>
              </label>
              <label className="signup-field">
                <span>Année scolaire *</span>
                <select
                  name="schoolYear"
                  required
                  value={form.schoolYear}
                  onChange={updateField("schoolYear")}
                >
                  <option value="" disabled>
                    Sélectionnez votre année
                  </option>
                  <option value="1">1re année</option>
                  <option value="2">2e année</option>
                  <option value="3">3e année</option>
                  <option value="4">4e année</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="signup-submit"
              disabled={status.submitting}
            >
              {status.submitting ? "Inscription…" : "S'inscrire"}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Déjà un compte? <Link to="/login">Connectez-vous</Link>
            </p>
          </div>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default SignUp;
