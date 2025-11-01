import { FaSearch, FaUser } from "react-icons/fa";
import SearchBar from "./SearchBar";

export default function MenuBar({ onSearch, onSellClick }) {
  return (
    <header className="menubar-header">
      <div className="container menubar-header__row">
        <div className="brand">
          <span className="brand__text">UQAMMarketplace</span>
        </div>

        <SearchBar onSearch={onSearch} icon={<FaSearch />} />

        <div className="header-actions">
          <button className="btn btn--primary" onClick={onSellClick}>
            Vendre
          </button>
          <button className="icon-user" aria-label="Profil utilisateur">
            <FaUser />
          </button>
        </div>
      </div>
    </header>
  );
}
