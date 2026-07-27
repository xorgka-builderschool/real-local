import type { Place } from "../types";
import "./MapView.css";

/**
 * Placeholder for the Google Maps API integration described in the PRD.
 * Renders pins at positions derived from each place's lat/lng so the layout
 * already matches how real markers will sit once a Maps API key is wired in.
 */
export function MapView({ places, height = 240 }: { places: Place[]; height?: number }) {
  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);
  const padding = 0.15;
  const latRange = Math.max(Math.max(...lats) - Math.min(...lats), 0.001);
  const lngRange = Math.max(Math.max(...lngs) - Math.min(...lngs), 0.001);
  const minLat = Math.min(...lats) - latRange * padding;
  const maxLat = Math.max(...lats) + latRange * padding;
  const minLng = Math.min(...lngs) - lngRange * padding;
  const maxLng = Math.max(...lngs) + lngRange * padding;

  return (
    <div className="map-view" style={{ height }}>
      <div className="map-view__label">Google Map API — pins per place</div>
      {places.map((place) => {
        const x = ((place.lng - minLng) / (maxLng - minLng)) * 100;
        const y = 100 - ((place.lat - minLat) / (maxLat - minLat)) * 100;
        return (
          <div key={place.id} className="map-view__pin" style={{ left: `${x}%`, top: `${y}%` }} title={place.name} />
        );
      })}
    </div>
  );
}
