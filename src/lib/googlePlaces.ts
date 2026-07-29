export interface GooglePlaceDetails {
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  openNow?: boolean;
  weekdayDescriptions?: string[];
}

const PRICE_LEVEL_SYMBOLS: Record<string, string> = {
  PRICE_LEVEL_FREE: "Free",
  PRICE_LEVEL_INEXPENSIVE: "$",
  PRICE_LEVEL_MODERATE: "$$",
  PRICE_LEVEL_EXPENSIVE: "$$$",
  PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
};

export function formatPriceLevel(level?: string): string | undefined {
  return level ? PRICE_LEVEL_SYMBOLS[level] : undefined;
}

export async function fetchGooglePlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=en`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "rating,userRatingCount,priceLevel,formattedAddress,regularOpeningHours",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    formattedAddress: data.formattedAddress,
    rating: data.rating,
    userRatingCount: data.userRatingCount,
    priceLevel: data.priceLevel,
    openNow: data.regularOpeningHours?.openNow,
    weekdayDescriptions: data.regularOpeningHours?.weekdayDescriptions,
  };
}
