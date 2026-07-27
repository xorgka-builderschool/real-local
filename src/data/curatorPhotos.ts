import isop from "../assets/curator-isop.png";
import junho from "../assets/curator-junho.png";
import minji from "../assets/curator-minji.png";

const CURATOR_PHOTOS: Record<string, string> = {
  "curator-isop": isop,
  "curator-junho": junho,
  "curator-minji": minji,
};

export function curatorPhoto(curatorId: string): string | undefined {
  return CURATOR_PHOTOS[curatorId];
}
