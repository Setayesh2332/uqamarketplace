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

  const handleViewListing = () => {
    if (listing?.id) {
      navigate(`/listing/${listing.id}`);
    } else {
      navigate("/my-listings");
    }
  };

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
          <h1 className="ps-title">Annonce publiée avec succès !</h1>

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

            {listing.listing_images?.length || listing.images?.length ? (
              <div className="ps-section">
                <p className="ps-label">Photos</p>
                <div className="ps-images" style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", 
                  gap: "1rem",
                  marginTop: "1rem"
                }}>
                  {(listing.listing_images || listing.images || []).map((image, i) => {
                    // image peut être une URL (string) ou un objet avec path
                    const imageUrl = typeof image === 'string' ? image : image.path;
                    const altText = listing.title 
                      ? `${listing.title} - ${i + 1}`
                      : `Annonce - ${i + 1}`;
                    return (
                      <div key={i} style={{ 
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #e0e0e0"
                      }}>
                        <img 
                          src={imageUrl} 
                          alt={altText}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div style="padding: 1rem; text-align: center; color: #999;">Image non disponible</div>';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="ps-actions">
            <button
              className="ps-btn ps-btn--ghost"
              onClick={handleViewListing}
            >
              Voir mon annonce
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
