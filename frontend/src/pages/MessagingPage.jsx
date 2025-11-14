import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMenuListings } from "../utils/MenuList";
import "./messaging.css";

export default function MessagingPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const listings = useMemo(() => getMenuListings(), []);
  const fallbackListing = useMemo(
    () => listings.find((item) => item.id === listingId) ?? null,
    [listingId, listings]
  );
  const listing = location.state?.listing ?? fallbackListing;
  const [draft, setDraft] = useState("");

  const sampleThread = useMemo(() => {
    if (!listing) return [];
    return [
      {
        id: "seller",
        author: listing.example.vendeur ?? "Vendeur",
        text: "Bonjour! L'annonce est toujours disponible. Avez-vous des questions?",
        tone: "received",
      },
      {
        id: "buyer",
        author: "Vous",
        text: "Bonjour, je suis intéressé·e. Est-il possible de le récupérer cette semaine?",
        tone: "sent",
      },
    ];
  }, [listing]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    alert("Message envoyé (simulation): " + draft.trim());
    setDraft("");
  };

  return (
    <div className="messaging-shell">
      <div className="messaging-header">
        <button className="btn btn--ghost" type="button" onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <h1>Messagerie</h1>
      </div>

      {!listing ? (
        <div className="messaging-empty">
          <p>Aucune annonce trouvée pour cette conversation.</p>
          <button className="btn btn--primary" type="button" onClick={() => navigate("/")}>
            Revenir aux annonces
          </button>
        </div>
      ) : (
        <div className="messaging-layout">
          <aside className="messaging-summary">
            <img src={listing.example.image} alt={listing.example.titre ?? listing.catLabel} />
            <div>
              <p className="messaging-summary__category">{listing.catLabel}</p>
              <h2>{listing.example.titre ?? listing.catLabel}</h2>
              <p className="messaging-summary__price">
                {listing.example.prix !== undefined ? `${listing.example.prix} $` : "Prix à discuter"}
              </p>
              <p className="messaging-summary__seller">Vendeur: {listing.example.vendeur ?? "Non précisé"}</p>
            </div>
          </aside>

          <section className="messaging-thread">
            <div className="messaging-thread__messages">
              {sampleThread.map((message) => (
                <div key={message.id} className={`message message--${message.tone}`}>
                  <span className="message__author">{message.author}</span>
                  <p>{message.text}</p>
                </div>
              ))}
              {!sampleThread.length && <p className="message message--info">Aucun message pour le moment.</p>}
            </div>

            <form className="messaging-composer" onSubmit={handleSubmit}>
              <textarea
                placeholder="Écrivez votre message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
              />
              <button className="btn btn--primary" type="submit">
                Envoyer
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
