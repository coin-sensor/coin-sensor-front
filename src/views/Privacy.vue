<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Privacy Policy</h1>
      <p>개인정보처리방침</p>
    </div>
    
    <div class="content-section">
      <h2>1. 수집하는 개인정보</h2>
      <p>
        코인센서는 서비스 제공을 위해 최소한의 정보만을 수집합니다:
      </p>
      <ul>
        <li>접속 로그 (IP 주소, 접속 시간)</li>
        <li>쿠키를 통한 사용자 설정 (다크모드, 알림 설정 등)</li>
      </ul>
    </div>

    <div class="content-section">
      <h2>2. 개인정보의 이용 목적</h2>
      <ul>
        <li>서비스 제공 및 개선</li>
        <li>사용자 경험 최적화</li>
        <li>통계 분석 및 서비스 품질 향상</li>
      </ul>
    </div>

    <div class="content-section">
      <h2>3. 개인정보의 보유 및 이용 기간</h2>
      <p>
        수집된 정보는 서비스 제공 기간 동안 보유하며, 
        사용자가 삭제를 요청하거나 서비스 종료 시 즉시 파기됩니다.
      </p>
    </div>

    <div class="content-section">
      <h2>4. 개인정보의 제3자 제공</h2>
      <p>
        코인센서는 사용자의 개인정보를 제3자에게 제공하지 않습니다.
        법령에 의한 경우를 제외하고는 어떠한 경우에도 외부에 공개되지 않습니다.
      </p>
    </div>

    <div class="content-section">
      <h2>5. 쿠키 사용</h2>
      <p>
        사용자 설정 저장을 위해 쿠키를 사용합니다. 
        브라우저 설정을 통해 쿠키 사용을 거부할 수 있으나, 
        일부 기능이 제한될 수 있습니다.
      </p>
    </div>

    <div class="content-section">
      <h2>6. 문의</h2>
      <p>
        개인정보 관련 문의사항은 Contact 페이지를 통해 연락 주시기 바랍니다.
      </p>
    </div>

    <div class="update-date">
      최종 업데이트: 2026년 1월
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
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.content-section h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #333;
}

.content-section p {
  line-height: 1.8;
  color: #555;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.content-section ul {
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
}

.content-section li {
  padding: 0.5rem 0 0.5rem 1.5rem;
  line-height: 1.6;
  color: #555;
  position: relative;
}

.content-section li::before {
  content: "•";
  position: absolute;
  left: 0.5rem;
  color: #667eea;
}

.update-date {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  color: #888;
  font-size: 0.9rem;
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

.dark-mode .update-date {
  border-top-color: #444;
  color: #888;
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
