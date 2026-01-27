<template>
  <div class="page-container">
    <div class="page-header">
      <h1>서비스 이용약관</h1>
      <p>Terms of Service</p>
    </div>

    <div class="content-section">
      <h2>제1조 (목적)</h2>
      <p>
        본 약관은 코인센서(이하 "서비스")가 제공하는 암호화폐 정보 서비스 이용과 관련하여 
        서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
      </p>
    </div>

    <div class="content-section">
      <h2>제2조 (서비스의 제공)</h2>
      <p>서비스는 다음과 같은 정보를 제공합니다:</p>
      <ul>
        <li>암호화폐 시세 정보 및 급등락 알림</li>
        <li>시장 분석 및 인사이트</li>
        <li>뉴스 및 경제 캘린더</li>
        <li>기타 암호화폐 관련 정보</li>
      </ul>
      <p>
        서비스는 365일 24시간 제공을 목표로 하나, 시스템 점검, 서버 장애 등 불가피한 사유로 
        일시 중단될 수 있습니다.
      </p>
    </div>

    <div class="content-section">
      <h2>제3조 (서비스 이용)</h2>
      <ul>
        <li>서비스는 무료로 제공되며, 별도의 회원가입 없이 이용 가능합니다.</li>
        <li>이용자는 서비스를 통해 제공되는 정보를 투자 참고용으로만 활용해야 합니다.</li>
        <li>서비스에서 제공하는 정보는 투자 권유나 조언이 아닙니다.</li>
      </ul>
    </div>

    <div class="content-section">
      <h2>제4조 (이용자의 의무)</h2>
      <p>이용자는 다음 행위를 해서는 안 됩니다:</p>
      <ul>
        <li>서비스의 정상적인 운영을 방해하는 행위</li>
        <li>다른 이용자의 정보를 무단으로 수집하는 행위</li>
        <li>서비스의 정보를 무단으로 복제, 배포, 상업적으로 이용하는 행위</li>
        <li>공서양속 및 법령에 위반되는 행위</li>
      </ul>
    </div>

    <div class="content-section">
      <h2>제5조 (서비스의 책임 제한)</h2>
      <ul>
        <li>서비스는 제공되는 정보의 정확성, 완전성을 보장하지 않습니다.</li>
        <li>서비스는 이용자의 투자 결정 및 그 결과에 대해 어떠한 책임도 지지 않습니다.</li>
        <li>천재지변, 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
        <li>외부 링크된 사이트의 내용에 대해 책임을 지지 않습니다.</li>
      </ul>
    </div>

    <div class="content-section">
      <h2>제6조 (개인정보 보호)</h2>
      <p>
        서비스는 이용자의 개인정보를 보호하며, 자세한 사항은 개인정보처리방침을 참고하시기 바랍니다.
      </p>
    </div>

    <div class="content-section">
      <h2>제7조 (저작권)</h2>
      <p>
        서비스에서 제공하는 모든 콘텐츠의 저작권은 서비스에 귀속됩니다. 
        이용자는 서비스의 사전 승인 없이 콘텐츠를 복제, 배포, 상업적으로 이용할 수 없습니다.
      </p>
    </div>

    <div class="content-section">
      <h2>제8조 (약관의 변경)</h2>
      <p>
        서비스는 필요한 경우 본 약관을 변경할 수 있으며, 변경 시 최소 7일 전에 공지합니다.
      </p>
    </div>

    <div class="content-section">
      <h2>제9조 (분쟁 해결)</h2>
      <p>
        본 약관은 대한민국 법률에 따라 규율되며, 서비스와 이용자 간 분쟁 발생 시 
        대한민국 법원을 관할 법원으로 합니다.
      </p>
    </div>

    <div class="update-date">
      시행일: 2026년 1월 1일
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
