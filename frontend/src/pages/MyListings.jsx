import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import MenuBar from "../components/MenuBar";
import { getListings, deleteListing } from "../utils/listingsApi";
import { useAuth } from "../contexts/AuthContext";
import "./MyListings.css";

export default function MyListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const fetchMyListings = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const { listings: fetchedListings } = await getListings(
        { user_id: user.id }, // Filtrer par utilisateur connecté
        { field: "created_at", order: "desc" },
        100
      );
      setListings(fetchedListings || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des annonces:", err);
      setError("Erreur lors du chargement de vos annonces");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    setDeleting(listingId);
    try {
      await deleteListing(listingId);
      // Retirer l'annonce de la liste
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      alert("Annonce supprimée avec succès !");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression de l'annonce");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="my-listings-shell">
      <MenuBar onSearch={() => {}} onSellClick={() => navigate("/sell")} />

      <main className="my-listings-main">
        <div className="my-listings-container">
          <div className="my-listings-header">
            <h1>Mes Annonces</h1>
            <button
              className="btn-create"
              onClick={() => navigate("/sell")}
            >
              <FaPlus /> Créer une annonce
            </button>
          </div>

          {loading ? (
            <div className="loading-message">
              <p>Chargement de vos annonces...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-message">
              <p>Vous n'avez pas encore d'annonces.</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/sell")}
              >
                Créer votre première annonce
              </button>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map((listing) => {
                const imageUrl =
                  listing.listing_images && listing.listing_images.length > 0
                    ? listing.listing_images[0].path
                    : "https://picsum.photos/480/320?placeholder";

                return (
                  <div key={listing.id} className="listing-card">
                    <div className="listing-image">
                      <img src={imageUrl} alt={listing.title} />
                      <span className={`status-badge status-${listing.status}`}>
                        {listing.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    
                    <div className="listing-content">
                      <h3 className="listing-title">{listing.title}</h3>
                      <p className="listing-price">{listing.price} $</p>
                      <p className="listing-date">
                        Publié le {formatDate(listing.created_at)}
                      </p>
                    </div>

                    <div className="listing-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(listing.id)}
                        disabled={deleting === listing.id}
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(listing.id)}
                        disabled={deleting === listing.id}
                      >
                        <FaTrash />{" "}
                        {deleting === listing.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
