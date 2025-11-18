import React from "react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Section À propos */}
          <div className="footer-section">
            <h3 className="footer-title">UQAMARKETPLACE</h3>
            <p className="footer-description">
              La plateforme d'échange pour la communauté étudiante de l'UQAM.
              Achetez et vendez facilement entre étudiants.
            </p>
          </div>

          {/* Section Liens rapides */}
          <div className="footer-section">
            <h4 className="footer-heading">Liens rapides</h4>
            <ul className="footer-links">
              <li>
                <a href="/">Accueil</a>
              </li>
              <li>
                <a href="/sell">Vendre</a>
              </li>
              <li>
                <a href="/profile">Mon profil</a>
              </li>
            </ul>
          </div>

          {/* Section Catégories */}
          <div className="footer-section">
            <h4 className="footer-heading">Catégories</h4>
            <ul className="footer-links">
              <li>
                <a href="/?category=Manuel%20scolaire">Manuels scolaires</a>
              </li>
              <li>
                <a href="/?category=Électronique">Électronique</a>
              </li>
              <li>
                <a href="/?category=Meubles">Meubles</a>
              </li>
              <li>
                <a href="/?category=Vêtements">Vêtements</a>
              </li>
            </ul>
          </div>

          {/* Section Contact */}
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:support@uqamarketplace.ca">
                  support@uqamarketplace.ca
                </a>
              </li>
              <li>
                <a href="/faq">FAQ</a>
              </li>
              <li>
                <a href="/contact">Nous contacter</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre de copyright */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} UQAMARKETPLACE. Tous droits réservés.
          </p>
          <div className="footer-legal">
            <a href="/terms">Conditions d'utilisation</a>
            <span className="footer-separator">•</span>
            <a href="/privacy">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
