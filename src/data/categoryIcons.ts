const CATEGORY_ICONS: Record<string, string> = {
  "Korean BBQ": "🍖",
  Bar: "🍺",
  Noodles: "🍜",
  Soup: "🍲",
  Cafe: "☕",
  Brunch: "🥞",
  "Street Food": "🌭",
  Dessert: "🍰",
};

export function iconForCategory(category: string): string {
  return CATEGORY_ICONS[category] ?? "🍽️";
}
