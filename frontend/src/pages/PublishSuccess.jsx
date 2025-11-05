import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PublishSuccess.css";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function PublishSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    if (location.state?.listing) {
      setListing(location.state.listing);
      sessionStorage.setItem(
        "lastListing",
        JSON.stringify(location.state.listing)
      );
    } else {
      const cached = sessionStorage.getItem("lastListing");
      if (cached) setListing(JSON.parse(cached));
    }
  }, [location.state]);

  if (!listing) {
    return (
      <div className="publish-success-shell">
        <main className="publish-success-main">
          <h3 className="ps-title">Aucune donnée à afficher</h3>
          <div className="ps-actions">
            <button
              className="ps-btn ps-btn--primary"
              onClick={() => navigate("/sell")}
            >
              Retour
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="publish-success-shell">
      <main className="publish-success-main">
        <div className="ps-container">
          <h1 className="ps-title">Annonce publiée avec succès ! 🎉</h1>

          <div className="ps-card">
            <div className="ps-section">
              <p className="ps-label">Détail de l'article</p>
              <p className="ps-value">
                Titre : <strong>{listing.title || "—"}</strong>
              </p>
              <p className="ps-value">
                Prix :{" "}
                <strong>{listing.price ? `${listing.price} $` : "—"}</strong>
              </p>
              <p className="ps-value">
                Date de publication :{" "}
                <strong>
                  {formatDate(listing.created_at || new Date().toISOString())}
                </strong>
              </p>
              <p className="ps-value">
                Statut : <strong>{listing.status}</strong>
              </p>
            </div>

            {!!(listing.program || listing.course) && (
              <div className="ps-section">
                {listing.program && (
                  <p className="ps-value">
                    Programme : <strong>{listing.program}</strong>
                  </p>
                )}
                {listing.course && (
                  <p className="ps-value">
                    Cours : <strong>{listing.course}</strong>
                  </p>
                )}
              </div>
            )}

            {listing.description && (
              <div className="ps-section">
                <p className="ps-label">Description</p>
                <p className="ps-description">{listing.description}</p>
              </div>
            )}

            {listing.images?.length ? (
              <div className="ps-section">
                <p className="ps-label">Photos</p>
                <div className="ps-images">
                  {listing.images.map((name, i) => (
                    <span className="ps-chip" key={i}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="ps-actions">
            <button
              className="ps-btn ps-btn--ghost"
              onClick={() => navigate("/profile")}
            >
              Voir mon profil
            </button>
            <button
              className="ps-btn ps-btn--primary"
              onClick={() => navigate("/")}
            >
              Page d'accueil
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
