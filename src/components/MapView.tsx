import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import type { Place } from "../types";
import "./MapView.css";

// Real Local is English-only (PRD §1) — force the map UI to match regardless
// of the browser's locale, instead of letting Google infer it from Korea.
setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, v: "weekly", language: "en", region: "US" });

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

export function MapView({
  places,
  height = 240,
  onPlaceClick,
}: {
  places: Place[];
  height?: number;
  onPlaceClick?: (place: Place) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    importLibrary("maps")
      .then(({ Map }) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new Map(containerRef.current, {
          center: SEOUL_CENTER,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    if (places.length === 0) {
      markersRef.current = [];
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    markersRef.current = places.map((place) => {
      const position = { lat: place.lat, lng: place.lng };
      bounds.extend(position);
      const marker = new google.maps.Marker({ map, position, title: place.name });
      if (onPlaceClick) {
        marker.addListener("click", () => onPlaceClick(place));
      } else {
        const info = new google.maps.InfoWindow({ content: place.name });
        marker.addListener("click", () => info.open({ map, anchor: marker }));
      }
      return marker;
    });

    if (places.length === 1) {
      map.setCenter({ lat: places[0].lat, lng: places[0].lng });
      map.setZoom(16);
    } else {
      map.fitBounds(bounds, 48);
    }
  }, [places, ready, onPlaceClick]);

  return (
    <div className="map-view" style={{ height }}>
      {error && <div className="map-view__error">Couldn't load Google Maps.</div>}
      <div ref={containerRef} className="map-view__canvas" />
    </div>
  );
}
