import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import { getListingById } from "../utils/listingsApi";
import "./ListingDetail.css";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

                  <button className="btn-contact">Contacter le vendeur</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
