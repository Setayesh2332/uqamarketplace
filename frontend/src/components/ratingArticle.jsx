import React, { useState } from "react";
import { Star } from "lucide-react";
import "./ratingArticle.css";

const ArticleRating = ({ articleId, userId }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  const handleRating = (rating) => {
    if (!userId) {
      alert("Vous devez être connecté pour noter le vendeur");
      return;
    }

    setUserRating(rating);
    setHasVoted(true);

    const newTotal = totalVotes + 1;
    const newAverage = (averageRating * totalVotes + rating) / newTotal;
    setAverageRating(newAverage);
    setTotalVotes(newTotal);
  };

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
          {hasVoted ? "Modifier votre note :" : "Notez le vendeur :"}
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
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRating(star)}
              style={{ cursor: "pointer", transition: "all 0.2s" }}
            />
          ))}
        </div>
        {hasVoted && (
          <p className="user-rating-text">
            Votre note : {userRating} étoile{userRating > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default ArticleRating;
