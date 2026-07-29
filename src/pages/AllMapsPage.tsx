import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MapCard } from "../components/MapCard";
import { PlaceRow } from "../components/PlaceRow";
import { LoadingState } from "../components/LoadingState";
import { iconForCategory } from "../data/categoryIcons";
import "./AllMapsPage.css";

const ALL = "All";

export function AllMapsPage() {
  const navigate = useNavigate();
  const { maps, places, savedMapIds, savedPlaceIds, toggleSavePlace, dataLoading } = useApp();

  const [tab, setTab] = useState<"maps" | "places">("maps");
  const [region, setRegion] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [curator, setCurator] = useState(ALL);

  const regions = useMemo(() => [ALL, ...Array.from(new Set(maps.map((m) => m.region)))], [maps]);
  const curators = useMemo(() => [ALL, ...Array.from(new Set(maps.map((m) => m.curatorName)))], [maps]);
  const categories = useMemo(() => Array.from(new Set(places.map((p) => p.category))), [places]);

  const categoriesByMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    places.forEach((p) => {
      if (!map.has(p.mapId)) map.set(p.mapId, new Set());
      map.get(p.mapId)!.add(p.category);
    });
    return map;
  }, [places]);

  const filteredMaps = useMemo(() => {
    return maps.filter((map) => {
      const matchesRegion = region === ALL || map.region === region;
      const matchesCurator = curator === ALL || map.curatorName === curator;
      const matchesCategory = category === ALL || categoriesByMap.get(map.id)?.has(category);
      return matchesRegion && matchesCurator && matchesCategory;
    });
  }, [maps, region, curator, category, categoriesByMap]);

  const mapById = useMemo(() => new Map(maps.map((m) => [m.id, m])), [maps]);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const map = mapById.get(place.mapId);
      if (!map) return false;
      const matchesRegion = region === ALL || map.region === region;
      const matchesCurator = curator === ALL || map.curatorName === curator;
      const matchesCategory = category === ALL || place.category === category;
      return matchesRegion && matchesCurator && matchesCategory;
    });
  }, [places, mapById, region, curator, category]);

  const handlePickCategory = (c: string) => {
    setCategory((prev) => (prev === c ? ALL : c));
  };

  return (
    <div className="all-maps-page">
      <div className="all-maps-page__top-bar">
        <button className="all-maps-page__back" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <h1>{tab === "maps" ? "All Maps" : "All Places"}</h1>
      </div>

      <div className="screen-padded all-maps-page__filters-block">
        <div className="all-maps-page__tabs">
          <button className={tab === "maps" ? "is-active" : ""} onClick={() => setTab("maps")}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M2.5 5.3 7.3 4l5.4 1.3 4.8-1.3v10.7l-4.8 1.3-5.4-1.3-4.8 1.3V5.3Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <line x1="7.3" y1="4" x2="7.3" y2="14.6" stroke="currentColor" strokeWidth="1.2" />
              <line x1="12.7" y1="5.3" x2="12.7" y2="16" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Maps
          </button>
          <button className={tab === "places" ? "is-active" : ""} onClick={() => setTab("places")}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 2.5c-3 0-5.4 2.3-5.4 5.6 0 4 5.4 9.4 5.4 9.4s5.4-5.4 5.4-9.4c0-3.3-2.4-5.6-5.4-5.6Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="8.1" r="2" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Places
          </button>
        </div>

        <div className="all-maps-page__categories">
          <button
            className={`all-maps-page__category-pill ${category === ALL ? "is-active" : ""}`}
            onClick={() => setCategory(ALL)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`all-maps-page__category-pill ${category === c ? "is-active" : ""}`}
              onClick={() => handlePickCategory(c)}
            >
              {iconForCategory(c)} {c}
            </button>
          ))}
        </div>

        <div className="all-maps-page__selects">
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r === ALL ? "Region" : r}
              </option>
            ))}
          </select>
          <select value={curator} onChange={(e) => setCurator(e.target.value)}>
            {curators.map((c) => (
              <option key={c} value={c}>
                {c === ALL ? "Curator" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="screen-padded">
        {dataLoading ? (
          <LoadingState />
        ) : tab === "maps" ? (
          <div className="all-maps-page__grid">
            {filteredMaps.length === 0 && (
              <p className="all-maps-page__empty">No maps match those filters yet.</p>
            )}
            {filteredMaps.map((map) => (
              <MapCard key={map.id} map={map} saved={savedMapIds.includes(map.id)} />
            ))}
          </div>
        ) : (
          <div>
            {filteredPlaces.length === 0 && (
              <p className="all-maps-page__empty">No places match those filters yet.</p>
            )}
            {filteredPlaces.map((place) => {
              const parentMap = mapById.get(place.mapId);
              return (
                <PlaceRow
                  key={place.id}
                  place={place}
                  saved={savedPlaceIds.includes(place.id)}
                  onToggleSave={() => toggleSavePlace(place.id)}
                  sourceLabel={parentMap ? `from ${parentMap.title} · ${parentMap.curatorName}` : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
