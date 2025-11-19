import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSearch?.(q.trim());
  };

  return (
    <form className="searchbar" onSubmit={submit} role="search">
      <FaSearch className="searchbar__icon" />
      <input
        className="searchbar__input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Que cherchez-vous ?"
        aria-label="Que cherchez-vous ?"
      />
      <button className="btn btn--primary" type="submit">
        Rechercher
      </button>
    </form>
  );
}
