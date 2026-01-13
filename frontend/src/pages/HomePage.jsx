import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
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

const categories = ["Manuel scolaire", "Électronique", "Meubles", "Vêtements", "Autre"];
const conditions = ["Neuf", "Comme neuf", "Bon", "Acceptable"];

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
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

        if (sort === "lowest") {
          sortField = "price";
          sortOrder = "asc";
        } else if (sort === "highest") {
          sortField = "price";
          sortOrder = "desc";
        } else if (sort === "newest") {
          sortField = "created_at";
          sortOrder = "desc";
        }

        const filters = {
          status: "active",
        };

        if (query.trim()) {
          filters.search = query.trim();
        }

        if (minPrice && !isNaN(parseFloat(minPrice))) {
          filters.min_price = parseFloat(minPrice);
        }

        if (maxPrice && !isNaN(parseFloat(maxPrice))) {
          filters.max_price = parseFloat(maxPrice);
        }

        if (selectedConditions.length > 0) {
          filters.conditions = selectedConditions;
        }
        
        if (selectedCategories.length > 0) {
          filters.categories = selectedCategories;
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
  }, [query, sort, minPrice, maxPrice, selectedConditions, selectedCategories]);

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
        : "https://placehold.co/480x320/e5e7eb/6b7280?text=Pas+d'image&font=raleway";

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

  const toggleCondition = (condition) => {
    setSelectedConditions(prev =>
        prev.includes(condition)
            ? prev.filter(c => c !== condition)
            : [...prev, condition]
    );
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
        prev.includes(category)
            ? prev.filter(c => c !== category)
            : [...prev, category]
    );
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedConditions([]);
    setSelectedCategories([]);
  };

  const hasActiveFilters = minPrice || maxPrice || selectedConditions.length > 0 || selectedCategories.length > 0;

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

            <div className="home-toolbar__controls">
              {/* Sort Button */}
              <div className="control-dropdown">
                <button
                    onClick={() => {
                      setSortOpen(!sortOpen);
                      setFilterOpen(false);
                    }}
                    disabled={loading}
                    className="control-button"
                >
                  <span>TRIER PAR</span>
                  {sortOpen ? <X className="control-icon" /> : <Plus className="control-icon" />}
                </button>

                {sortOpen && (
                    <div className="dropdown-panel">
                      {[
                        { value: "newest", label: "Plus récent" },
                        { value: "lowest", label: "Prix le plus bas" },
                        { value: "highest", label: "Prix le plus élevé" }
                      ].map(option => (
                          <button
                              key={option.value}
                              onClick={() => {
                                setSort(option.value);
                                setSortOpen(false);
                              }}
                              className={`dropdown-option ${sort === option.value ? 'active' : ''}`}
                          >
                            <div className="option-radio">
                              <div className={`radio-outer ${sort === option.value ? 'checked' : ''}`}>
                                {sort === option.value && <div className="radio-inner" />}
                              </div>
                              {option.label}
                            </div>
                          </button>
                      ))}
                    </div>
                )}
              </div>

              {/* Filter Button */}
              <div className="control-dropdown">
                <button
                    onClick={() => {
                      setFilterOpen(!filterOpen);
                      setSortOpen(false);
                    }}
                    disabled={loading}
                    className="control-button"
                >
                  <span>FILTRE</span>
                  {filterOpen ? <X className="control-icon" /> : <Plus className="control-icon" />}
                </button>

                {filterOpen && (
                    <div className="dropdown-panel dropdown-panel--wide">
                      {/* Price Range */}
                      <div className="filter-section">
                        <h3 className="filter-section__title">FOURCHETTE DE PRIX</h3>
                        <div className="price-inputs">
                          <div className="price-input-group">
                            <label className="price-label">Min</label>
                            <input
                                type="number"
                                placeholder="$ 0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="price-input"
                            />
                          </div>
                          <div className="price-input-group">
                            <label className="price-label">Max</label>
                            <input
                                type="number"
                                placeholder="$ 10000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="price-input"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Condition */}
                      <div className="filter-section">
                        <h3 className="filter-section__title">ÉTAT</h3>
                        <div className="checkbox-group">
                          {conditions.map(condition => (
                              <label key={condition} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={selectedConditions.includes(condition)}
                                    onChange={() => toggleCondition(condition)}
                                    className="checkbox-input"
                                />
                                <span>{condition}</span>
                              </label>
                          ))}
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="filter-section">
                        <h3 className="filter-section__title">CATÉGORIES</h3>
                        <div className="checkbox-group">
                          {categories.map(category => (
                              <label key={category} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => toggleCategory(category)}
                                    className="checkbox-input"
                                />
                                <span>{category}</span>
                              </label>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="filter-actions">
                        <button
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                            className="filter-action-btn filter-action-btn--clear"
                        >
                          EFFACER
                        </button>
                        <button
                            onClick={() => setFilterOpen(false)}
                            className="filter-action-btn filter-action-btn--apply"
                        >
                          VOIR [{items.length}]
                        </button>
                      </div>
                    </div>
                )}
              </div>
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