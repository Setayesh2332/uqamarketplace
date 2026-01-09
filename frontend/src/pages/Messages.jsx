import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import { getUserConversations } from "../utils/conversationsApi";
import { useAuth } from "../contexts/AuthContext";
import "./Messages.css";

export default function Messages() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("selling"); // "buying" or "selling"

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserConversations();
        setConversations(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des conversations:", err);
        setError("Impossible de charger les conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, authLoading, navigate]);

  // Séparer les conversations en deux catégories
  // "Mes ventes" = conversations où JE suis le vendeur (c'est MON produit)
  // "Mes achats" = conversations où quelqu'un d'autre est le vendeur (je suis intéressé par LEUR produit)
  const sellingConversations = conversations.filter(
      (conv) => conv.listing?.user_id === user?.id
  );

  const buyingConversations = conversations.filter(
      (conv) => conv.listing?.user_id !== user?.id
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Hier";
    } else if (days < 7) {
      return date.toLocaleDateString("fr-FR", { weekday: "short" });
    } else {
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    }
  };

  const displayedConversations = activeTab === "buying" ? buyingConversations : sellingConversations;

  if (authLoading || loading) {
    return (
        <div className="messages-page">
          <MenuBar onSearch={() => {}} onSellClick={() => navigate("/sell")} />
          <div className="messages-container">
            <div className="messages-loading">
              <p>Chargement...</p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="messages-page">
        <MenuBar onSearch={() => {}} onSellClick={() => navigate("/sell")} />
        <div className="messages-container">
          <div className="messages-header">
            <h1 className="messages-title">Messages</h1>
          </div>

          {error && (
              <div className="messages-error">
                <p>{error}</p>
              </div>
          )}

          {/* Tabs */}
          <div className="messages-tabs">
            <button
                className={`tab-button ${activeTab === "buying" ? "active" : ""}`}
                onClick={() => setActiveTab("buying")}
            >
              <span className="tab-icon">💬</span>
              <span className="tab-text">Mes achats</span>
              {buyingConversations.length > 0 && (
                  <span className="tab-badge">{buyingConversations.length}</span>
              )}
            </button>
            <button
                className={`tab-button ${activeTab === "selling" ? "active" : ""}`}
                onClick={() => setActiveTab("selling")}
            >
              <span className="tab-icon">📦</span>
              <span className="tab-text">Mes ventes</span>
              {sellingConversations.length > 0 && (
                  <span className="tab-badge">{sellingConversations.length}</span>
              )}
            </button>
          </div>

          {/* Empty State */}
          {!loading && displayedConversations.length === 0 && (
              <div className="messages-empty">
                {activeTab === "buying" ? (
                    <>
                      <p className="messages-empty-icon">🛍️</p>
                      <p className="messages-empty-text">
                        Aucune conversation d'achat
                      </p>
                      <p className="messages-empty-hint">
                        Contactez un vendeur depuis une annonce pour commencer à discuter.
                      </p>
                    </>
                ) : (
                    <>
                      <p className="messages-empty-icon">📦</p>
                      <p className="messages-empty-text">
                        Aucune conversation de vente
                      </p>
                      <p className="messages-empty-hint">
                        Les acheteurs intéressés par vos annonces apparaîtront ici.
                      </p>
                    </>
                )}
              </div>
          )}

          {/* Conversations List */}
          {displayedConversations.length > 0 && (
              <div className="conversations-list">
                {displayedConversations.map((conversation) => (
                    <div
                        key={conversation.id}
                        className="conversation-item"
                        onClick={() => navigate(`/chat/${conversation.id}`)}
                    >
                      <div className="conversation-image">
                        {conversation.listing?.listing_images?.[0] ? (
                            <img
                                src={conversation.listing.listing_images[0].path}
                                alt={conversation.listing.title}
                            />
                        ) : (
                            <img
                                src="https://picsum.photos/480/320?placeholder"
                                alt="Placeholder"
                                className="conversation-image-placeholder-img"
                            />
                        )}
                      </div>
                      <div className="conversation-content">
                        <div className="conversation-header">
                          <h3 className="conversation-other-name">
                            {conversation.otherUser.fullName}
                          </h3>
                          <span className="conversation-date">
                      {formatDate(conversation.updated_at)}
                    </span>
                        </div>
                        <p className="conversation-listing-title">
                          {conversation.listing?.title || "Annonce supprimée"}
                        </p>
                        <p className="conversation-listing-price">
                          {conversation.listing?.price ? `${conversation.listing.price} $` : ""}
                        </p>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}