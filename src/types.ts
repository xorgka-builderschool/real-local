export type Role = "guest" | "user" | "curator";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Place {
  id: string;
  mapId: string;
  name: string;
  category: string;
  priceTier: string;
  lat: number;
  lng: number;
}

export interface MapItem {
  id: string;
  title: string;
  description: string;
  region: string;
  curatorId: string;
  curatorName: string;
  center: { lat: number; lng: number };
  createdAt: string;
  saveCount: number;
}

export interface Review {
  id: string;
  mapId: string;
  author: string;
  content: string;
  createdAt: string;
}
