import { locationArr } from 'src/seed/seeder.service';

//캐시
const tourCache = new Map<string, any[]>(); // key: 지역명, value: 장소 배열

export const getFromCache = (region: string) => tourCache.get(region);
export const saveToCache = (region: string, data: any[]) =>
  tourCache.set(region, data);
export const clearCache = () => tourCache.clear();

// 11km 기준 격자 중심점 9개 생성
export const generateGridCenters = (lat: number, lng: number) => {
  const delta = 0.1; // 약 11km ≒ 위도/경도 0.1도
  return [-1, 0, 1].flatMap((dy) =>
    [-1, 0, 1].map((dx) => ({
      lat: lat + delta * dy,
      lng: lng + delta * dx,
    })),
  );
};

// 중복 제거 함수
export const dedupePlaces = (places: any[]) => {
  const seen = new Set();
  return places.filter((place) => {
    if (seen.has(place.place_id)) return false;
    seen.add(place.place_id);
    return true;
  });
};

export const getLocationByName = (str: string) => {
  const place = locationArr.find((item) => str === item.name);

  return place;
};
