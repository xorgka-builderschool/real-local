import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MapCard } from "../components/MapCard";
import { PlaceRow } from "../components/PlaceRow";
import { LoadingState } from "../components/LoadingState";
import "./SavedPage.css";

export function SavedPage() {
  const { user, authLoading, dataLoading, maps, places, savedMapIds, savedPlaceIds, toggleSavePlace } = useApp();
  const [tab, setTab] = useState<"maps" | "places">("maps");
  const navigate = useNavigate();

  if (authLoading) return null;

  const topBar = (
    <div className="saved-page__top-bar">
      <button className="saved-page__back" onClick={() => navigate(-1)} aria-label="Go back">
        ←
      </button>
      <h1>Saved</h1>
    </div>
  );

  if (!user) {
    return (
      <div>
        {topBar}
        <div className="screen-padded saved-page__login-gate">
          <p>Log in to save maps and places, and find them here later.</p>
          <Link to="/login" state={{ from: "/saved" }} className="saved-page__login-cta">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const savedMaps = maps.filter((m) => savedMapIds.includes(m.id));
  const savedPlaces = places.filter((p) => savedPlaceIds.includes(p.id));

  return (
    <div>
      {topBar}
      <div className="screen-padded">
        {dataLoading ? (
          <LoadingState />
        ) : (
          <>
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
                    <PlaceRow
                      key={place.id}
                      place={place}
                      saved
                      onToggleSave={() => toggleSavePlace(place.id)}
                      sourceLabel={parentMap ? `from ${parentMap.title} · ${parentMap.curatorName}` : undefined}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
