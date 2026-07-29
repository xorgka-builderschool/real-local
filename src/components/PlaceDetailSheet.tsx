import { useEffect, useState } from "react";
import type { Place } from "../types";
import { MapView } from "./MapView";
import { fetchGooglePlaceDetails, formatPriceLevel, type GooglePlaceDetails } from "../lib/googlePlaces";
import "./PlaceDetailSheet.css";

export function PlaceDetailSheet({ place, onClose }: { place: Place; onClose: () => void }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  const [details, setDetails] = useState<GooglePlaceDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(!!place.googlePlaceId);
  const [showHours, setShowHours] = useState(false);

  useEffect(() => {
    if (!place.googlePlaceId) return;
    let cancelled = false;
    setDetailsLoading(true);
    fetchGooglePlaceDetails(place.googlePlaceId)
      .then((result) => {
        if (!cancelled) {
          setDetails(result);
          setDetailsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setDetailsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [place.googlePlaceId]);

  const priceLevel = formatPriceLevel(details?.priceLevel);

  return (
    <div className="place-sheet__backdrop" onClick={onClose}>
      <div className="place-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="place-sheet__handle" />
        <button className="place-sheet__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        {place.photoUrl && <img className="place-sheet__photo" src={place.photoUrl} alt="" />}
        <h2 className="place-sheet__name">{place.name}</h2>
        <div className="place-sheet__meta">
          {place.category} · {place.priceTier}
        </div>

        {detailsLoading && <p className="place-sheet__loading">Loading details from Google…</p>}

        {!detailsLoading && details && (
          <div className="place-sheet__google-info">
            {(details.rating || details.openNow !== undefined) && (
              <div className="place-sheet__info-row">
                {details.rating && (
                  <span>
                    ★ {details.rating.toFixed(1)}
                    {details.userRatingCount ? ` (${details.userRatingCount})` : ""}
                  </span>
                )}
                {priceLevel && <span>{priceLevel}</span>}
                {details.openNow !== undefined && (
                  <span className={details.openNow ? "is-open" : "is-closed"}>
                    {details.openNow ? "Open now" : "Closed now"}
                  </span>
                )}
              </div>
            )}
            {details.formattedAddress && <div className="place-sheet__address">{details.formattedAddress}</div>}
            {details.weekdayDescriptions && details.weekdayDescriptions.length > 0 && (
              <div className="place-sheet__hours">
                <button className="place-sheet__hours-toggle" onClick={() => setShowHours((v) => !v)}>
                  {showHours ? "Hide hours" : "See opening hours"}
                </button>
                {showHours && (
                  <ul className="place-sheet__hours-list">
                    {details.weekdayDescriptions.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <div className="place-sheet__map">
          <MapView places={[place]} height={140} />
        </div>

        <div className="place-sheet__actions">
          <a className="place-sheet__maps-link" href={mapsUrl} target="_blank" rel="noopener noreferrer">
            View on Google Maps
          </a>
          <a className="place-sheet__directions-link" href={directionsUrl} target="_blank" rel="noopener noreferrer">
            Directions
          </a>
        </div>
      </div>
    </div>
  );
}
