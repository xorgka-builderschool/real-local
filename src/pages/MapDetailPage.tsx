import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MapView } from "../components/MapView";
import { PlaceRow } from "../components/PlaceRow";
import "./MapDetailPage.css";

export function MapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { maps, places, reviews, user, savedMapIds, savedPlaceIds, toggleSaveMap, toggleSavePlace, addReview } =
    useApp();
  const [shareMessage, setShareMessage] = useState("");
  const [reviewDraft, setReviewDraft] = useState("");

  const map = maps.find((m) => m.id === id);
  const mapPlaces = places.filter((p) => p.mapId === id);
  const mapReviews = reviews.filter((r) => r.mapId === id);

  if (!map) {
    return (
      <div className="screen-padded">
        <p>Map not found.</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  const isSaved = savedMapIds.includes(map.id);

  const handleToggleSaveMap = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleSaveMap(map.id);
  };

  const handleTogglePlace = (placeId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleSavePlace(placeId);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/maps/${map.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: map.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("Link copied!");
        setTimeout(() => setShareMessage(""), 2000);
      }
    } catch {
      setShareMessage("Couldn't share this map.");
      setTimeout(() => setShareMessage(""), 2000);
    }
  };

  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!reviewDraft.trim()) return;
    addReview(map.id, reviewDraft.trim());
    setReviewDraft("");
  };

  return (
    <div className="map-detail-page">
      <div className="map-detail-page__top-bar">
        <button className="map-detail-page__back" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <h1>{map.title}</h1>
      </div>

      <MapView places={mapPlaces} />

      <div className="screen-padded">
        <p className="map-detail-page__desc">{map.description}</p>

        <div className="map-detail-page__actions">
          <button className={`map-detail-page__save ${isSaved ? "is-saved" : ""}`} onClick={handleToggleSaveMap}>
            {isSaved ? "★ Saved" : "☆ Save Map"}
          </button>
          <button className="map-detail-page__share" onClick={handleShare}>
            Share
          </button>
          {shareMessage && <span className="map-detail-page__share-msg">{shareMessage}</span>}
        </div>

        <h2 className="map-detail-page__section-title">Places ({mapPlaces.length})</h2>
        <div className="map-detail-page__places">
          {mapPlaces.map((place) => (
            <PlaceRow
              key={place.id}
              place={place}
              saved={savedPlaceIds.includes(place.id)}
              onToggleSave={() => handleTogglePlace(place.id)}
            />
          ))}
        </div>

        <h2 className="map-detail-page__section-title">Reviews</h2>
        {user ? (
          <form className="map-detail-page__review-form" onSubmit={handleSubmitReview}>
            <input
              value={reviewDraft}
              onChange={(e) => setReviewDraft(e.target.value)}
              placeholder="Share what you thought of this map..."
            />
            <button type="submit">Post</button>
          </form>
        ) : (
          <p className="map-detail-page__login-hint">
            <Link to="/login">Log in</Link> to write a review for this map.
          </p>
        )}
        <div className="map-detail-page__reviews">
          {mapReviews.length === 0 && <p className="map-detail-page__empty">No reviews yet — be the first.</p>}
          {mapReviews.map((review) => (
            <div key={review.id} className="map-detail-page__review">
              <p>"{review.content}"</p>
              <span>
                — {review.author} · {review.createdAt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
