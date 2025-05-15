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
  };

  for (const type of types) {
    if (typeMap[type]) return typeMap[type];
  }

  return '기타';
}
