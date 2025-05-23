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

export async function addressToChange(query: string) {
  const apiKey = process.env.KAKAO_KEY;

  const addressRes = await axios.get(
    'https://dapi.kakao.com/v2/local/search/address.json',
    { params: { query }, headers: { Authorization: `KakaoAK ${apiKey}` } },
  );

  if (addressRes.data.documents.length > 0) {
    const { x: longitude, y: latitude } = addressRes.data.documents[0].address;
    return { latitude, longitude, type: 'address' };
  }

  const keywordRes = await axios.get(
    'https://dapi.kakao.com/v2/local/search/keyword.json',
    { params: { query }, headers: { Authorization: `KakaoAK ${apiKey}` } },
  );

  if (keywordRes.data.documents.length > 0) {
    const { x: longitude, y: latitude } = keywordRes.data.documents[0];
    return { latitude, longitude, type: 'keyword' };
  }

  throw new Error('주소 혹은 장소를 찾을 수 없습니다.');
}

//gemini 요청 함수

const GEMINI_API =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const getGeminiApiKey = () => {
  const key = process.env.GOOGLE_GEMINI_KEY;
  if (!key) throw new Error('GOOGLE_GEMINI_KEY 환경변수가 없습니다.');
  return key;
};

export async function requestGemini(prompt: string): Promise<string> {
  const requestData = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const res = await axios.post(
      `${GEMINI_API}?key=${getGeminiApiKey()}`,
      requestData,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || '텍스트 응답이 아닙니다.';
  } catch (err: any) {
    console.error('Gemini 호출 실패:', err?.response?.data || err.message);
    throw new Error('Gemini 요청 실패');
  }
}

//프롬포트
export function generateSchedulePrompt(body: any): string {
  const { dataTime, dataPlace, dataStay } = body;

  const formatTime = (time: any) => {
    const hour =
      time.hour + (time.meridiem === '오후' && time.hour !== 12 ? 12 : 0);
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  let prompt = `📅 여행 일정 요청\n`;

  // 날짜별 정보 구성
  dataTime.forEach((day) => {
    const date = day.date;
    const start = formatTime(day.start);
    const end = formatTime(day.end);
    const stay = dataStay.find((s) => s.date === date.slice(0, 10));
    const stayTitle = stay?.place?.title || '없음';

    prompt += `\n🗓️ ${date}\n`;
    prompt += `- 이용 가능 시간: ${start} ~ ${end}\n`;
    prompt += `- 숙소: ${stayTitle}\n`;
  });

  // 장소 정보 구성
  prompt += `\n\n📍 방문 가능한 장소 목록:\n`;
  dataPlace.forEach((place, idx) => {
    prompt += `${idx + 1}. ${place.title} (${place.category})\n   - 예상 소요시간: ${place.minutes}분\n   - 주소: ${place.address}\n   - 이미지: ${place.imageSrc || '없음'}\n`;
  });

  // 요청 조건
  prompt += `\n\n📌 요청 사항:\n`;
  prompt += `- 위 장소들을 날짜별로 시간 내에서 효율적으로 나눠서 일정 구성해줘.\n`;
  prompt += `- 장소 간 동선을 고려해줘.\n`;
  prompt += `- 결과는 **JSON 형태**로 날짜별 일정 배열로 구성해줘.\n`;
  prompt += `- 형식 예시:\n`;
  prompt += `  {\n    "2025-05-13 (화)": [\n      {\n        "순서": 1,\n        "start": "09:00",\n        "end": "11:00",\n        
  "장소": "경주 탈해왕릉",\n        "위도": lat,\n        "경도": lon,\n        "주소": "...",\n        "타입": "관광지",\n       
   "image": "..." \n      },\n      {\n        "순서": 2,\n        "start": "11:00",\n        "end": "13:00",\n        "장소": "오누이",\n      
     "위도": lat,\n        "경도": lon,\n        "주소": "...",\n        "타입": "음식점",\n        "image": "..." \n    "rating": 평점, "reviewCount": 리뷰수  }\n    ]\n  }\n`;

  prompt += `- 숙소도 각 일차에 포함시켜줘 (1박마다).\n`;
  prompt += `- 가능한 일정을 최대한 꽉 채워서 구성해줘.\n`;
  prompt += `- 비는 시간은 인근 장소를 넣어 채워줘.\n`;
  prompt += `- 위도 경도, 리뷰수와 평점은 무조건 포함하고 image도 무조건 포함하고 장소, 주소도 무조건 포함해야해 모든 데이터는 null값이 없어야 함`;

  return prompt;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // 0부터 i까지 랜덤 인덱스 선택
    const j = Math.floor(Math.random() * (i + 1));
    // 두 요소 위치 바꾸기
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
