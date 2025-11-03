import React from "react";
import { Link } from "react-router-dom";
import { MDBContainer, MDBCard, MDBCardBody } from "mdb-react-ui-kit";
import "./signUp.css";

function SignUp() {
  return (
    <MDBContainer fluid className="signup-container">
      <MDBCard className="signup-card">
        <div className="signup-header">
          <span className="signup-badge">Étudiant·e UQAM</span>
          <h2>Créez votre compte marketplace</h2>
          <p>Rejoignez la communauté pour publier des annonces, sauvegarder vos trouvailles et échanger avec d'autres étudiants.</p>
        </div>

        <MDBCardBody className="signup-body">
          <form className="signup-form">
            <div className="signup-grid">
              <label className="signup-field">
                <span>Prénom *</span>
                <input type="text" name="firstName" placeholder="Ex. Amira" required />
              </label>
              <label className="signup-field">
                <span>Nom *</span>
                <input type="text" name="lastName" placeholder="Ex. Tremblay" required />
              </label>
            </div>

            <label className="signup-field">
              <span>Courriel UQAM *</span>
              <input type="email" name="email" placeholder="prenom.nom@uqam.ca" required />
            </label>

            <div className="signup-grid">
              <label className="signup-field">
                <span>Mot de passe *</span>
                <input type="password" name="password" placeholder="Au moins 8 caractères" required />
              </label>
              <label className="signup-field">
                <span>Confirmer *</span>
                <input type="password" name="confirmPassword" placeholder="Répétez le mot de passe" required />
              </label>
            </div>

            <div className="signup-grid">
              <label className="signup-field">
                <span>Cycle d'études *</span>
                <select name="studyCycle" defaultValue="" required>
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
                <select name="schoolYear" defaultValue="" required>
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

            <button type="submit" className="signup-submit">
              S'inscrire
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
