<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Contact</h1>
      <p>문의하기</p>
    </div>
    
    <div class="content-section">
      <h2>📧 이메일 문의</h2>
      <p>
        서비스 관련 문의사항이나 제안사항이 있으시면 아래 이메일로 연락 주세요.
      </p>
      <div class="contact-info">
        <a href="mailto:coinsensor2026@gmail.com">coinsensor2026@gmail.com</a>
      </div>
    </div>

    <div class="content-section">
      <h2>💬 문의 유형</h2>
      <ul>
        <li>서비스 이용 관련 문의</li>
        <li>기술적 문제 신고</li>
        <li>제휴 및 광고 문의</li>
        <li>기능 개선 제안</li>
      </ul>
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
}

.contact-info {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  text-align: center;
}

.contact-info a {
  color: #667eea;
  font-size: 1.2rem;
  font-weight: 600;
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}

.content-section ul {
  list-style: none;
  padding: 0;
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

.dark-mode .contact-info {
  background: #1a1a1a;
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
