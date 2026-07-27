import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MapCard } from "../components/MapCard";
import { iconForCategory } from "../data/categoryIcons";
import "./AllMapsPage.css";

const ALL = "All";

export function AllMapsPage() {
  const navigate = useNavigate();
  const { maps, places, savedMapIds } = useApp();

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

  const handlePickCategory = (c: string) => {
    setCategory((prev) => (prev === c ? ALL : c));
  };

  return (
    <div className="all-maps-page">
      <div className="all-maps-page__top-bar">
        <button className="all-maps-page__back" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <h1>All Maps</h1>
      </div>

      <div className="screen-padded all-maps-page__filters-block">
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
        <div className="all-maps-page__grid">
          {filteredMaps.length === 0 && (
            <p className="all-maps-page__empty">No maps match those filters yet.</p>
          )}
          {filteredMaps.map((map) => (
            <MapCard key={map.id} map={map} saved={savedMapIds.includes(map.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
