import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MapCard } from "../components/MapCard";
import { LoadingState } from "../components/LoadingState";
import "./PopularPage.css";

export function PopularPage() {
  const navigate = useNavigate();
  const { maps, savedMapIds, dataLoading } = useApp();

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
        {dataLoading ? (
          <LoadingState />
        ) : (
          popularMaps.map((map) => <MapCard key={map.id} map={map} saved={savedMapIds.includes(map.id)} />)
        )}
      </div>
    </div>
  );
}
