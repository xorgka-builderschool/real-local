export interface LocationGroup {
  label: string;
  options: string[];
}

// A general "where in Korea am I browsing from" picker — independent of
// which regions curators have actually published maps for.
export const KOREA_LOCATIONS: LocationGroup[] = [
  {
    label: "Seoul",
    options: [
      "Gangnam-gu",
      "Gangdong-gu",
      "Gangbuk-gu",
      "Gangseo-gu",
      "Gwanak-gu",
      "Gwangjin-gu",
      "Guro-gu",
      "Geumcheon-gu",
      "Nowon-gu",
      "Dobong-gu",
      "Dongdaemun-gu",
      "Dongjak-gu",
      "Mapo-gu",
      "Seodaemun-gu",
      "Seocho-gu",
      "Seongdong-gu",
      "Seongbuk-gu",
      "Songpa-gu",
      "Yangcheon-gu",
      "Yeongdeungpo-gu",
      "Yongsan-gu",
      "Eunpyeong-gu",
      "Jongno-gu",
      "Jung-gu",
      "Jungnang-gu",
    ],
  },
  {
    label: "Other regions",
    options: [
      "Busan",
      "Daegu",
      "Incheon",
      "Gwangju",
      "Daejeon",
      "Ulsan",
      "Sejong",
      "Gyeonggi-do",
      "Gangwon-do",
      "Chungcheongbuk-do",
      "Chungcheongnam-do",
      "Jeollabuk-do",
      "Jeollanam-do",
      "Gyeongsangbuk-do",
      "Gyeongsangnam-do",
      "Jeju-do",
    ],
  },
];
