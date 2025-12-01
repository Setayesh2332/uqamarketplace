import { FaSearch, FaUser, FaSignOutAlt, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../contexts/AuthContext";
import "./MenuBar.css";

export default function MenuBar({ onSearch }) {
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

  const handleSellClick = () => navigate("/sell");
  const handleHomeClick = () => navigate("/");
  const handleMessagesClick = () => navigate("/messages");

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
            <button
                className="icon-messages"
                aria-label="Messages"
                onClick={handleMessagesClick}
            >
              <FaEnvelope />
            </button>
            <button
                className="icon-user"
                aria-label="Profil utilisateur"
                onClick={() => navigate("/profile")}
            >
              <FaUser />
            </button>
            <button
                className="logout-icon-btn"
                onClick={handleLogout}
                aria-label="Se déconnecter"
            >
              <FaSignOutAlt />
            </button>

          </div>
        </div>
      </header>
  );
}
