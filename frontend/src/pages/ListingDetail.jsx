import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import { getListingById } from "../utils/listingsApi";
import { getOrCreateConversation } from "../utils/conversationsApi";
import { useAuth } from "../contexts/AuthContext";
import ArticleRating from "../components/ratingArticle";
import "./ListingDetail.css";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [messageText, setMessageText] = useState("Bonjour, je suis intéressé");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getListingById(id);
        setListing(data);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger cette annonce.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleBack = () => navigate(-1);

  const handlePrevImage = () => {
    if (listing?.listing_images && listing.listing_images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.listing_images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (listing?.listing_images && listing.listing_images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === listing.listing_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const getCurrentImage = () => {
    if (listing?.listing_images && listing.listing_images.length > 0) {
      return listing.listing_images[currentImageIndex].path;
    }
    return "https://picsum.photos/800/450?placeholder";
  };

  const handleSendMessage = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Vérifier que l'utilisateur n'est pas le vendeur
    if (listing?.profiles?.id === user.id) {
      setError("Vous ne pouvez pas vous contacter vous-même");
      return;
    }

    if (!messageText.trim()) {
      setError("Veuillez entrer un message");
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Créer ou récupérer la conversation
      const conversation = await getOrCreateConversation(id);
      
      // Rediriger vers la page de chat avec le message pré-rempli
      navigate(`/chat/${conversation.id}`, {
        state: { initialMessage: messageText.trim() }
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      setError(err.message || "Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="listing-detail-page">
      <MenuBar onSearch={() => {}} onSellClick={() => navigate("/sell")} />

      <div className="detail-container">
        <button className="btn-back" onClick={handleBack}>
          <span className="arrow-icon">←</span>
          <span>Retour aux annonces</span>
        </button>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {listing && !loading && !error && (
          <div className="detail-content">
            <div className="detail-content-inner">
              {/* Section gauche - Titre + Images */}
              <div className="detail-left">
                {/* Titre et prix au-dessus de l'image */}
                <div className="listing-header">
                  <h1 className="listing-title">{listing.title}</h1>
                  <div className="listing-price">{listing.price} $</div>
                </div>

                {/* Carousel d'images */}
                <div className="image-carousel">
                  <div className="carousel-main">
                    <img
                      src={getCurrentImage()}
                      alt={listing.title}
                      className="main-image"
                    />

                    {listing.listing_images &&
                      listing.listing_images.length > 1 && (
                        <>
                          <button
                            className="carousel-btn carousel-btn-prev"
                            onClick={handlePrevImage}
                            aria-label="Image précédente"
                          >
                            ‹
                          </button>
                          <button
                            className="carousel-btn carousel-btn-next"
                            onClick={handleNextImage}
                            aria-label="Image suivante"
                          >
                            ›
                          </button>

                          <div className="carousel-indicators">
                            {listing.listing_images.map((_, index) => (
                              <button
                                key={index}
                                className={`indicator ${
                                  index === currentImageIndex ? "active" : ""
                                }`}
                                onClick={() => setCurrentImageIndex(index)}
                                aria-label={`Aller à l'image ${index + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                  </div>

                  {listing.listing_images &&
                    listing.listing_images.length > 1 && (
                      <div className="carousel-preview">
                        {listing.listing_images.map((img, index) => (
                          <button
                            key={img.id}
                            className={`preview-item ${
                              index === currentImageIndex ? "active" : ""
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img
                              src={img.path}
                              alt={`${listing.title} ${index + 1}`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Composant Rating - après le carousel */}
                <ArticleRating sellerId={listing.user_id} userId={user?.id} />
              </div>

              {/* Section droite - Infos condensées */}
              <div className="detail-right">
                {/* Informations du produit */}
                <div className="product-info">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Catégorie</span>
                      <span className="info-value">{listing.category}</span>
                    </div>
                    {listing.course && (
                      <div className="info-item">
                        <span className="info-label">Cours</span>
                        <span className="info-value">{listing.course}</span>
                      </div>
                    )}
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">État</span>
                      <span className="info-value condition-badge">
                        {listing.condition}
                      </span>
                    </div>
                    {listing.category_attributes?.marque && (
                      <div className="info-item">
                        <span className="info-label">Marque</span>
                        <span className="info-value">
                          {listing.category_attributes.marque}
                        </span>
                      </div>
                    )}
                  </div>

                  {(listing.category_attributes?.taille ||
                    listing.category_attributes?.genre) && (
                    <div className="info-row">
                      {listing.category_attributes?.taille && (
                        <div className="info-item">
                          <span className="info-label">Taille</span>
                          <span className="info-value">
                            {listing.category_attributes.taille}
                          </span>
                        </div>
                      )}
                      {listing.category_attributes?.genre && (
                        <div className="info-item">
                          <span className="info-label">Genre</span>
                          <span className="info-value">
                            {listing.category_attributes.genre}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {listing.description && (
                    <div className="description-compact">
                      <h3 className="section-title-small">Description</h3>
                      <p className="description-text">{listing.description}</p>
                    </div>
                  )}
                </div>

                {/* Vendeur et contact combinés */}
                <div className="seller-section">
                  <div className="seller-info">
                    <div className="seller-avatar">
                      {listing.profiles?.first_name?.[0] || "?"}
                    </div>
                    <div className="seller-details">
                      <h3 className="seller-name">
                        {listing.profiles
                          ? `${listing.profiles.first_name} ${listing.profiles.last_name}`
                          : "Vendeur inconnu"}
                      </h3>
                      <span className="seller-label">Vendeur</span>
                    </div>
                  </div>

                  <div className="contact-compact">
                    {listing.contact_cell && listing.contact_phone && (
                      <div className="contact-row">
                        <span className="contact-icon">📱</span>
                        <span className="contact-value">
                          {listing.contact_phone}
                        </span>
                      </div>
                    )}
                    {listing.contact_email && listing.contact_email_value && (
                      <div className="contact-row">
                        <span className="contact-icon">✉️</span>
                        <span className="contact-value">
                          {listing.contact_email_value}
                        </span>
                      </div>
                    )}
                    {listing.contact_other && listing.contact_other_value && (
                      <div className="contact-row">
                        <span className="contact-icon">💬</span>
                        <span className="contact-value">
                          {listing.contact_other_value}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Zone de message - seulement si l'utilisateur n'est pas le vendeur */}
                  {user && listing?.profiles?.id !== user.id && (
                    <div className="message-input-section">
                      <input
                        type="text"
                        className="message-input"
                        placeholder="Bonjour, je suis intéressé"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !sending) {
                            handleSendMessage();
                          }
                        }}
                        disabled={sending}
                      />
                      <button
                        className="btn-send-message"
                        onClick={handleSendMessage}
                        disabled={sending || !messageText.trim()}
                      >
                        {sending ? "Envoi..." : "Envoyer"}
                      </button>
                    </div>
                  )}
                  
                  {user && listing?.profiles?.id === user.id && (
                    <div className="message-info">
                      <p className="message-info-text">
                        C'est votre annonce. Les messages des acheteurs apparaîtront dans votre messagerie.
                      </p>
                      <button
                        className="btn-view-messages"
                        onClick={() => navigate("/messages")}
                      >
                        Voir mes messages
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
