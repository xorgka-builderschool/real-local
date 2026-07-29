import { useState } from "react";
import type { Place } from "../types";
import { PlaceDetailSheet } from "./PlaceDetailSheet";
import "./PlaceRow.css";

export function PlaceRow({
  place,
  saved,
  onToggleSave,
  sourceLabel,
}: {
  place: Place;
  saved: boolean;
  onToggleSave: () => void;
  sourceLabel?: string;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div
        className="place-row"
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setDetailOpen(true);
        }}
      >
        <div
          className="place-row__thumb"
          style={
            place.photoUrl
              ? { backgroundImage: `url(${place.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
        <div className="place-row__body">
          <div className="place-row__title-row">
            <span className="place-row__name">{place.name}</span>
            <span className="place-row__tag">{place.category}</span>
          </div>
          {sourceLabel && <div className="place-row__source">{sourceLabel}</div>}
        </div>
        <button
          className={`place-row__save ${saved ? "is-saved" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          aria-label={saved ? "Remove from saved places" : "Save place"}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
      {detailOpen && <PlaceDetailSheet place={place} onClose={() => setDetailOpen(false)} />}
    </>
  );
}
