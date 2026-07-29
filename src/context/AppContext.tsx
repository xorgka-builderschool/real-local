import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { publicSupabase, supabase } from "../lib/supabaseClient";
import type { AppUser, MapItem, Place, Review } from "../types";

export interface NewPlaceDraft {
  name: string;
  category: string;
  priceTier: string;
}

interface AppContextValue {
  user: AppUser | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signInWithGoogle: (redirectPath?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  maps: MapItem[];
  places: Place[];
  reviews: Review[];
  dataLoading: boolean;
  savedMapIds: string[];
  savedPlaceIds: string[];
  toggleSaveMap: (mapId: string) => Promise<void>;
  toggleSavePlace: (placeId: string) => Promise<void>;
  addReview: (mapId: string, content: string) => Promise<void>;
  createMap: (
    map: { title: string; description: string; region: string; center: { lat: number; lng: number } },
    places: NewPlaceDraft[],
  ) => Promise<MapItem>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Supabase infers embedded relations as an array without generated DB types,
// even though curator_id/user_id are single-row foreign keys — normalize here.
function embeddedName(value: unknown): string | undefined {
  const row = Array.isArray(value) ? value[0] : value;
  return (row as { name?: string } | null)?.name;
}

async function fetchProfile(id: string): Promise<AppUser | null> {
  const { data, error } = await supabase.from("profiles").select("id, email, name, role").eq("id", id).single();
  if (error || !data) return null;
  return { id: data.id, email: data.email, name: data.name, role: data.role as AppUser["role"] };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [savedMapIds, setSavedMapIds] = useState<string[]>([]);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);

  // Auth session — kept separate from the public maps/places/reviews data below.
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const profile = session?.user ? await fetchProfile(session.user.id) : null;
      if (active) {
        setUser(profile);
        setAuthLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = session?.user ? await fetchProfile(session.user.id) : null;
      if (active) setUser(profile);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Public data: maps, places, reviews, save counts. Visible to everyone, logged in or not.
  const fetchPublicData = useCallback(async () => {
    const [{ data: mapRows }, { data: placeRows }, { data: reviewRows }, { data: countRows }] = await Promise.all([
      publicSupabase
        .from("maps")
        .select("id, title, description, region, center_lat, center_lng, created_at, curator_id, profiles!maps_curator_id_fkey(name)"),
      publicSupabase.from("places").select("id, map_id, name, category, price_tier, lat, lng, photo_url, google_place_id"),
      publicSupabase
        .from("map_reviews")
        .select("id, map_id, content, created_at, user_id, profiles(name)")
        .order("created_at", { ascending: false }),
      publicSupabase.from("map_save_counts").select("map_id, save_count"),
    ]);

    const saveCountByMap = new Map((countRows ?? []).map((row) => [row.map_id, row.save_count]));

    setMaps(
      (mapRows ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        region: row.region,
        curatorId: row.curator_id,
        curatorName: embeddedName(row.profiles) ?? "Curator",
        center: { lat: row.center_lat, lng: row.center_lng },
        createdAt: row.created_at,
        saveCount: saveCountByMap.get(row.id) ?? 0,
      })),
    );

    setPlaces(
      (placeRows ?? []).map((row) => ({
        id: row.id,
        mapId: row.map_id,
        name: row.name,
        category: row.category,
        priceTier: row.price_tier,
        lat: row.lat,
        lng: row.lng,
        photoUrl: row.photo_url ?? undefined,
        googlePlaceId: row.google_place_id ?? undefined,
      })),
    );

    setReviews(
      (reviewRows ?? []).map((row) => ({
        id: row.id,
        mapId: row.map_id,
        author: embeddedName(row.profiles) ?? "Anonymous",
        content: row.content,
        createdAt: row.created_at,
      })),
    );

    setDataLoading(false);
  }, []);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  // Per-user saved lists — refetched whenever the signed-in user changes.
  useEffect(() => {
    if (!user) {
      setSavedMapIds([]);
      setSavedPlaceIds([]);
      return;
    }
    (async () => {
      const [{ data: savedMaps }, { data: savedPlaces }] = await Promise.all([
        supabase.from("saved_maps").select("map_id").eq("user_id", user.id),
        supabase.from("saved_places").select("place_id").eq("user_id", user.id),
      ]);
      setSavedMapIds((savedMaps ?? []).map((row) => row.map_id));
      setSavedPlaceIds((savedPlaces ?? []).map((row) => row.place_id));
    })();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    return error?.message ?? null;
  };

  const signInWithGoogle = async (redirectPath = "/") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${redirectPath}` },
    });
    return error?.message ?? null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const toggleSaveMap = async (mapId: string) => {
    if (!user) return;
    const isSaved = savedMapIds.includes(mapId);
    if (isSaved) {
      await supabase.from("saved_maps").delete().eq("user_id", user.id).eq("map_id", mapId);
      setSavedMapIds((prev) => prev.filter((id) => id !== mapId));
    } else {
      await supabase.from("saved_maps").insert({ user_id: user.id, map_id: mapId });
      setSavedMapIds((prev) => [...prev, mapId]);
    }
    setMaps((prev) =>
      prev.map((m) => (m.id === mapId ? { ...m, saveCount: m.saveCount + (isSaved ? -1 : 1) } : m)),
    );
  };

  const toggleSavePlace = async (placeId: string) => {
    if (!user) return;
    const isSaved = savedPlaceIds.includes(placeId);
    if (isSaved) {
      await supabase.from("saved_places").delete().eq("user_id", user.id).eq("place_id", placeId);
      setSavedPlaceIds((prev) => prev.filter((id) => id !== placeId));
    } else {
      await supabase.from("saved_places").insert({ user_id: user.id, place_id: placeId });
      setSavedPlaceIds((prev) => [...prev, placeId]);
    }
  };

  const addReview = async (mapId: string, content: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("map_reviews")
      .insert({ map_id: mapId, user_id: user.id, content })
      .select("id, created_at")
      .single();
    if (error || !data) return;
    setReviews((prev) => [{ id: data.id, mapId, author: user.name, content, createdAt: data.created_at }, ...prev]);
  };

  const createMap: AppContextValue["createMap"] = async (map, placeDrafts) => {
    if (!user) throw new Error("Must be logged in as a curator to create a map.");

    const { data: mapRow, error: mapError } = await supabase
      .from("maps")
      .insert({
        curator_id: user.id,
        title: map.title,
        description: map.description,
        region: map.region,
        center_lat: map.center.lat,
        center_lng: map.center.lng,
      })
      .select()
      .single();
    if (mapError || !mapRow) throw mapError ?? new Error("Failed to create map");

    const placeRows = placeDrafts.map((draft) => ({
      map_id: mapRow.id,
      name: draft.name,
      category: draft.category,
      price_tier: draft.priceTier,
      lat: map.center.lat + (Math.random() - 0.5) * 0.004,
      lng: map.center.lng + (Math.random() - 0.5) * 0.004,
    }));

    const { data: insertedPlaces } = placeRows.length
      ? await supabase.from("places").insert(placeRows).select()
      : { data: [] };

    const newMap: MapItem = {
      id: mapRow.id,
      title: mapRow.title,
      description: mapRow.description,
      region: mapRow.region,
      curatorId: user.id,
      curatorName: user.name,
      center: { lat: mapRow.center_lat, lng: mapRow.center_lng },
      createdAt: mapRow.created_at,
      saveCount: 0,
    };

    setMaps((prev) => [newMap, ...prev]);
    setPlaces((prev) => [
      ...(insertedPlaces ?? []).map((row) => ({
        id: row.id,
        mapId: row.map_id,
        name: row.name,
        category: row.category,
        priceTier: row.price_tier,
        lat: row.lat,
        lng: row.lng,
      })),
      ...prev,
    ]);

    return newMap;
  };

  const value: AppContextValue = {
    user,
    authLoading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    maps,
    places,
    reviews,
    dataLoading,
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
