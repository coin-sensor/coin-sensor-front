# Coin Sensor Frontend

실시간 암호화폐 모니터링 대시보드 Vue.js 프론트엔드

## 🚀 주요 기능

### 1. 실시간 모니터링 대시보드
- **실시간 이상 코인 알림**: WebSocket을 통한 실시간 데이터 수신
- **TOP20 고변동성 코인 테이블**: 정렬 가능한 데이터 테이블
- **시장 개요 위젯**: 비트코인 가격, 공포탐욕지수, 롱숏 비율, 김치프리미엄

### 2. 차트 및 분석 기능
- **멀티 타임프레임 차트**: 1분, 5분, 1시간, 일봉 지원
- **기술적 지표**: RSI, MACD, 볼린저 밴드
- **김치프리미엄 분석**: 국내외 가격 차이 시각화
- **롱숏 비율 차트**: 실시간 포지션 비율

### 3. 커뮤니티 기능
- **실시간 채팅**: 메인 채팅룸 및 코인별 채팅룸
- **인기 키워드 랭킹**: 실시간 키워드 추출 및 순위
- **투자 결정 돌림판**: 매수/매도/손절/익절/관망 랜덤 선택

### 4. 정보 서비스
- **뉴스 피드**: 실시간 암호화폐 뉴스
- **경제 캘린더**: 중요 경제 이벤트 일정

## 🛠 기술 스택

### Core Framework
- **Vue 3** (Composition API)
- **TypeScript** 지원
- **Vue Router 4**

### 상태 관리
- **Pinia** (Vue 3 공식 상태 관리)

### UI 라이브러리
- **Vuetify 3** (Material Design)
- **Material Design Icons**

### 차트 라이브러리
- **Chart.js** + **Vue-ChartJS**

### 실시간 통신
- **Socket.io-client**

### HTTP 클라이언트
- **Axios**

## 📱 페이지 구성

### 1. 대시보드 (`/`)
- 실시간 시장 개요
- 이상 코인 알림 리스트
- TOP20 고변동성 코인 테이블

### 2. 분석 (`/analysis`)
- 멀티 타임프레임 차트
- 기술적 지표 패널
- 김치프리미엄 분석
- 롱숏 비율 차트

### 3. 커뮤니티 (`/community`)
- 실시간 채팅룸
- 인기 키워드 랭킹
- 투자 결정 돌림판
- 커뮤니티 통계

### 4. 뉴스 (`/news`)
- 암호화폐 뉴스 피드
- 경제 캘린더

## 🔧 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run serve
```

### 3. 프로덕션 빌드
```bash
npm run build
```

## 🔄 백엔드 API 연동

### API 엔드포인트
- **코인 데이터**: `GET /api/coins/volatile`, `GET /api/coins/abnormal`
- **마켓 데이터**: `GET /api/market/overview`, `GET /api/market/fear-greed`
- **뉴스**: `GET /api/news`, `GET /api/news/calendar`
- **커뮤니티**: `GET /api/community/channel/channels`, `GET /api/community/channel/keywords`

### WebSocket 이벤트
- `coins`: 실시간 코인 데이터
- `abnormal_coins`: 이상 코인 알림
- `market_data`: 시장 데이터 업데이트
- `channel_message`: 채팅 메시지
- `keywords_update`: 키워드 업데이트

## 📊 주요 컴포넌트

### 1. MarketOverview.vue
- 시장 개요 위젯 (비트코인 가격, 공포탐욕지수 등)

### 2. CoinTable.vue
- TOP20 고변동성 코인 테이블

### 3. AbnormalCoinsList.vue
- 실시간 이상 코인 알림 리스트

### 4. Channel.vue
- 실시간 채팅 기능

### 5. PopularKeywords.vue
- 인기 키워드 랭킹

### 6. InvestmentRoulette.vue
- 투자 결정 돌림판

## 🎨 UI/UX 특징

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 지원
- Vuetify의 그리드 시스템 활용

### 다크/라이트 테마
- 테마 토글 기능
- 사용자 선호도 저장

### 실시간 알림
- 스낵바를 통한 시스템 알림
- WebSocket 연결 상태 표시

### 애니메이션
- 부드러운 전환 효과
- 호버 애니메이션
- 로딩 스켈레톤

## 🔒 보안 및 성능

### CORS 설정
- 백엔드 API와의 안전한 통신

### 에러 핸들링
- API 호출 실패 시 사용자 친화적 메시지
- WebSocket 재연결 로직

### 성능 최적화
- 컴포넌트 지연 로딩
- 데이터 캐싱
- 메모리 누수 방지

## 🚀 배포

### 환경 변수 설정
```bash
# .env.production
VUE_APP_API_BASE_URL=https://your-api-domain.com
VUE_APP_WS_URL=wss://your-websocket-domain.com
```

### Docker 배포
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "serve"]
```

## 📈 향후 개발 계획

- [ ] Chart.js 차트 구현
- [ ] PWA 기능 추가
- [ ] 다국어 지원 (i18n)
- [ ] 사용자 설정 저장
- [ ] 알림 설정 기능
- [ ] 모바일 앱 버전