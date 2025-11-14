import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import MenuBox from "../components/MenuBox";
import { getMenuListings } from "../utils/MenuList";
import "./home.css";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("prix_asc");
  const navigate = useNavigate();

  const items = useMemo(() => {
    return getMenuListings();
  }, []);

  const handleMessage = useCallback(
    (listing) => {
      navigate(`/messaging/${listing.id}`, { state: { listing } });
    },
    [navigate]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(({ example }) => {
      const hay = `${example.titre ?? ""} ${example.description ?? ""} ${example.vendeur ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sort === "prix_asc") {
      copy.sort((a, b) => (a.example.prix ?? Infinity) - (b.example.prix ?? Infinity));
    } else if (sort === "prix_desc") {
      copy.sort((a, b) => (b.example.prix ?? -Infinity) - (a.example.prix ?? -Infinity));
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
      <MenuBar onSearch={setQuery} onSellClick={() => alert("Vendre (à brancher)")} />

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
