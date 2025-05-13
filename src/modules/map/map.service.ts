import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
const getCategory = (typeId: string | number): string => {
  const map: Record<string, string> = {
    '12': '관광지',
    '14': '문화시설',
    '15': '행사',
    '28': '레포츠',
    '32': '숙박',
    '38': '쇼핑',
    '39': '음식점',
  };
  return map[String(typeId)] || '기타';
};

@Injectable()
export class MapService {
  // private readonly clientId = process.env.NAVER_KEY;
  // private readonly clientSecret = process.env.NAVER_SECRET_KEY;
  // private readonly kakaoApiKey = process.env.KAKAO_KEY;
  private readonly apiKey = process.env.TOUR_API_KEY;

  // 장소 조회 (숙박, 행사 제외)
  async searchTours(
    lat: string,
    lon: string,
    pageNo: number,
    radius = '20000',
  ): Promise<any[]> {
    const url =
      'https://apis.data.go.kr/B551011/KorService1/locationBasedList1';

    const params = {
      serviceKey: this.apiKey,
      MobileOS: 'ETC',
      MobileApp: 'AppTest',
      mapX: lon,
      mapY: lat,
      radius,
      arrange: 'E',
      numOfRows: 10,
      pageNo: pageNo,
      _type: 'json',
    };

    const { data } = await axios.get(url, { params });

    const items = data.response?.body?.items?.item;
    if (!items) return [];

    // contentTypeId로 category를 분류하는 매핑 함수 필요시 우리한테 맞게 수정

    // 필요한 정보만 추려서 정리
    return items
      .map((item: any) => ({
        title: item.title || item.addr1 || '이름 없음',
        category: getCategory(item.contenttypeid),
        imageSrc: item.firstimage || '', // 이미지 없을 수도 있음
        lat: item.mapy,
        lon: item.mapx,
        tel: item.tel,
        address: item.addr2
          ? `${item.addr1} ${item.addr2}`
          : item.addr1 || '주소 없음',
      }))
      .filter((item) => item.category !== '행사' && item.category !== '숙박');
  }

  private readonly kakaoApiKey = process.env.KAKAO_KEY;

  // 장소 검색 (숙박, 행사 제외)
  async searchInputTours(
    lat: string,
    lon: string,
    pageNo: number,
    str: string,
    radius = '20000',
  ): Promise<any[]> {
    const url = 'https://apis.data.go.kr/B551011/KorService1/searchKeyword1';

    const params = {
      serviceKey: this.apiKey,
      MobileOS: 'ETC',
      MobileApp: 'AppTest',
      keyword: str, // 입력된 키워드로 검색
      arrange: 'E',
      numOfRows: 10,
      pageNo: pageNo,
      _type: 'json',
    };

    const { data } = await axios.get(url, { params });

    const items = data.response?.body?.items?.item;
    if (!items) return [];

    const result = items
      .map((item: any) => ({
        title: item.title || item.addr1 || '이름 없음',
        category: getCategory(item.contenttypeid),
        imageSrc: item.firstimage || '',
        lat: item.mapy,
        lon: item.mapx,
        tel: item.tel,
        address: item.addr2
          ? `${item.addr1} ${item.addr2}`
          : item.addr1 || '주소 없음',
      }))
      .filter((item) => item.category !== '행사' && item.category !== '숙박');

    return result;
  }

  // 장소 조회(숙박)
  async searchStayTours(
    lat: string,
    lon: string,
    pageNo: number,
    radius = '20000',
  ): Promise<any[]> {
    const url =
      'https://apis.data.go.kr/B551011/KorService1/locationBasedList1';

    const params = {
      serviceKey: this.apiKey,
      MobileOS: 'ETC',
      MobileApp: 'AppTest',
      mapX: lon,
      mapY: lat,
      radius,
      arrange: 'E',
      numOfRows: 10,
      pageNo: pageNo,
      contentTypeId: 32,
      _type: 'json',
    };

    const { data } = await axios.get(url, { params });

    const items = data.response?.body?.items?.item;
    if (!items) return [];

    // contentTypeId로 category를 분류하는 매핑 함수 필요시 우리한테 맞게 수정

    // 필요한 정보만 추려서 정리
    return items.map((item: any) => ({
      title: item.title || item.addr1 || '이름 없음',
      category: getCategory(item.contenttypeid),
      imageSrc: item.firstimage || '', // 이미지 없을 수도 있음
      lat: item.mapy,
      lon: item.mapx,
      tel: item.tel,
      address: item.addr2
        ? `${item.addr1} ${item.addr2}`
        : item.addr1 || '주소 없음',
    }));
  }

  // 장소 검색(숙박)
  async searchStayInputTours(
    lat: string,
    lon: string,
    pageNo: number,
    str: string,
    radius = '20000',
  ): Promise<any[]> {
    const url = 'https://apis.data.go.kr/B551011/KorService1/searchKeyword1';

    const params = {
      serviceKey: this.apiKey,
      MobileOS: 'ETC',
      MobileApp: 'AppTest',
      keyword: str, // 입력된 키워드로 검색
      arrange: 'E',
      numOfRows: 10,
      pageNo: pageNo,
      contentTypeId: 32,
      _type: 'json',
    };

    const { data } = await axios.get(url, { params });

    const items = data.response?.body?.items?.item;
    if (!items) return [];

    const result = items.map((item: any) => ({
      title: item.title || item.addr1 || '이름 없음',
      category: getCategory(item.contenttypeid),
      imageSrc: item.firstimage || '',
      lat: item.mapy,
      lon: item.mapx,
      tel: item.tel,
      address: item.addr2
        ? `${item.addr1} ${item.addr2}`
        : item.addr1 || '주소 없음',
    }));

    return result;
  }

  // async searchKakao(latitude: string, longitude: string): Promise<any[]> {
  //   try {
  //     const response = await axios.get(
  //       'https://dapi.kakao.com/v2/local/search/category.json',
  //       {
  //         params: {
  //           category_group_code: 'FD6', // 뭔지모름 기본값
  //           x: longitude,
  //           y: latitude,
  //           radius: 2000, // 20000m
  //           size: 15,
  //           sort: 'distance', // distance | accuracy
  //         },
  //         headers: {
  //           Authorization: `KakaoAK ${this.kakaoApiKey}`,
  //         },
  //       },
  //     );

  //     const places = response.data.documents.map((item: any) => ({
  //       name: item.place_name,
  //       address: item.address_name,
  //       category: item.category_group_name,
  //       latitude: item.y,
  //       longitude: item.x,
  //       url: item.place_url,
  //     }));

  //     return places;
  //   } catch (error) {
  //     throw new HttpException(
  //       '카카오 장소 검색 실패',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // 네이버
  // async searchNaver(latitude: string, longitude: string): Promise<any[]> {
  //   try {
  //     const query = '관광지, 식당, 카페'; // 검색 키워드
  //     const radius = 5000; //반경

  //     const response = await axios.get(
  //       'https://openapi.naver.com/v1/search/local.json',
  //       {
  //         params: {
  //           query,
  //           x: longitude, // 경도
  //           y: latitude,
  //           radius,
  //         },
  //         headers: {
  //           'X-Naver-Client-Id': this.clientId,
  //           'X-Naver-Client-Secret': this.clientSecret,
  //         },
  //       },
  //     );
  //     console.log('전체데이터', response.data.items);
  //     // API로부터 받은 데이터를 가공하여 반환
  //     const locations = response.data.items.map((item) => ({
  //       title: item.title,
  //       address: item.address,
  //       latitude: item.mapy,
  //       longitude: item.mapx,
  //     }));

  //     console.log('지역별', locations);
  //     return locations;
  //   } catch (error) {
  //     throw new HttpException(
  //       'error' + error,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
