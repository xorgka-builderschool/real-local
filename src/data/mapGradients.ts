const GRADIENTS = [
  "linear-gradient(160deg, #ff9a56 0%, #ff6a88 45%, #6a3093 100%)",
  "linear-gradient(160deg, #2c5364 0%, #203a43 55%, #0f2027 100%)",
  "linear-gradient(160deg, #56ab2f 0%, #2d6187 100%)",
  "linear-gradient(160deg, #f7971e 0%, #c33764 100%)",
  "linear-gradient(160deg, #43cea2 0%, #185a9d 100%)",
  "linear-gradient(160deg, #834d9b 0%, #d04ed6 100%)",
];

export function gradientForMap(mapId: string): string {
  let hash = 0;
  for (let i = 0; i < mapId.length; i++) {
    hash = (hash * 31 + mapId.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}
