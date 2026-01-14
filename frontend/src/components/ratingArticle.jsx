import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import "./ratingArticle.css";
import {
  getSellerRatings,
  getUserRatingForSeller,
  submitRating,
} from "../utils/ratingsApi";

const ArticleRating = ({ sellerId, userId }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isOwnListing = sellerId && userId && sellerId === userId;

  useEffect(() => {
    const fetchRatings = async () => {
      if (!sellerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
      
        const ratingsData = await getSellerRatings(sellerId);
        setAverageRating(ratingsData.averageRating);
        setTotalVotes(ratingsData.totalVotes);

        if (userId) {
          const userRatingData = await getUserRatingForSeller(sellerId, userId);
          if (userRatingData) {
            setUserRating(userRatingData.rating);
            setHasVoted(true);
          }
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [sellerId, userId]);

  const handleRating = async (rating) => {
    if (!sellerId) {
      alert("Impossible d'évaluer ce vendeur pour le moment.");
      return;
    }

    if (!userId) {
      alert("Vous devez être connecté pour noter le vendeur");
      return;
    }

    if (isOwnListing) {
      alert("Vous ne pouvez pas noter votre propre annonce.");
      return;
    }

    try {
      setSubmitting(true);
  
      await submitRating(sellerId, userId, rating);

      setUserRating(rating);
      setHasVoted(true);

      const ratingsData = await getSellerRatings(sellerId);
      setAverageRating(ratingsData.averageRating);
      setTotalVotes(ratingsData.totalVotes);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Erreur lors de l'enregistrement de votre note. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="article-rating">
        <p>Chargement des évaluations...</p>
      </div>
    );
  }

  return (
    <div className="article-rating">
      <div className="rating-summary">
        <div className="average-rating">
          <span className="rating-number">
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
          </span>
          <div className="stars-display">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                fill={star <= Math.round(averageRating) ? "#FFD700" : "none"}
                stroke={
                  star <= Math.round(averageRating) ? "#FFD700" : "#D1D5DB"
                }
              />
            ))}
          </div>
        </div>
        <span className="vote-count">
          {totalVotes} {totalVotes <= 1 ? "vote" : "votes"}
        </span>
      </div>

      <div className="rating-input">
        <p className="rating-label">
          {isOwnListing
            ? "Vous ne pouvez pas noter votre propre annonce."
            : hasVoted
              ? "Modifier votre note :"
              : "Notez le vendeur :"}
        </p>
        <div className="stars-interactive">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={32}
              className="star-button"
              fill={star <= (hoverRating || userRating) ? "#FFD700" : "none"}
              stroke={
                star <= (hoverRating || userRating) ? "#FFD700" : "#9CA3AF"
              }
              onMouseEnter={() =>
                !submitting && !isOwnListing && setHoverRating(star)
              }
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => !submitting && !isOwnListing && handleRating(star)}
              style={{
                cursor: submitting || isOwnListing ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: submitting || isOwnListing ? 0.5 : 1,
              }}
            />
          ))}
        </div>
        {submitting && <p className="user-rating-text">Enregistrement...</p>}
        {hasVoted && !submitting && (
          <p className="user-rating-text">
            Votre note : {userRating} étoile{userRating > 1 ? "s" : ""}
          </p>
        )}
        {!userId && (
          <p className="user-rating-text">
            Connectez-vous pour attribuer une note.
          </p>
        )}
      </div>
    </div>
  );
};

export default ArticleRating;
