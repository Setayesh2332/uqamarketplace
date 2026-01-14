import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import MenuBox from "../components/MenuBox";
import { useFavorites } from "../contexts/FavoritesContext";
import { getListingsByIds } from "../utils/listingsApi";
import "./home.css";
import "./favorites.css";

const CATEGORY_ATTRIBUTES = {
  "Manuel scolaire": [
    "titre",
    "cours",
    "prix",
    "condition",
    "description",
    "vendeur",
    "datePublication",
  ],
  Électronique: [
    "titre",
    "marque",
    "prix",
    "condition",
    "description",
    "vendeur",
  ],
  Meubles: ["titre", "type", "prix", "condition", "description", "vendeur"],
  Vêtements: [
    "titre",
    "taille",
    "genre",
    "prix",
    "condition",
    "description",
    "vendeur",
  ],
  Autre: ["titre", "prix", "condition", "description", "vendeur"],
};

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedListings = await getListingsByIds(favorites);
        setListings(fetchedListings || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des favoris:", err);
        setError("Erreur lors du chargement des favoris");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites]);

  const items = useMemo(() => {
    return listings.map((listing) => {
      const sellerName = listing.profiles
        ? `${listing.profiles.first_name} ${listing.profiles.last_name}`.trim() ||
          listing.profiles.email
        : "Vendeur inconnu";

      const imageUrl =
        listing.listing_images && listing.listing_images.length > 0
          ? listing.listing_images[0].path
          : "https://placehold.co/480x320/e5e7eb/6b7280?text=Pas+d'image&font=raleway";

      const datePublication = listing.created_at
        ? new Date(listing.created_at).toISOString().split("T")[0]
        : null;

      const categoryAttrs = listing.category_attributes || {};

      const example = {
        image: imageUrl,
        titre: listing.title,
        prix: listing.price,
        condition: listing.condition,
        description: listing.description || "",
        vendeur: sellerName,
        datePublication: datePublication,
        ...(listing.category === "Manuel scolaire" && {
          cours: listing.course || "",
        }),
        ...(listing.category === "Électronique" && {
          marque: categoryAttrs.marque || "",
        }),
        ...(listing.category === "Meubles" && {
          type: categoryAttrs.type || "",
        }),
        ...(listing.category === "Vêtements" && {
          taille: categoryAttrs.taille || "",
          genre: categoryAttrs.genre || "",
        }),
      };

      const attributes =
        CATEGORY_ATTRIBUTES[listing.category] || CATEGORY_ATTRIBUTES["Autre"];

      return {
        id: listing.id,
        catLabel: listing.category,
        attributes: attributes,
        example: example,
      };
    });
  }, [listings]);

  return (
    <div className="home-shell favorites-shell">
      <MenuBar onSearch={() => {}} onSellClick={() => navigate("/sell")} />

      <main className="home-main favorites-main">
        <section className="home-hero favorites-hero">
          <div className="home-hero__content">
            <span className="home-hero__badge">Favoris</span>
            <h1>Vos annonces sauvegardées</h1>
            <p>Retrouvez rapidement les annonces que vous aimez.</p>
          </div>
        </section>

        <section className="favorites-toolbar">
          <div className="favorites-count">
            {loading
              ? "Chargement..."
              : `${items.length} favori${items.length > 1 ? "s" : ""}`}
          </div>
          <button
            type="button"
            className="btn btn--ghost favorites-action"
            onClick={() => navigate("/")}
          >
            Explorer les annonces
          </button>
        </section>

        {loading ? (
          <section
            className="home-grid"
            style={{ padding: "2rem", textAlign: "center" }}
          >
            <p>Chargement des favoris...</p>
          </section>
        ) : error ? (
          <section
            className="home-grid"
            style={{ padding: "2rem", textAlign: "center" }}
          >
            <p style={{ color: "#c33" }}>{error}</p>
          </section>
        ) : items.length === 0 ? (
          <section
            className="home-grid"
            style={{ padding: "2rem", textAlign: "center" }}
          >
            <p>Vous n'avez pas encore de favoris.</p>
          </section>
        ) : (
          <section className="home-grid">
            {items.map(({ id, catLabel, attributes, example }) => (
              <MenuBox
                key={id}
                id={id}
                title={catLabel}
                attributes={attributes}
                example={example}
                isFavorite={isFavorite(id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}