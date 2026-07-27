import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppUser, MapItem, Place, Review, Role } from "../types";
import { mockMaps, mockPlaces, mockReviews } from "../data/mockData";

const STORAGE_KEY = "real-local-mvp-state";

interface PersistedState {
  user: AppUser | null;
  savedMapIds: string[];
  savedPlaceIds: string[];
  reviews: Review[];
  curatorMaps: MapItem[];
  curatorPlaces: Place[];
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch {
    // ignore corrupt storage
  }
  return { user: null, savedMapIds: [], savedPlaceIds: [], reviews: mockReviews, curatorMaps: [], curatorPlaces: [] };
}

export interface NewPlaceDraft {
  name: string;
  category: string;
  priceTier: string;
}

interface AppContextValue {
  user: AppUser | null;
  login: (role: Role) => void;
  logout: () => void;
  maps: MapItem[];
  places: Place[];
  reviews: Review[];
  savedMapIds: string[];
  savedPlaceIds: string[];
  toggleSaveMap: (mapId: string) => void;
  toggleSavePlace: (placeId: string) => void;
  addReview: (mapId: string, content: string) => void;
  createMap: (
    map: { title: string; description: string; region: string; center: { lat: number; lng: number } },
    places: NewPlaceDraft[],
  ) => MapItem;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(loadState, []);
  const [user, setUser] = useState<AppUser | null>(initial.user);
  const [savedMapIds, setSavedMapIds] = useState<string[]>(initial.savedMapIds);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>(initial.savedPlaceIds);
  const [reviews, setReviews] = useState<Review[]>(initial.reviews);
  const [curatorMaps, setCuratorMaps] = useState<MapItem[]>(initial.curatorMaps);
  const [curatorPlaces, setCuratorPlaces] = useState<Place[]>(initial.curatorPlaces);

  useEffect(() => {
    const state: PersistedState = { user, savedMapIds, savedPlaceIds, reviews, curatorMaps, curatorPlaces };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [user, savedMapIds, savedPlaceIds, reviews, curatorMaps, curatorPlaces]);

  const login = (role: Role) => {
    if (role === "curator") {
      setUser({ id: "curator-isop", name: "Isop", email: "isop@reallocal.dev", role: "curator" });
    } else {
      setUser({ id: "user-guest-1", name: "Traveler Kim", email: "traveler@reallocal.dev", role: "user" });
    }
  };

  const logout = () => setUser(null);

  const toggleSaveMap = (mapId: string) => {
    if (!user) return;
    setSavedMapIds((prev) => (prev.includes(mapId) ? prev.filter((id) => id !== mapId) : [...prev, mapId]));
  };

  const toggleSavePlace = (placeId: string) => {
    if (!user) return;
    setSavedPlaceIds((prev) => (prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]));
  };

  const addReview = (mapId: string, content: string) => {
    if (!user) return;
    setReviews((prev) => [
      { id: `review-${Date.now()}`, mapId, author: user.name, content, createdAt: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
  };

  const createMap: AppContextValue["createMap"] = (map, placeDrafts) => {
    const mapId = `map-${Date.now()}`;
    const newMap: MapItem = {
      ...map,
      id: mapId,
      curatorId: user?.id ?? "curator-isop",
      curatorName: user?.name ?? "Isop",
      createdAt: new Date().toISOString().slice(0, 10),
      saveCount: 0,
    };
    const newPlaces: Place[] = placeDrafts.map((draft, i) => ({
      id: `place-${Date.now()}-${i}`,
      mapId,
      name: draft.name,
      category: draft.category,
      priceTier: draft.priceTier,
      lat: map.center.lat + (Math.random() - 0.5) * 0.004,
      lng: map.center.lng + (Math.random() - 0.5) * 0.004,
    }));
    setCuratorMaps((prev) => [newMap, ...prev]);
    setCuratorPlaces((prev) => [...newPlaces, ...prev]);
    return newMap;
  };

  const maps = useMemo(() => [...curatorMaps, ...mockMaps], [curatorMaps]);
  const places = useMemo(() => [...curatorPlaces, ...mockPlaces], [curatorPlaces]);

  const value: AppContextValue = {
    user,
    login,
    logout,
    maps,
    places,
    reviews,
    savedMapIds,
    savedPlaceIds,
    toggleSaveMap,
    toggleSavePlace,
    addReview,
    createMap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
