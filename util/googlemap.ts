import axios from 'axios';
import {
  saveToCache,
  clearCache,
  getFromCache,
  generateGridCenters,
  dedupePlaces,
} from './caching';

export function mapGoogleCategory(types: string[]): string {
  const typeMap: Record<string, string> = {
    tourist_attraction: '명소',
    museum: '문화',
    church: '문화',
    mosque: '문화',
    synagogue: '문화',
    hindu_temple: '문화',
    art_gallery: '문화',
    amusement_park: '레포츠',
    campground: '레포츠',
    park: '레포츠',
    lodging: '숙소',
    shopping_mall: '쇼핑',
    clothing_store: '쇼핑',
    department_store: '쇼핑',
    restaurant: '식당',
    cafe: '카페',
    bar: '식당',

    // 추가된 항목
    acai_shop: '카페',
    afghani_restaurant: '식당',
    african_restaurant: '식당',
    american_restaurant: '식당',
    asian_restaurant: '식당',
    bagel_shop: '카페',
    bakery: '카페',
    bar_and_grill: '식당',
    barbecue_restaurant: '식당',
    brazilian_restaurant: '식당',
    breakfast_restaurant: '식당',
    brunch_restaurant: '식당',
    buffet_restaurant: '식당',
    cafeteria: '카페',
    candy_store: '카페',
    cat_cafe: '카페',
    chinese_restaurant: '식당',
    chocolate_factory: '카페',
    chocolate_shop: '카페',
    coffee_shop: '카페',
    confectionery: '카페',
    deli: '식당',
    dessert_restaurant: '식당',
    dessert_shop: '카페',
    diner: '식당',
    dog_cafe: '카페',
    donut_shop: '카페',
    fast_food_restaurant: '식당',
    fine_dining_restaurant: '식당',
    food_court: '식당',
    french_restaurant: '식당',
    greek_restaurant: '식당',
    hamburger_restaurant: '식당',
    ice_cream_shop: '카페',
    indian_restaurant: '식당',
    indonesian_restaurant: '식당',
    italian_restaurant: '식당',
    japanese_restaurant: '식당',
    juice_shop: '카페',
    korean_restaurant: '식당',
    lebanese_restaurant: '식당',
    meal_delivery: '식당',
    meal_takeaway: '식당',
    mediterranean_restaurant: '식당',
    mexican_restaurant: '식당',
    middle_eastern_restaurant: '식당',
    pizza_restaurant: '식당',
    pub: '식당',
    ramen_restaurant: '식당',
    sandwich_shop: '식당',
    seafood_restaurant: '식당',
    spanish_restaurant: '식당',
    steak_house: '식당',
    sushi_restaurant: '식당',
    tea_house: '카페',
    thai_restaurant: '식당',
    turkish_restaurant: '식당',
    vegan_restaurant: '식당',
    vegetarian_restaurant: '식당',
    vietnamese_restaurant: '식당',
    wine_bar: '식당',
  };

  for (const type of types) {
    if (typeMap[type]) return typeMap[type];
  }

  return '기타';
}

export const fetchRegionPlaces = async (
  region: string,
  lat: number,
  lng: number,
  radius: number,
  apiKey: string,
) => {
  // 캐시에 있으면 반환
  const cached = getFromCache(region);
  if (cached) return cached;

  const gridCenters = generateGridCenters(lat, lng);
  let allResults: any[] = [];

  for (const center of gridCenters) {
    let nextPageToken: string | null = null;
    for (let i = 0; i < 3; i++) {
      await new Promise((res) => setTimeout(res, nextPageToken ? 2000 : 0));

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${center.lat},${center.lng}`,
            radius,
            key: apiKey,
            type: 'tourist_attraction',
            language: 'ko',
            ...(nextPageToken && { pagetoken: nextPageToken }),
          },
        },
      );

      const data = response.data;
      if (data.status !== 'OK') break;
      allResults.push(...data.results);
      nextPageToken = data.next_page_token;
      if (!nextPageToken) break;
    }
  }

  const deduped = dedupePlaces(allResults);
  saveToCache(region, deduped);
  return deduped;
};
