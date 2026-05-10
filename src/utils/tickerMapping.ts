/**
 * 주요 국내 주식 및 ETF 종목 코드 매핑 데이터베이스
 * 6자리 숫자로 된 종목 코드를 입력하면 해당 이름을 반환합니다.
 */
export const TICKER_NAMES: Record<string, string> = {
  // 주요 국내 주식
  '005930': '삼성전자',
  '005935': '삼성전자우',
  '000660': 'SK하이닉스',
  '373220': 'LG에너지솔루션',
  '207940': '삼성바이오로직스',
  '005380': '현대차',
  '005490': 'POSCO홀딩스',
  '000270': '기아',
  '035420': 'NAVER',
  '035720': '카카오',
  '068270': '셀트리온',

  // 주요 국내 ETF (지수 추종)
  '069500': 'KODEX 200',
  '102110': 'TIGER 200',
  '229200': 'KODEX 코스닥150',
  '233740': 'KODEX 코스닥150레버리지',

  // 해외 지수 추종 (국내 상장)
  '133690': 'TIGER 미국나스닥100',
  '379810': 'KODEX 미국나스닥100TR',
  '360750': 'TIGER 미국테크TOP10 INDXX',
  '379800': 'TIGER 미국S&P500',
  '462330': 'KODEX 미국나스닥100TR',
  '453810': 'KODEX 미국S&P500TR',

  // 배당 및 테마 ETF
  '456600': 'TIME 글로벌AI인공지능액티브',
  '458730': 'TIGER 미국배당다우존스',
  '446770': 'ACE 글로벌반도체TOP4 Plus',
  '402970': 'TIGER 미국배당다우존스',
  '450370': 'ACE 미국배당다우존스',
  '452250': 'TIGER 미국테크TOP10+10%프리미엄',
  '420440': 'TIGER 글로벌리튬&이차전지SOLACTIVE',
  '305720': 'TIGER 2차전지테마',
  '396500': 'TIGER 반도체TOP10',

  // 기타 및 혼합
  '0057H0': 'PLUS 미국S&P500미국채혼합50액티브',

  // 채권 및 금리
  '273130': 'KODEX 종합채권(AA-이상)액티브',
  '453500': '신한 만기매칭형 채권',
  '403570': 'TIGER CD금리투자KIS(합성)',
  '447660': 'KODEX CD금리액티브(합성)',
  '491010': 'TIGER 글로벌AI전력인프라액티브',
  'EA119': '한화 LIFEPLUS 적격TDF 2060 증권 자투자신탁(주식혼합-재간접형)',

  // 특수 항목
  '고유계정대': '고유계정대'
};

/**
 * 이름을 기반으로 티커 리스트를 검색합니다.
 * 공백을 무시하고 부분 일치 여부를 확인하여 유연하게 검색합니다.
 */
export const searchTickersByName = (query: string): { ticker: string, name: string }[] => {
  if (!query || query.length < 1) return [];

  const cleanQuery = query.replace(/\s+/g, '').toLowerCase();

  return Object.entries(TICKER_NAMES)
    .filter(([ticker, name]) => {
      const cleanName = name.replace(/\s+/g, '').toLowerCase();
      const cleanTicker = ticker.toLowerCase();
      return cleanName.includes(cleanQuery) || cleanTicker.includes(cleanQuery);
    })
    .map(([ticker, name]) => ({ ticker, name }))
    .slice(0, 5); // 최대 5개까지만 노출
};

/**
 * 티커 코드를 입력받아 매핑된 이름을 반환합니다.
 * 매핑된 이름이 없으면 원래 코드를 반환합니다.
 */
export const getTickerDisplayName = (ticker: string): string => {
  const upperTicker = ticker.toUpperCase();
  return TICKER_NAMES[upperTicker] || ticker;
};
