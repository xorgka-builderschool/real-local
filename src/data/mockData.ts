import type { MapItem, Place, Review } from "../types";

export const mockMaps: MapItem[] = [
  {
    id: "map-euljiro",
    title: "Euljiro Local Map",
    description: "Hidden bars & grills real locals actually go to in Euljiro.",
    region: "Euljiro",
    curatorId: "curator-isop",
    curatorName: "Isop",
    center: { lat: 37.5663, lng: 126.9915 },
    createdAt: "2026-07-10",
    saveCount: 128,
  },
  {
    id: "map-ramen",
    title: "Ramen Concept Map",
    description: "Best ramen spots across Seoul, ranked by locals.",
    region: "Myeongdong",
    curatorId: "curator-isop",
    curatorName: "Isop",
    center: { lat: 37.5551, lng: 126.9707 },
    createdAt: "2026-07-14",
    saveCount: 96,
  },
  {
    id: "map-mapo",
    title: "Mapo Late Night Eats",
    description: "Where to eat after midnight in Mapo-gu.",
    region: "Mapo-gu",
    curatorId: "curator-junho",
    curatorName: "Junho",
    center: { lat: 37.5546, lng: 126.9086 },
    createdAt: "2026-07-19",
    saveCount: 61,
  },
  {
    id: "map-gangnam",
    title: "Gangnam Brunch Spots",
    description: "Slow mornings and good coffee, picked by a Gangnam local.",
    region: "Gangnam",
    curatorId: "curator-minji",
    curatorName: "Minji",
    center: { lat: 37.4979, lng: 127.0276 },
    createdAt: "2026-07-23",
    saveCount: 34,
  },
];

export const mockPlaces: Place[] = [
  { id: "place-1", mapId: "map-euljiro", name: "Jinhwa Grill", category: "Korean BBQ", priceTier: "$$", lat: 37.5665, lng: 126.9918 },
  { id: "place-2", mapId: "map-euljiro", name: "Euljiro Noraebang Bar", category: "Bar", priceTier: "$", lat: 37.566, lng: 126.9908 },
  { id: "place-3", mapId: "map-euljiro", name: "Sunhwa Ramen", category: "Noodles", priceTier: "$", lat: 37.5668, lng: 126.9925 },
  { id: "place-4", mapId: "map-ramen", name: "Golden Broth Ramen", category: "Noodles", priceTier: "$$", lat: 37.5553, lng: 126.971 },
  { id: "place-5", mapId: "map-ramen", name: "Myeongdong Tonkotsu", category: "Noodles", priceTier: "$", lat: 37.5548, lng: 126.9702 },
  { id: "place-6", mapId: "map-ramen", name: "Local's Shoyu House", category: "Noodles", priceTier: "$$", lat: 37.5557, lng: 126.9715 },
  { id: "place-7", mapId: "map-mapo", name: "Mapo Galbi Alley", category: "Korean BBQ", priceTier: "$$", lat: 37.5548, lng: 126.909 },
  { id: "place-8", mapId: "map-mapo", name: "24h Sundae Guk", category: "Soup", priceTier: "$", lat: 37.5543, lng: 126.9082 },
  { id: "place-9", mapId: "map-mapo", name: "Riverside Pocha", category: "Bar", priceTier: "$", lat: 37.555, lng: 126.9095 },
  { id: "place-10", mapId: "map-gangnam", name: "Slow Sunday Cafe", category: "Cafe", priceTier: "$$", lat: 37.4982, lng: 127.0279 },
  { id: "place-11", mapId: "map-gangnam", name: "Garosu Brunch Table", category: "Brunch", priceTier: "$$$", lat: 37.4975, lng: 127.027 },
];

export const mockReviews: Review[] = [
  {
    id: "review-1",
    mapId: "map-euljiro",
    author: "@traveler_kim",
    content: "Exactly the local spots I wanted — no tourist traps!",
    createdAt: "2026-07-20",
  },
  {
    id: "review-2",
    mapId: "map-ramen",
    author: "@noodle_hunter",
    content: "Golden Broth Ramen alone was worth the trip. Trustworthy list.",
    createdAt: "2026-07-22",
  },
];
