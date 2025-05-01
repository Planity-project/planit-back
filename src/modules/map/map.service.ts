import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MapService {
  private readonly clientId = process.env.NAVER_KEY;
  private readonly clientSecret = process.env.NAVER_SECRET_KEY;

  // 네이버
  async searchNaver(latitude: string, longitude: string): Promise<any[]> {
    try {
      const query = '관광지, 식당, 카페'; // 검색 키워드
      const radius = 5000; // 고정된 반경 값 (1000 미터)

      const response = await axios.get(
        'https://openapi.naver.com/v1/search/local.json',
        {
          params: {
            query,
            x: longitude, // 경도
            y: latitude,
            radius,
          },
          headers: {
            'X-Naver-Client-Id': this.clientId,
            'X-Naver-Client-Secret': this.clientSecret,
          },
        },
      );
      console.log('전체데이터', response.data.items);
      // API로부터 받은 데이터를 가공하여 반환
      const locations = response.data.items.map((item) => ({
        title: item.title,
        address: item.address,
        latitude: item.mapy,
        longitude: item.mapx,
      }));

      console.log('지역별', locations);
      return locations;
    } catch (error) {
      throw new HttpException(
        'error' + error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private readonly apiKey = process.env.TOUR_API_KEY;

  // 한국 관광 공사
  async searchTours(lat: string, lon: string, radius = '2000'): Promise<any[]> {
    const url =
      'https://apis.data.go.kr/B551011/KorService1/locationBasedList1';
    const params = {
      serviceKey: this.apiKey, //key 발급 필요
      MobileOS: 'ETC', // 운영체제 구분값 (Android, iOS, ETC 중 택1) 웹이므로 ETC
      MobileApp: 'AppTest', // 호출하는 애플리케이션 명 임의 값
      mapX: lon, // 경도
      mapY: lat, // 위도
      radius, // 검색 반경
      arrange: 'E', // 정렬: 거리순
      numOfRows: 10, //뭔지 모름 10개까지..?
      pageNo: 1, //표기할 페이지 넘버 ( 전체 데이터가 55개라면 1페이지에 10개씩 )
      _type: 'json', //응답 받을 때 데이터 형식
    };

    const { data } = await axios.get(url, { params });

    if (!data.response?.body?.items?.item) return [];

    return data.response.body.items.item.map((item: any) => ({
      title: item.title,
      address: item.addr1,
      image: item.firstimage,
      tel: item.tel,
      latitude: item.mapy,
      longitude: item.mapx,
    }));
  }

  private readonly kakaoApiKey = process.env.KAKAO_KEY;

  async searchKakao(latitude: string, longitude: string): Promise<any[]> {
    try {
      const response = await axios.get(
        'https://dapi.kakao.com/v2/local/search/category.json',
        {
          params: {
            category_group_code: 'FD6', // 뭔지모름 기본값
            x: longitude,
            y: latitude,
            radius: 2000, // 20000m
            size: 15,
            sort: 'distance', // distance | accuracy
          },
          headers: {
            Authorization: `KakaoAK ${this.kakaoApiKey}`,
          },
        },
      );
      console.log('전체데이터', response.data.documents);
      const places = response.data.documents.map((item: any) => ({
        name: item.place_name,
        address: item.address_name,
        category: item.category_group_name,
        latitude: item.y,
        longitude: item.x,
        url: item.place_url,
      }));
      console.log('장소', places);
      return places;
    } catch (error) {
      throw new HttpException(
        '카카오 장소 검색 실패',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
