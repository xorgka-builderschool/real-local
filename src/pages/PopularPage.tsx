import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MapCard } from "../components/MapCard";
import "./PopularPage.css";

export function PopularPage() {
  const navigate = useNavigate();
  const { maps, savedMapIds } = useApp();

  const popularMaps = useMemo(() => [...maps].sort((a, b) => b.saveCount - a.saveCount), [maps]);

  return (
    <div className="popular-page">
      <div className="popular-page__top-bar">
        <button className="popular-page__back" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <h1>🔥 Popular this week</h1>
      </div>

      <div className="screen-padded">
        {popularMaps.map((map) => (
          <MapCard key={map.id} map={map} saved={savedMapIds.includes(map.id)} />
        ))}
      </div>
    </div>
  );
}
