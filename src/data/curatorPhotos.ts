import isop from "../assets/curator-isop.png";
import junho from "../assets/curator-junho.png";
import minji from "../assets/curator-minji.png";

// Keys are the seed curator profile ids from supabase/seed.sql.
const CURATOR_PHOTOS: Record<string, string> = {
  "00000000-0000-0000-0000-000000000001": isop,
  "00000000-0000-0000-0000-000000000002": junho,
  "00000000-0000-0000-0000-000000000003": minji,
};

export function curatorPhoto(curatorId: string): string | undefined {
  return CURATOR_PHOTOS[curatorId];
}
