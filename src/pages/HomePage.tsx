import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { MapCard } from "../components/MapCard";
import { ScrollProgress } from "../components/ScrollProgress";
import { iconForCategory } from "../data/categoryIcons";
import { curatorPhoto } from "../data/curatorPhotos";
import { KOREA_LOCATIONS } from "../data/koreaLocations";
import { LoadingState } from "../components/LoadingState";
import "./HomePage.css";

const ALL = "All";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

const CURATOR_COLORS = [
  { bg: "#EBDEC9", fg: "#B08A61" },
  { bg: "#DCE5D6", fg: "#6B8F5E" },
  { bg: "#F0D8D1", fg: "#C1705A" },
  { bg: "#D9E0E8", fg: "#5F7E93" },
];

export function HomePage() {
  const navigate = useNavigate();
  const { maps, places, savedMapIds, user, dataLoading } = useApp();
  const popularCarouselRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [curator, setCurator] = useState(ALL);
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [location, setLocation] = useState("Seoul");

  const regions = useMemo(() => [ALL, ...Array.from(new Set(maps.map((m) => m.region)))], [maps]);
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
    const q = query.trim().toLowerCase();
    return maps.filter((map) => {
      const matchesQuery =
        !q ||
        map.title.toLowerCase().includes(q) ||
        map.description.toLowerCase().includes(q) ||
        map.curatorName.toLowerCase().includes(q) ||
        map.region.toLowerCase().includes(q);
      const matchesRegion = region === ALL || map.region === region;
      const matchesCurator = curator === ALL || map.curatorName === curator;
      const matchesCategory = category === ALL || categoriesByMap.get(map.id)?.has(category);
      return matchesQuery && matchesRegion && matchesCurator && matchesCategory;
    });
  }, [maps, query, region, curator, category, categoriesByMap]);

  const hasActiveFilters = region !== ALL || category !== ALL || curator !== ALL || query.trim() !== "";

  const resetFilters = () => {
    setQuery("");
    setRegion(ALL);
    setCategory(ALL);
    setCurator(ALL);
  };

  const popularMaps = useMemo(() => [...maps].sort((a, b) => b.saveCount - a.saveCount).slice(0, 5), [maps]);

  useEffect(() => {
    const container = popularCarouselRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>(".map-card--hero"));
    let rafId = 0;

    // Default to the second card so the very first paint already shows a
    // peek on both sides, instead of the first card (which has no left
    // neighbor to peek).
    if (cards.length > 1) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = cards[1].getBoundingClientRect();
      const delta =
        targetRect.left + targetRect.width / 2 - (containerRect.left + containerRect.width / 2);
      container.scrollLeft += delta;
    }

    const update = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      // Decide which card is currently the centered one just once, up front,
      // then base every card's pivot on its fixed side relative to that index.
      // Deriving the pivot from the live (sub-pixel) distance instead made it
      // flip rapidly back and forth as a card crossed dead-center, causing a
      // visible jitter right at the point the card became "centered".
      let centerIndex = 0;
      let smallestDistance = Infinity;
      const rects = cards.map((card) => card.getBoundingClientRect());
      rects.forEach((rect, i) => {
        const distance = Math.abs(rect.left + rect.width / 2 - containerCenter);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          centerIndex = i;
        }
      });

      cards.forEach((card, i) => {
        const rect = rects[i];
        const cardCenter = rect.left + rect.width / 2;
        const signedDistance = cardCenter - containerCenter;
        const t = Math.min(Math.abs(signedDistance) / (rect.width * 0.75), 1);
        const scale = 1 - t * 0.14;
        const opacity = 1 - t * 0.45;
        // Pivot from the inner edge (the one peeking toward center) so it stays
        // put as the card shrinks, instead of the peek receding into the scale.
        card.style.transformOrigin = i < centerIndex ? "right center" : i > centerIndex ? "left center" : "center";
        card.style.transform = `scale(${scale})`;
        card.style.opacity = String(opacity);
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    update();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [popularMaps.length]);

  const scrollPopularBy = (direction: 1 | -1) => {
    const container = popularCarouselRef.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>(".map-card--hero"));
    if (cards.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    // Find the card closest to center right now, then target its next/prev
    // neighbor so we land exactly on a snap point instead of guessing a
    // fixed pixel step (which fights the browser's own scroll-snap and
    // causes a jittery correction at the end).
    let currentIndex = 0;
    let smallestDistance = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - containerCenter);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        currentIndex = i;
      }
    });

    const targetIndex = Math.min(Math.max(currentIndex + direction, 0), cards.length - 1);
    const targetRect = cards[targetIndex].getBoundingClientRect();
    const delta = targetRect.left + targetRect.width / 2 - containerCenter;
    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  const curatorProfiles = useMemo(() => {
    const map = new Map<string, { id: string; name: string; mapCount: number }>();
    maps.forEach((m) => {
      const existing = map.get(m.curatorId);
      if (existing) existing.mapCount += 1;
      else map.set(m.curatorId, { id: m.curatorId, name: m.curatorName, mapCount: 1 });
    });
    return Array.from(map.values());
  }, [maps]);

  const handlePickCategory = (c: string, target: HTMLElement) => {
    setCategory((prev) => (prev === c ? ALL : c));
    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const handlePickCurator = (name: string) => {
    setCurator((prev) => (prev === name ? ALL : name));
  };

  return (
    <div className="home-page">
      <div className="screen-padded home-page__header">
        <div className="home-page__location-wrap">
          <button className="home-page__location" onClick={() => setShowLocationMenu((v) => !v)}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 2.5c-3 0-5.4 2.3-5.4 5.6 0 4 5.4 9.4 5.4 9.4s5.4-5.4 5.4-9.4c0-3.3-2.4-5.6-5.4-5.6Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="8.1" r="2" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {location}
            <svg className="home-page__location-chevron" width="10" height="10" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {showLocationMenu && (
            <>
              <button
                className="home-page__region-backdrop"
                onClick={() => setShowLocationMenu(false)}
                aria-label="Close location picker"
              />
              <div className="home-page__location-menu">
                {KOREA_LOCATIONS.map((group) => (
                  <div key={group.label} className="home-page__location-group">
                    <div className="home-page__location-group-label">{group.label}</div>
                    {group.options.map((opt) => (
                      <button
                        key={opt}
                        className={`home-page__region-option ${location === opt ? "is-active" : ""}`}
                        onClick={() => {
                          setLocation(opt);
                          setShowLocationMenu(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <h1 className="home-page__greeting">
          <span className="home-page__greeting-line1">{getGreeting()},</span>
          <span className="home-page__greeting-line2">
            {user?.name ?? "Traveler"} <span>👋</span>
          </span>
        </h1>

        <div className="home-page__search-row">
          <div className="home-page__search">
            <svg className="home-page__search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find maps, curators, or places..."
            />
          </div>

          <div className="home-page__region-wrap">
            <button
              className={`home-page__region-btn ${region !== ALL ? "is-active" : ""}`}
              onClick={() => setShowRegionMenu((v) => !v)}
              aria-label="Filter results by region"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="8" cy="6" r="2.1" fill="var(--color-surface)" stroke="currentColor" strokeWidth="1.6" />
                <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="13" cy="14" r="2.1" fill="var(--color-surface)" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>

            {showRegionMenu && (
              <>
                <button
                  className="home-page__region-backdrop"
                  onClick={() => setShowRegionMenu(false)}
                  aria-label="Close region filter"
                />
                <div className="home-page__region-menu">
                  {regions.map((r) => (
                    <button
                      key={r}
                      className={`home-page__region-option ${region === r ? "is-active" : ""}`}
                      onClick={() => {
                        setRegion(r);
                        setShowRegionMenu(false);
                      }}
                    >
                      {r === ALL ? "All Regions" : r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="home-page__categories">
          <button
            className={`home-page__category-pill ${category === ALL ? "is-active" : ""}`}
            onClick={(e) => {
              setCategory(ALL);
              e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`home-page__category-pill ${category === c ? "is-active" : ""}`}
              onClick={(e) => handlePickCategory(c, e.currentTarget)}
            >
              {iconForCategory(c)} {c}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button className="home-page__reset" onClick={resetFilters}>
            Reset filters
          </button>
        )}
      </div>

      {!hasActiveFilters && (
        <section className="home-page__section">
          <div className="home-page__section-header home-page__inset home-page__section-header--flush-carousel">
            <h2 className="home-page__section-title">🔥 Popular this week</h2>
            <button className="home-page__show-all" onClick={() => navigate("/popular")}>
              Show all
            </button>
          </div>
          {dataLoading ? (
            <div className="home-page__inset">
              <LoadingState />
            </div>
          ) : (
            <>
              <div className="home-page__hero-carousel-wrap">
                <div className="home-page__hero-carousel" ref={popularCarouselRef}>
                  {popularMaps.map((map) => (
                    <MapCard key={map.id} map={map} saved={savedMapIds.includes(map.id)} variant="hero" />
                  ))}
                </div>
                <button
                  className="home-page__carousel-arrow home-page__carousel-arrow--left"
                  onClick={() => scrollPopularBy(-1)}
                  aria-label="Previous"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M12.5 4.5 6 10l6.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className="home-page__carousel-arrow home-page__carousel-arrow--right"
                  onClick={() => scrollPopularBy(1)}
                  aria-label="Next"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M7.5 4.5 14 10l-6.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="home-page__inset">
                <ScrollProgress targetRef={popularCarouselRef} />
              </div>
            </>
          )}
        </section>
      )}

      <section className="home-page__section home-page__inset">
        <div className="home-page__section-header">
          <h2 className="home-page__section-title">{hasActiveFilters ? "Results" : "All Maps"}</h2>
          {!hasActiveFilters && (
            <button className="home-page__show-all" onClick={() => navigate("/all-maps")}>
              Show all
            </button>
          )}
        </div>
        <div className="home-page__list">
          {dataLoading ? (
            <LoadingState />
          ) : (
            <>
              {filteredMaps.length === 0 && (
                <p className="home-page__empty">No maps match those filters yet. Try widening your search.</p>
              )}
              {filteredMaps.map((map) => (
                <MapCard key={map.id} map={map} saved={savedMapIds.includes(map.id)} />
              ))}
            </>
          )}
        </div>
      </section>

      <section className="home-page__section home-page__inset">
        <h2 className="home-page__section-title home-page__section-title--flush-curators">Curators</h2>
        <div className="home-page__curators">
          {curatorProfiles.map((c, i) => {
            const color = CURATOR_COLORS[i % CURATOR_COLORS.length];
            const photo = curatorPhoto(c.id);
            return (
              <button
                key={c.id}
                className={`home-page__curator ${curator === c.name ? "is-active" : ""}`}
                onClick={() => handlePickCurator(c.name)}
              >
                {photo ? (
                  <img className="home-page__curator-avatar" src={photo} alt="" />
                ) : (
                  <span
                    className="home-page__curator-avatar home-page__curator-avatar--initial"
                    style={{ background: color.bg, color: color.fg }}
                  >
                    {c.name.charAt(0)}
                  </span>
                )}
                <span className="home-page__curator-name">{c.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
