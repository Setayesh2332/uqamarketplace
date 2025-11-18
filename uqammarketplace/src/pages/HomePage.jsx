import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import MenuBox from "../components/MenuBox";
import { getMenuListings } from "../utils/MenuList";
import "./home.css";

export default function HomePage() {
  const [filters, setFilters] = useState({
    query: "",
    category: "all",
    priceMin: "",
    priceMax: "",
    condition: "all",
  });
  const [sort, setSort] = useState("prix_asc");
  const navigate = useNavigate();

  const items = useMemo(() => {
    return getMenuListings();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.catLabel)));
  }, [items]);

  const conditions = useMemo(() => {
    const unique = new Set();
    items.forEach((item) => {
      if (item.example.condition) {
        unique.add(item.example.condition);
      }
    });
    return Array.from(unique);
  }, [items]);

  const handleMessage = useCallback(
    (listing) => {
      navigate(`/messaging/${listing.id}`, { state: { listing } });
    },
    [navigate]
  );

  const handleSearch = useCallback((nextFilters) => {
    setFilters({
      query: nextFilters?.query ?? "",
      category: nextFilters?.category ?? "all",
      priceMin: nextFilters?.priceMin ?? "",
      priceMax: nextFilters?.priceMax ?? "",
      condition: nextFilters?.condition ?? "all",
    });
  }, []);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return items.filter(({ example, catLabel }) => {
      if (q) {
        const hay = `${example.titre ?? ""} ${example.description ?? ""} ${example.vendeur ?? ""}`.toLowerCase();
        if (!hay.includes(q)) {
          return false;
        }
      }

      if (filters.category !== "all" && catLabel !== filters.category) {
        return false;
      }

      const priceValue = example.prix ?? example.tarifHoraire ?? null;
      if (filters.priceMin !== "") {
        const min = Number(filters.priceMin);
        if (!Number.isNaN(min) && (priceValue === null || Number(priceValue) < min)) {
          return false;
        }
      }

      if (filters.priceMax !== "") {
        const max = Number(filters.priceMax);
        if (!Number.isNaN(max) && (priceValue === null || Number(priceValue) > max)) {
          return false;
        }
      }

      if (filters.condition !== "all" && example.condition !== filters.condition) {
        return false;
      }

      return true;
    });
  }, [filters, items]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    const getPrice = (example, fallback) => example.prix ?? example.tarifHoraire ?? fallback;
    if (sort === "prix_asc") {
      copy.sort((a, b) => getPrice(a.example, Infinity) - getPrice(b.example, Infinity));
    } else if (sort === "prix_desc") {
      copy.sort((a, b) => getPrice(b.example, -Infinity) - getPrice(a.example, -Infinity));
    } else if (sort === "recent") {
      copy.sort((a, b) => {
        const da = Date.parse(a.example.datePublication ?? "1970-01-01");
        const db = Date.parse(b.example.datePublication ?? "1970-01-01");
        return db - da;
      });
    }
    return copy;
  }, [filtered, sort]);

  return (
    <div className="home-shell">
      <MenuBar
        onSearch={handleSearch}
        onSellClick={() => alert("Vendre (à brancher)")}
        categories={categories}
        conditions={conditions}
      />

      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero__content">
            <span className="home-hero__badge">Marketplace étudiant</span>
            <h1>Tout échanger sur le campus en un seul endroit.</h1>
            <p>
              Parcourez les manuels, services ou équipements proposés par la communauté UQAM.
              Filtrez par prix ou fraîcheur pour trouver la bonne affaire.
            </p>
          </div>
          <div className="home-hero__cta">
            <button className="btn btn--primary" onClick={() => alert("Publier une annonce")}>Publier une annonce</button>
            <button className="btn btn--ghost" onClick={() => alert("Voir mes favoris")}>Voir mes favoris</button>
          </div>
        </section>

        <section className="home-toolbar">
          <div className="home-toolbar__result">
            {sorted.length} annonce{sorted.length > 1 ? "s" : ""} disponibles
          </div>
          <div className="home-toolbar__filter">
            <label htmlFor="sort">Trier par</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="prix_asc">Prix le plus bas</option>
              <option value="prix_desc">Prix le plus élevé</option>
              <option value="recent">Plus récent</option>
            </select>
          </div>
        </section>

        <section className="home-grid">
          {sorted.map((listing) => (
            <MenuBox
              key={listing.id}
              title={listing.catLabel}
              attributes={listing.attributes}
              example={listing.example}
              onMessage={() => handleMessage(listing)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
