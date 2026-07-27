import type { Place } from "../types";
import "./PlaceRow.css";

export function PlaceRow({
  place,
  saved,
  onToggleSave,
}: {
  place: Place;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <div className="place-row">
      <div className="place-row__thumb" />
      <div className="place-row__body">
        <div className="place-row__name">{place.name}</div>
        <div className="place-row__meta">
          {place.category} · {place.priceTier}
        </div>
      </div>
      <button
        className={`place-row__save ${saved ? "is-saved" : ""}`}
        onClick={onToggleSave}
        aria-label={saved ? "Remove from saved places" : "Save place"}
      >
        {saved ? "♥" : "♡"}
      </button>
    </div>
  );
}
