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

        {!loading && conversations.length === 0 && (
          <div className="messages-empty">
            <p className="messages-empty-text">
              Vous n'avez pas encore de conversations.
            </p>
            <p className="messages-empty-hint">
              Contactez un vendeur depuis une annonce pour commencer à discuter.
            </p>
          </div>
        )}

        {conversations.length > 0 && (
          <div className="conversations-list">
            {conversations.map((conversation) => (
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

