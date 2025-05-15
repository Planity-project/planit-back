import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { mapGoogleCategory } from 'util/googlemap';
const getCategory = (typeId: string | number): string => {
  const map: Record<string, string> = {
    '12': '관광지',
    '14': '문화',
    '15': '행사',
    '28': '레포츠',
    '32': '숙소',
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
  private readonly googleApiKey = process.env.GOOGLE_MAP_KEY;
  // 장소 조회 (숙소, 행사 제외)
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
      .filter((item) => item.category !== '행사' && item.category !== '숙소');
  }

  private readonly kakaoApiKey = process.env.KAKAO_KEY;

  // 장소 검색 (숙소, 행사 제외)
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
      .filter((item) => item.category !== '행사' && item.category !== '숙소');

    return result;
  }

  // 장소 조회(숙소)
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

  // 장소 검색(숙소)
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

  //google
  async searchToursGoogle(
    lat: string,
    lon: string,
    page: number,
  ): Promise<any[]> {
    const radius = 20000;
    const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

    const params = {
      location: `${lat},${lon}`,
      radius,
      key: this.googleApiKey,
      type: 'tourist_attraction',
      language: 'ko',
    };

    let currentPage = 0;
    let nextPageToken: string | null = null;
    let results: any[] = [];

    while (currentPage <= page) {
      let response;

      if (nextPageToken && currentPage > 0) {
        // 다음 페이지 호출
        await new Promise((res) => setTimeout(res, 2000)); // 토큰 활성화까지 딜레이 필요
        response = await axios.get(baseUrl, {
          params: {
            pagetoken: nextPageToken,
            key: this.googleApiKey,
            language: 'ko',
          },
        });
      } else {
        // 첫 페이지 호출
        response = await axios.get(baseUrl, { params });
      }

      const data = response.data;

      if (data.status !== 'OK' || !data.results) break;
      console.log(data, '지역 정보');
      if (currentPage === page) {
        // 요청한 페이지 도달 시 해당 결과만 반환
        return data.results.map((item: any) => ({
          title: item.name,
          category: mapGoogleCategory(item.types), // 타입 매핑
          imageSrc: item.photos?.[0]
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${item.photos[0].photo_reference}&key=${this.googleApiKey}`
            : '',
          lat: item.geometry.location.lat,
          lon: item.geometry.location.lng,
          address: item.vicinity || '주소 없음',
          tel: '', // Place Details API 필요
          rating: item.rating ?? null,
          reviewCount: item.user_ratings_total ?? 0,
          openNow: item.opening_hours?.open_now ?? null,
        }));
      }

      // 다음 루프를 위한 준비
      nextPageToken = data.next_page_token;
      if (!nextPageToken) break;

      currentPage++;
    }

    return [];
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

  async searchPlacesLatLng(lat: string, lon: string): Promise<any[]> {
    const radius = 20000;
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

    const params = {
      location: `${lat},${lon}`,
      radius,
      key: this.googleApiKey,
      type: 'tourist_attraction',
      language: 'ko',
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    if (data.status !== 'OK' || !data.results) return [];

    return data.results.map((item: any) => ({
      title: item.name,
      lat: item.geometry.location.lat, //위도
      lon: item.geometry.location.lng, //경도
      address: item.vicinity || '', //주소
      rating: item.rating || null, //평점
      reviewCount: item.user_ratings_total || 0, //리뷰 수
      openNow: item.opening_hours?.open_now ?? null, //운영 시간
      image: item.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${item.photos[0].photo_reference}&key=${this.googleApiKey}`
        : '', //이미지
    }));
  }
}
