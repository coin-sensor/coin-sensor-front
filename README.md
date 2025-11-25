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


---------------------------------------------------------------------------

# 암호화폐 인사이트 페이지 기획서

## 1. 시장 동향 분석

### 급등/급락 코인 트렌드
- `detected_coins` 테이블의 `change_x`, `volume_x` 데이터 활용
- 일/주/월별 급등락 패턴 분석
- 시간대별 변동률 히트맵

### 거래량 폭증 분석
- 평소 대비 거래량 배율(`volume_x`) 분석
- 거래량 급증 코인의 시간대별 분포
- 거래량-가격 상관관계 차트

### 시장 변동성 지표
- `fear_greed_indexes` 테이블 활용
- 공포탐욕지수 변화 추이
- 변동성/도미넌스/감정 점수 종합 분석

## 2. 사용자 행동 인사이트

### 인기 코인 랭킹
- `coin_clicks` + `view_count` + `favorite_coins` 조합
- 실제 관심도 vs 시장 성과 비교
- 사용자 관심도 변화 추이

### 사용자 참여도
- 채널별 메시지 수(`messages`)
- 리액션 활동도(`reaction_counts`)
- 투표 참여율(`user_votes`)

### 시간대별 활동 패턴
- 사용자 활동 시간 분석
- 코인별 관심도 시간대 변화
- 피크 타임 vs 코인 성과

## 3. 예측 및 분석 리포트

### AI 분석 성과
- `analyses` 테이블의 예측 정확도
- `like_count`, `dislike_count` 기반 사용자 만족도
- 예측 방향(`trend_prediction`) vs 실제 결과

### 경제 이벤트 영향도
- `economic_events`와 코인 가격 변동 상관관계
- 이벤트 중요도별 시장 반응 분석
- 국가별/자산별 영향도 매트릭스

### 뉴스 감정 분석
- `news_articles`의 `sentiment` 분석
- 뉴스 감정과 시장 반응 연관성
- 소스별 신뢰도 분석

## 4. 커뮤니티 인사이트

### 투표 결과 vs 실제 시장
- `user_votes` 데이터와 실제 코인 성과 비교
- 커뮤니티 예측 정확도
- 롱/숏/중립 비율과 시장 움직임

### 채널별 토론 주제
- `messages` 내용 분석으로 핫 토픽 추출
- 채널별 관심사 분석
- 토론 활발도와 코인 성과 상관관계

### 사용자 신뢰도
- 예측 적중률 높은 사용자 패턴
- 영향력 있는 사용자 식별
- 팔로우할 만한 사용자 추천

## 5. 실시간 대시보드

### 현재 탐지 현황
- 실시간 급등락 코인 수
- 평균 변동률(`change_x_avg`)
- 탐지 조건별 분포

### 커뮤니티 온도
- 활성 사용자 수
- 메시지 빈도
- 리액션 활동도

### 시장 심리 지표
- 공포탐욕지수 + 커뮤니티 투표 성향
- 종합 시장 심리 점수
- 과매수/과매도 신호

## 6. 개인화 인사이트

### 내 관심 코인 성과
- `favorite_coins` 기반 개인 포트폴리오 추적
- 관심 코인 수익률 분석
- 관심 코인 vs 시장 평균 비교

### 내 예측 정확도
- 개인 투표/예측 히스토리
- 예측 정확도 점수
- 개선 포인트 제안

### 추천 코인
- 사용자 행동 패턴 기반 추천
- 유사 사용자 관심 코인
- 개인화된 알림 설정

## 구현 우선순위

1. **Phase 1**: 시장 동향 분석 + 실시간 대시보드
2. **Phase 2**: 사용자 행동 인사이트 + 커뮤니티 분석
3. **Phase 3**: 개인화 기능 + 예측 분석
