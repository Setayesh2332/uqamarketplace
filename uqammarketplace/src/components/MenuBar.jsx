import { useState } from "react";
import { FaPowerOff, FaSearch, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../contexts/AuthContext";

export default function MenuBar({ onSearch, onSellClick, categories = [], conditions = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Unable to sign out", err);
    }
  };

  return (
    <header className="menubar-header">
      <div className="container menubar-header__row">
        <div className="brand">
          <span className="brand__text">UQAMMarketplace</span>
        </div>

        <SearchBar onSearch={onSearch} categories={categories} conditions={conditions} />

        <div className="header-actions">
          <button className="btn btn--primary" onClick={onSellClick}>
            Vendre
          </button>

          <div className="header-avatar">
            <button
              className="icon-user"
              aria-label="Profil utilisateur"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <FaUser />
            </button>
            {menuOpen && (
              <div className="account-menu" role="menu">
                <button className="account-menu__item" onClick={handleLogout} role="menuitem">
                  Se déconnecter
                </button>
              </div>
            )}
          </div>

          <button className="logout-inline" onClick={handleLogout}>
            <FaPowerOff className="logout-inline__icon" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </header>
  );
}
