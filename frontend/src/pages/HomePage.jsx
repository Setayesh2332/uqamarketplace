import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import MenuBox from "../components/MenuBox";
import { getListings } from "../utils/listingsApi";
import "./home.css";

// Mapper les catégories aux attributs basé sur la structure MenuList
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

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("prix_asc");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les annonces depuis l'API
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mapper les options de tri au format API
        let sortField = "created_at";
        let sortOrder = "desc";

        if (sort === "prix_asc") {
          sortField = "price";
          sortOrder = "asc";
        } else if (sort === "prix_desc") {
          sortField = "price";
          sortOrder = "desc";
        } else if (sort === "recent") {
          sortField = "created_at";
          sortOrder = "desc";
        }

        const filters = {
          status: "active",
        };

        if (query.trim()) {
          filters.search = query.trim();
        }

        const { listings: fetchedListings } = await getListings(
          filters,
          { field: sortField, order: sortOrder },
          100 // Limite
        );

        setListings(fetchedListings || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des annonces:", err);
        setError("Erreur lors du chargement des annonces");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [query, sort]);

  // Transformer les annonces de la base de données au format MenuBox
  const items = useMemo(() => {
    return listings.map((listing) => {
      // Obtenir le nom du vendeur
      const sellerName = listing.profiles
        ? `${listing.profiles.first_name} ${listing.profiles.last_name}`.trim() ||
          listing.profiles.email
        : "Vendeur inconnu";

      // Obtenir la première image ou une image de remplacement
      const imageUrl =
        listing.listing_images && listing.listing_images.length > 0
          ? listing.listing_images[0].path
          : "https://picsum.photos/480/320?placeholder";

      // Formater la date
      const datePublication = listing.created_at
        ? new Date(listing.created_at).toISOString().split("T")[0]
        : null;

      // Obtenir les attributs spécifiques à la catégorie
      const categoryAttrs = listing.category_attributes || {};

      // Construire l'objet example
      const example = {
        image: imageUrl,
        titre: listing.title,
        prix: listing.price,
        condition: listing.condition,
        description: listing.description || "",
        vendeur: sellerName,
        datePublication: datePublication,
        // Ajouter les attributs spécifiques à la catégorie
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

      // Obtenir les attributs pour cette catégorie
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
    <div className="home-shell">
      <MenuBar onSearch={setQuery} onSellClick={() => navigate("/sell")} />

      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero__content">
            <span className="home-hero__badge">Marketplace étudiant</span>
            <h1>Tout échanger sur le campus en un seul endroit.</h1>
            <p>
              Parcourez les manuels, services ou équipements proposés par la
              communauté UQAM. Filtrez par prix ou fraîcheur pour trouver la
              bonne affaire.
            </p>
          </div>
        </section>

        <section className="home-toolbar">
          <div className="home-toolbar__result">
            {loading ? (
              "Chargement..."
            ) : error ? (
              <span style={{ color: "#c33" }}>{error}</span>
            ) : (
              `${items.length} annonce${
                items.length > 1 ? "s" : ""
              } disponible${items.length > 1 ? "s" : ""}`
            )}
          </div>
          <div className="home-toolbar__filter">
            <label htmlFor="sort">Trier par</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              disabled={loading}
            >
              <option value="prix_asc">Prix le plus bas</option>
              <option value="prix_desc">Prix le plus élevé</option>
              <option value="recent">Plus récent</option>
            </select>
          </div>
        </section>

        {loading ? (
          <section
            className="home-grid"
            style={{ padding: "2rem", textAlign: "center" }}
          >
            <p>Chargement des annonces...</p>
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
            <p>Aucune annonce disponible pour le moment.</p>
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
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
