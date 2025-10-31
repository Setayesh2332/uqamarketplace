import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PublishSuccess.css";

function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString("fr-CA", {
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
            sessionStorage.setItem("lastListing", JSON.stringify(location.state.listing));
        } else {
            const cached = sessionStorage.getItem("lastListing");
            if (cached) setListing(JSON.parse(cached));
        }
    }, [location.state]);

    if (!listing) {
        return (
            <main className="publish-success">
                <h3 className="ps-title">Aucune donnée à afficher</h3>
                <div className="ps-actions">
                    <button className="ps-btn ps-btn--primary" onClick={() => navigate("/sell")}>
                        Retour
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="publish-success">
            <h3 className="ps-title">Annonce publiée avec succès ! 🎉</h3>

            <div className="ps-card">
                <div className="ps-section">
                    <p className="ps-label">Détail de l’article</p>
                    <p>Titre : {listing.title || "—"}</p>
                    <p>Prix : {listing.price ? `${listing.price} $` : "—"}</p>
                    <p>Date de publication : {formatDate(listing.created_at || new Date().toISOString())}</p>
                    <p>Statut : {listing.status}</p>
                </div>

                {!!(listing.program || listing.course) && (
                    <div className="ps-section">
                        {listing.program && <p>Programme : {listing.program}</p>}
                        {listing.course && <p>Cours : {listing.course}</p>}
                    </div>
                )}

                {listing.description && (
                    <div className="ps-section">
                        <p className="ps-label">Description</p>
                        <p style={{ whiteSpace: "pre-wrap" }}>{listing.description}</p>
                    </div>
                )}

                {listing.images?.length ? (
                    <div className="ps-section">
                        <p className="ps-label">Photos</p>
                        <div className="ps-images">
                            {listing.images.map((n, i) => (
                                <span className="chip" key={i}>{n}</span>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="ps-actions">
                <button className="ps-btn ps-btn--ghost" onClick={() => navigate("/profile")}>
                    Voir mon annonce
                </button>
                <button className="ps-btn ps-btn--primary" onClick={() => navigate("/")}>
                    Page d’accueil
                </button>
            </div>
        </main>
    );
}
