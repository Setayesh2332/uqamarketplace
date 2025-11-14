import { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";

const defaultFilters = {
  query: "",
  category: "all",
  priceMin: "",
  priceMax: "",
  condition: "all",
};

export default function SearchBar({ onSearch, categories = [], conditions = [] }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key) => (event) => {
    const value = event.target.value;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSearch?.({ ...filters, query: filters.query.trim() });
  };

  const reset = () => {
    setFilters(defaultFilters);
    onSearch?.(defaultFilters);
  };

  const hasAdvancedFilters = useMemo(() => categories.length > 0 || conditions.length > 0, [categories.length, conditions.length]);

  return (
    <form className="searchbar" onSubmit={submit} role="search">
      <div className="searchbar__row">
        <FaSearch className="searchbar__icon" />
        <input
          className="searchbar__input"
          value={filters.query}
          onChange={handleChange("query")}
          placeholder="Que cherchez-vous ?"
          aria-label="Que cherchez-vous ?"
        />
        <button className="btn btn--primary" type="submit">
          Rechercher
        </button>
        {hasAdvancedFilters && (
          <button
            type="button"
            className="btn btn--ghost searchbar__toggle"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Masquer les filtres" : "Filtres avancés"}
          </button>
        )}
      </div>

      {expanded && (
        <>
          <div className="searchbar__advanced">
            <label>
              <span>Catégorie</span>
              <select value={filters.category} onChange={handleChange("category")}>
                <option value="all">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>État</span>
              <select value={filters.condition} onChange={handleChange("condition")}>
                <option value="all">Tous les états</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Prix min ($)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={filters.priceMin}
                onChange={handleChange("priceMin")}
                placeholder="0"
              />
            </label>

            <label>
              <span>Prix max ($)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={filters.priceMax}
                onChange={handleChange("priceMax")}
                placeholder="500"
              />
            </label>
          </div>

          <div className="searchbar__actions">
            <button type="button" className="btn btn--ghost" onClick={reset}>
              Réinitialiser
            </button>
          </div>
        </>
      )}
    </form>
  );
}
