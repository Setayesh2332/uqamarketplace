import { FaPowerOff, FaSearch, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../contexts/AuthContext";
import "./MenuBar.css";

export default function MenuBar({ onSearch, onSellClick }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Unable to sign out", err);
    }
  };

  const handleSellClick = () => {
    navigate("/sell");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <header className="menubar-header">
      <div className="container menubar-header__row">
        <div className="brand">
          <button
            className="brand-btn"
            onClick={handleHomeClick}
            aria-label="Accueil"
          >
            <span className="brand__text">UQAMarketplace</span>
          </button>
        </div>
        <SearchBar onSearch={onSearch} icon={<FaSearch />} />
        <div className="header-actions">
          <button className="btn btn--primary" onClick={handleSellClick}>
            Vendre
          </button>
          <div className="header-avatar">
            <button
              className="icon-user"
              aria-label="Profil utilisateur"
              onClick={() => navigate("/profile")}
            >
              <FaUser />
            </button>
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
