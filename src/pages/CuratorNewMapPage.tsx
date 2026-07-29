import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp, type NewPlaceDraft } from "../context/AppContext";
import { LoadingState } from "../components/LoadingState";
import "./CuratorNewMapPage.css";

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

export function CuratorNewMapPage() {
  const { user, authLoading, createMap } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [places, setPlaces] = useState<NewPlaceDraft[]>([]);
  const [placeName, setPlaceName] = useState("");
  const [placeCategory, setPlaceCategory] = useState("");
  const [placePrice, setPlacePrice] = useState("$");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (authLoading) return <LoadingState />;

  if (!user || user.role !== "curator") {
    return (
      <div className="screen-padded curator-gate">
        <h1>New Map</h1>
        <p>This screen is only accessible to approved Curator accounts.</p>
        <Link to="/login" state={{ from: location.pathname }} className="curator-gate__cta">
          Log in as a Curator
        </Link>
      </div>
    );
  }

  const handleAddPlace = (e: FormEvent) => {
    e.preventDefault();
    if (!placeName.trim()) return;
    setPlaces((prev) => [...prev, { name: placeName.trim(), category: placeCategory.trim() || "Restaurant", priceTier: placePrice }]);
    setPlaceName("");
    setPlaceCategory("");
    setPlacePrice("$");
  };

  const handleRemovePlace = (index: number) => {
    setPlaces((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveMap = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const newMap = await createMap(
        { title: title.trim(), description: description.trim(), region: region.trim() || "Other", center: SEOUL_CENTER },
        places,
      );
      navigate(`/maps/${newMap.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save this map — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="curator-new-map">
      <div className="curator-new-map__top-bar">
        <button className="curator-new-map__back" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <h1>New Map</h1>
        <span className="curator-new-map__badge">Curator</span>
      </div>

      <div className="screen-padded">
        <label className="curator-new-map__label">Map Title</label>
        <input
          className="curator-new-map__input"
          placeholder="e.g. Euljiro Local Map"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="curator-new-map__label">One-line description</label>
        <textarea
          className="curator-new-map__textarea"
          placeholder="Shown on the map card & detail page"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="curator-new-map__label">Region</label>
        <input
          className="curator-new-map__input"
          placeholder="e.g. Euljiro"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />

        <div className="curator-new-map__section-header">
          <h2>Places</h2>
        </div>

        <form className="curator-new-map__add-place" onSubmit={handleAddPlace}>
          <input placeholder="Place name" value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
          <input placeholder="Category" value={placeCategory} onChange={(e) => setPlaceCategory(e.target.value)} />
          <select value={placePrice} onChange={(e) => setPlacePrice(e.target.value)}>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
          <button type="submit">+ Add</button>
        </form>

        <div className="curator-new-map__places">
          {places.length === 0 && <p className="curator-new-map__empty">No places added yet.</p>}
          {places.map((place, i) => (
            <div className="curator-new-map__place-row" key={`${place.name}-${i}`}>
              <div className="curator-new-map__place-thumb" />
              <div className="curator-new-map__place-body">
                <span>{place.name}</span>
                <span className="curator-new-map__place-meta">
                  {place.category} · {place.priceTier}
                </span>
              </div>
              <button onClick={() => handleRemovePlace(i)} aria-label={`Remove ${place.name}`}>
                ✕
              </button>
            </div>
          ))}
        </div>

        {saveError && <p className="curator-new-map__error">{saveError}</p>}

        <button className="curator-new-map__save" onClick={handleSaveMap} disabled={!title.trim() || saving}>
          {saving ? "Saving…" : "Save Map"}
        </button>

        <p className="curator-new-map__note">
          Note: this MVP screen creates a map directly from the fields above. A full map/place editor
          (reordering, rich descriptions, curator approval flow) is out of scope — see PRD §7.
        </p>
      </div>
    </div>
  );
}
