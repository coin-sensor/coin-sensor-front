<template>
  <div class="page-container">
    <div class="page-header">
      <h1>About Us</h1>
      <p>코인센서 소개</p>
    </div>
    
    <div class="content-section">
      <h2>🚀 코인센서란?</h2>
      <p>
        코인센서는 암호화폐 시장의 급등락을 실시간으로 모니터링하고 알려드리는 플랫폼입니다.
        투자자들이 빠르게 변화하는 시장 상황을 놓치지 않도록 돕습니다.
      </p>
    </div>

    <div class="content-section">
      <h2>💡 주요 기능</h2>
      <div class="feature-item">
        <h3>📊 실시간 급등락 알림</h3>
        <p>바이낸스 현물 및 선물 거래소 데이터를 기반으로 실시간 모니터링</p>
        <ul>
          <li>다양한 타임프레임 지원: 1분, 5분, 15분, 1시간, 4시간, 일봉</li>
          <li>변동률과 거래량 기반 즉각 알림</li>
        </ul>
      </div>
      <div class="feature-item">
        <h3>📈 시장 인사이트</h3>
        <p>데이터 기반 시장 분석 및 트렌드 제공</p>
        <ul>
          <li>인기 코인 랭킹 및 추천 코인 분석</li>
          <li>탐지 통계 및 시장 분석 리포트</li>
        </ul>
      </div>
      <div class="feature-item">
        <h3>🗺️ 히트맵 시각화</h3>
        <p>시장 전체를 한눈에 파악할 수 있는 직관적인 시각화</p>
      </div>
      <div class="feature-item">
        <h3>📰 뉴스 및 경제 캘린더</h3>
        <p>시장에 영향을 주는 주요 이벤트 및 뉴스 추적</p>
      </div>
    </div>

    <div class="content-section">
      <h2>📜 서비스 정보</h2>
      <ul>
        <li>데이터 출처: 바이낸스 API</li>
        <li>서비스 제공: 365일 24시간 (시스템 점검 제외)</li>
        <li>이용 요금: 무료</li>
        <li>회원가입: 불필요</li>
      </ul>
    </div>

    <div class="content-section disclaimer">
      <h2>⚠️ 투자 유의사항</h2>
      <p>
        코인센서는 사이트 내 모든 암호화폐 가격 및 투자 관련 정보에 대하여 어떠한 책임을 부담하지 않습니다.
        디지털 자산 투자는 전적으로 스스로의 책임이므로 이에 유의하시기 바랍니다.
      </p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #667eea;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-header p {
  font-size: 1.1rem;
  color: #666;
}

.content-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.content-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.content-section p {
  line-height: 1.8;
  color: #555;
  font-size: 1rem;
}

.content-section ul {
  list-style: none;
  padding: 0;
}

.content-section li {
  padding: 0.75rem 0;
  line-height: 1.6;
  color: #555;
  border-bottom: 1px solid #e0e0e0;
}

.content-section li:last-child {
  border-bottom: none;
}

.feature-item {
  margin-bottom: 1.5rem;
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-item h3 {
  font-size: 1.2rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.feature-item p {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.feature-item ul {
  margin-top: 0.5rem;
  padding-left: 1rem;
}

.feature-item li {
  padding: 0.3rem 0;
  border-bottom: none;
  font-size: 0.95rem;
}

.feature-item li::before {
  content: "→";
  margin-right: 0.5rem;
  color: #667eea;
}

.disclaimer {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.disclaimer p {
  color: #856404;
  font-weight: 500;
}

.dark-mode .page-header p {
  color: #aaa;
}

.dark-mode .content-section {
  background: #2a2a2a;
}

.dark-mode .content-section h2 {
  color: #fff;
}

.dark-mode .content-section p,
.dark-mode .content-section li {
  color: #ccc;
}

.dark-mode .feature-item h3 {
  color: #8b9dff;
}

.dark-mode .feature-item li::before {
  color: #8b9dff;
}

.dark-mode .content-section li {
  border-bottom-color: #444;
}

.dark-mode .disclaimer {
  background: #3a3a2a;
  border-left-color: #ffc107;
}

.dark-mode .disclaimer p {
  color: #ffd54f;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .content-section {
    padding: 1rem;
  }
}
</style>
