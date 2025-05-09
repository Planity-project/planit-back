import axios from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';

//랜덤 닉네임 만들기 함수
export const nicknameMaker = (): string => {
  const time = [
    '동틀녘의',
    '새벽의',
    '아침의',
    '점심의',
    '저녁의',
    '해질녘의',
    '밤의',
    '흐릿한',
    '불빛에',
    '시작되는',
    '고요한',
    '차가운',
    '따뜻한',
    '별빛이',
    '반짝이는',
    '새벽녘',
    '어두운',
    '차분한',
    '아련한',
    '바람에 실린',
    '하늘이 밝은',
    '빛나는',
    '찬란한',
    '구름이 낀',
    '푸른',
    '이슬 맺힌',
  ];

  const face = [
    '화난',
    '여유로운',
    '심심한',
    '외로운',
    '행복한',
    '졸린',
    '깊은',
    '따뜻한',
    '포근한',
    '장난스러운',
    '강한',
    '귀여운',
    '우울한',
    '짜증난',
    '웃고 있는',
    '슬픈',
    '엉뚱한',
    '설렘 가득한',
    '평화로운',
    '의욕적인',
    '친절한',
    '차가운',
    '조용한',
    '말없는',
    '혼자서 웃는',
    '긍정적인',
    '신나는',
    '어두운',
    '어색한',
  ];

  const animal = [
    '고양이',
    '강아지',
    '호랑이',
    '쿼카',
    '고슴도치',
    '햄스터',
    '토끼',
    '여우',
    '곰',
    '펭귄',
    '사자',
    '기린',
    '악어',
    '거북이',
    '팬더',
    '올빼미',
    '부엉이',
    '다람쥐',
    '무당벌레',
    '물고기',
    '거미',
    '늑대',
    '앵무새',
    '치타',
    '코알라',
    '카멜레온',
    '말',
    '코끼리',
    '늑대',
    '호저',
    '아르마딜로',
    '펠리컨',
    '백조',
    '개구리',
    '물소',
    '수달',
    '해마',
    '시베리안 호랑이',
    '붉은 여우',
    '타조',
    '황금독수리',
    '거미',
    '벌새',
    '오리',
    '물곰',
    '악어',
  ];

  // 랜덤 인덱스 선택
  const timeIndex = Math.floor(Math.random() * time.length);
  const faceIndex = Math.floor(Math.random() * face.length);
  const animalIndex = Math.floor(Math.random() * animal.length);

  // 랜덤 조합
  return `${time[timeIndex]} ${face[faceIndex]} ${animal[animalIndex]}`;
};

//주소를 위도 경도로 변환해주는 함수
export async function addressToChange(
  address: string,
): Promise<{ latitude: string; longitude: string }> {
  const apiKey = process.env.KAKAO_KEY;
  const url = 'https://dapi.kakao.com/v2/local/search/address.json';

  try {
    const response = await axios.get(url, {
      params: { query: address },
      headers: { Authorization: `KakaoAK ${apiKey}` },
    });

    if (!response.data.documents || response.data.documents.length === 0) {
      throw new Error('주소에 해당하는 위도/경도를 찾을 수 없습니다.');
    }

    const { x: longitude, y: latitude } = response.data.documents[0].address;
    return { latitude, longitude };
  } catch (error) {
    throw new HttpException('주소 변환 오류', HttpStatus.BAD_REQUEST);
  }
}
