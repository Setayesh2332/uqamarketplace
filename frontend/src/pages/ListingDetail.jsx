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
    const [activeImage, setActiveImage] = useState(null);

    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getListingById(id);
                setListing(data);
                if (data.listing_images && data.listing_images.length > 0) {
                    setActiveImage(data.listing_images[0].path);
                }
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

    return (
        <div className="detail-shell">
            <MenuBar onSearch={() => {}} onSellClick={() => navigate("/sell")} />

            <main className="detail-main">
                <button className="detail-back" onClick={handleBack}>
                    ← Retour
                </button>

                {loading && <p>Chargement de l'annonce...</p>}
                {error && <p className="detail-error">{error}</p>}

                {listing && !loading && !error && (
                    <section className="detail-card">
                        {/* Images */}
                        <div className="detail-images">
                            <div className="detail-image-main">
                                <img
                                    src={
                                        activeImage ||
                                        (listing.listing_images?.[0]?.path ??
                                            "https://picsum.photos/800/450?placeholder")
                                    }
                                    alt={listing.title}
                                />
                            </div>

                            {listing.listing_images && listing.listing_images.length > 1 && (
                                <div className="detail-thumbs">
                                    {listing.listing_images.map((img) => (
                                        <button
                                            key={img.id}
                                            type="button"
                                            className={
                                                "detail-thumb" +
                                                (img.path === activeImage ? " detail-thumb--active" : "")
                                            }
                                            onClick={() => setActiveImage(img.path)}
                                        >
                                            <img src={img.path} alt={listing.title} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Infos texte */}
                        <div className="detail-info">
                            <h1>{listing.title}</h1>

                            <dl className="detail-fields">
                                <div className="field">
                                    <dt>Catégorie</dt>
                                    <dd>{listing.category}</dd>
                                </div>
                                {listing.course && (
                                    <div className="field">
                                        <dt>Cours</dt>
                                        <dd>{listing.course}</dd>
                                    </div>
                                )}
                                <div className="field">
                                    <dt>Prix</dt>
                                    <dd>{listing.price} $</dd>
                                </div>
                                <div className="field">
                                    <dt>État</dt>
                                    <dd>{listing.condition}</dd>
                                </div>
                                {listing.description && (
                                    <div className="field field--full">
                                        <dt>Description</dt>
                                        <dd>{listing.description}</dd>
                                    </div>
                                )}

                                {/* Attributs spécifiques */}
                                {listing.category_attributes?.marque && (
                                    <div className="field">
                                        <dt>Marque</dt>
                                        <dd>{listing.category_attributes.marque}</dd>
                                    </div>
                                )}
                                {listing.category_attributes?.taille && (
                                    <div className="field">
                                        <dt>Taille</dt>
                                        <dd>{listing.category_attributes.taille}</dd>
                                    </div>
                                )}
                                {listing.category_attributes?.genre && (
                                    <div className="field">
                                        <dt>Genre</dt>
                                        <dd>{listing.category_attributes.genre}</dd>
                                    </div>
                                )}
                            </dl>

                            {/* Infos vendeur */}
                            <section className="detail-seller">
                                <h2>Contacter le vendeur</h2>
                                <p>
                                    {listing.profiles
                                        ? `${listing.profiles.first_name} ${listing.profiles.last_name}`
                                        : "Vendeur inconnu"}
                                </p>

                                <ul>
                                    {listing.contact_cell && listing.contact_phone && (
                                        <li>Cellulaire : {listing.contact_phone}</li>
                                    )}
                                    {listing.contact_email && listing.contact_email_value && (
                                        <li>Courriel : {listing.contact_email_value}</li>
                                    )}
                                    {listing.contact_other && listing.contact_other_value && (
                                        <li>Autre : {listing.contact_other_value}</li>
                                    )}
                                </ul>
                            </section>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
