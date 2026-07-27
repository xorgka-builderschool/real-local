import { Link } from "react-router-dom";
import type { MapItem } from "../types";
import { useApp } from "../context/AppContext";
import { curatorPhoto } from "../data/curatorPhotos";
import { gradientForMap } from "../data/mapGradients";
import "./MapCard.css";

function CuratorAvatar({ map, className }: { map: MapItem; className: string }) {
  const photo = curatorPhoto(map.curatorId);
  return photo ? (
    <img className={className} src={photo} alt="" />
  ) : (
    <span className={className}>{map.curatorName.charAt(0)}</span>
  );
}

export function MapCard({
  map,
  saved,
  variant = "full",
}: {
  map: MapItem;
  saved?: boolean;
  variant?: "full" | "compact" | "hero";
}) {
  const { places } = useApp();
  const mapPlaces = places.filter((p) => p.mapId === map.id);
  const tags = Array.from(new Set(mapPlaces.map((p) => p.category))).slice(0, 2);

  if (variant === "hero") {
    return (
      <Link to={`/maps/${map.id}`} className="map-card map-card--hero">
        <div className="map-card__hero-media" style={{ background: gradientForMap(map.id) }}>
          <div className="map-card__hero-scrim" />
          <span className={`map-card__hero-save ${saved ? "is-saved" : ""}`}>{saved ? "♥" : "↗"}</span>
          <div className="map-card__hero-info">
            <div className="map-card__hero-location">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 2.5c-3 0-5.4 2.3-5.4 5.6 0 4 5.4 9.4 5.4 9.4s5.4-5.4 5.4-9.4c0-3.3-2.4-5.6-5.4-5.6Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              {map.region}
            </div>
            <div className="map-card__hero-title">{map.title}</div>
          </div>
        </div>
      </Link>
    );
  }

  const showStats = variant === "full";

  return (
    <Link to={`/maps/${map.id}`} className={`map-card map-card--${variant}`}>
      <div className="map-card__thumb">
        {variant !== "compact" && <span className="map-card__region-tag">{map.region}</span>}
        {saved && <span className="map-card__saved-tag">♥</span>}
      </div>
      <div className="map-card__body">
        <div className="map-card__title-row">
          <div className="map-card__title">{map.title}</div>
          {variant === "full" && <CuratorAvatar map={map} className="map-card__avatar map-card__avatar--corner" />}
        </div>

        {variant === "compact" && (
          <div className="map-card__curator-row">
            <CuratorAvatar map={map} className="map-card__avatar" />
            <span>{map.curatorName} · Curator</span>
          </div>
        )}

        {variant === "full" && <p className="map-card__desc">{map.description}</p>}

        {showStats && tags.length > 0 && (
          <div className="map-card__tags">
            {tags.map((t) => (
              <span key={t} className="map-card__tag">
                {t}
              </span>
            ))}
          </div>
        )}

        {showStats && (
          <div className="map-card__stats">
            <span>📍 {mapPlaces.length} spots</span>
            <span>🔖 {map.saveCount} saved</span>
          </div>
        )}
      </div>
    </Link>
  );
}
