import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import {
  getConversationWithMessages,
  sendMessage,
  subscribeToMessages,
} from "../utils/conversationsApi";
import { useAuth } from "../contexts/AuthContext";
import "./Chat.css";

export default function Chat() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Récupérer le message initial depuis l'état de navigation
  useEffect(() => {
    if (location.state?.initialMessage) {
      setMessageText(location.state.initialMessage);
    }
  }, [location.state]);

  // Charger la conversation et les messages
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchConversation = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getConversationWithMessages(conversationId);
        setConversation(data);
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Erreur lors de la récupération de la conversation:", err);
        setError(err.message || "Impossible de charger la conversation");
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, user, authLoading, navigate]);

  // S'abonner aux nouveaux messages en temps réel
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => {
        // Éviter les doublons
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  // Scroller vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB max
        setError("L'image est trop grande (max 5MB)");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !imageFile) {
      setError("Veuillez entrer un message ou sélectionner une image");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const newMessage = await sendMessage(
        conversationId,
        messageText.trim(),
        imageFile
      );
      
      // Ajouter le message à la liste (il sera aussi ajouté via le subscription)
      setMessages((prev) => [...prev, newMessage]);
      
      // Réinitialiser le formulaire
      setMessageText("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      setError(err.message || "Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) {
      return "À l'instant";
    } else if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="chat-page">
        <MenuBar onSearch={() => {}} onSellClick={() => navigate("/sell")} />
        <div className="chat-page-content">
          <div className="chat-container">
            <div className="chat-loading">
              <p>Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="chat-page">
        <MenuBar onSearch={() => {}} onSellClick={() => navigate("/sell")} />
        <div className="chat-page-content">
          <div className="chat-container">
            <div className="chat-error">
              <p>{error}</p>
              <button className="btn-back-to-messages" onClick={() => navigate("/messages")}>
                Retour aux messages
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <div className="chat-page">
      <MenuBar onSearch={() => {}} onSellClick={() => navigate("/sell")} />
      <div className="chat-page-content">
        <button className="btn-back-chat" onClick={() => navigate("/messages")}>
          ← Retour
        </button>
        <div className="chat-container">
          {/* Header avec infos de l'autre utilisateur et de l'annonce */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-user">
                <h2 className="chat-other-name">{conversation.otherUser.fullName}</h2>
              </div>
              {conversation.listing && (
                <div className="chat-header-listing">
                  <div className="chat-listing-image">
                    {conversation.listing.listing_images?.[0] ? (
                      <img
                        src={conversation.listing.listing_images[0].path}
                        alt={conversation.listing.title}
                      />
                    ) : (
                      <img
                        src="https://picsum.photos/480/320?placeholder"
                        alt="Placeholder"
                        className="chat-listing-image-placeholder-img"
                      />
                    )}
                  </div>
                  <div className="chat-listing-info">
                    <p className="chat-listing-title">{conversation.listing.title}</p>
                    <p className="chat-listing-price">{conversation.listing.price} $</p>
                  </div>
                </div>
              )}
            </div>
            </div>

          {/* Zone des messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>Aucun message pour le moment. Envoyez le premier message !</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-bubble ${
                    message.isFromCurrentUser ? "message-sent" : "message-received"
                  }`}
                >
                  {!message.isFromCurrentUser && (
                    <div className="message-sender-name">
                      {message.sender?.fullName || "Utilisateur"}
                    </div>
                  )}
                  {message.image_url && (
                    <div className="message-image">
                      <img src={message.image_url} alt="Pièce jointe" />
                    </div>
                  )}
                  {message.content && (
                    <div className="message-content">{message.content}</div>
                  )}
                  <div className="message-time">{formatMessageTime(message.created_at)}</div>

                </div>
              ))
              )}
            <div ref={messagesEndRef} />
          </div>
          {/* Zone de saisie */}
          {error && (
            <div className="chat-error-message">
              <p>{error}</p>
            </div>
            )}
            {imagePreview && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={imagePreview} alt="Aperçu" />
                <button
                  className="btn-remove-image"
                  onClick={handleRemoveImage}
                  aria-label="Retirer l'image"
                >
                  ×
                </button>
              </div>
            </div>
            )}
            <div className="chat-input-container">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <button
              className="btn-attach-image"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Joindre une image"
            >
              +
            </button>
            <input
              type="text"
              className="chat-input"
              placeholder="Tapez votre message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !sending) {
                  handleSendMessage();
                }
              }}
              disabled={sending}
            />
            <button
              className="btn-send-chat"
              onClick={handleSendMessage}
              disabled={sending || (!messageText.trim() && !imageFile)}
            >
              {sending ? "..." : "Envoyer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}