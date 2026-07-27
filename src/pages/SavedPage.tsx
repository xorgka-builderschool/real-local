import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MapCard } from "../components/MapCard";
import { PlaceRow } from "../components/PlaceRow";
import "./SavedPage.css";

export function SavedPage() {
  const { user, maps, places, savedMapIds, savedPlaceIds, toggleSavePlace } = useApp();
  const [tab, setTab] = useState<"maps" | "places">("maps");

  if (!user) {
    return (
      <div className="screen-padded saved-page__login-gate">
        <h1>Saved</h1>
        <p>Log in to save maps and places, and find them here later.</p>
        <Link to="/login" className="saved-page__login-cta">
          Log In
        </Link>
      </div>
    );
  }

  const savedMaps = maps.filter((m) => savedMapIds.includes(m.id));
  const savedPlaces = places.filter((p) => savedPlaceIds.includes(p.id));

  return (
    <div className="screen-padded">
      <h1 className="saved-page__title">Saved</h1>

      <div className="saved-page__tabs">
        <button className={tab === "maps" ? "is-active" : ""} onClick={() => setTab("maps")}>
          Saved Maps
        </button>
        <button className={tab === "places" ? "is-active" : ""} onClick={() => setTab("places")}>
          Saved Places
        </button>
      </div>

      {tab === "maps" && (
        <div>
          {savedMaps.length === 0 && <p className="saved-page__empty">No saved maps yet.</p>}
          {savedMaps.map((map) => (
            <MapCard key={map.id} map={map} saved variant="compact" />
          ))}
        </div>
      )}

      {tab === "places" && (
        <div>
          {savedPlaces.length === 0 && <p className="saved-page__empty">No saved places yet.</p>}
          {savedPlaces.map((place) => {
            const parentMap = maps.find((m) => m.id === place.mapId);
            return (
              <div key={place.id}>
                <PlaceRow place={place} saved onToggleSave={() => toggleSavePlace(place.id)} />
                {parentMap && <div className="saved-page__place-map">from {parentMap.title}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
