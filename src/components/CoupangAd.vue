<template>
  <div class="coupang-ad-container">
    <a 
      href="https://link.coupang.com/a/dwmZs9" 
      target="_blank" 
      referrerpolicy="unsafe-url"
    >
      <img 
        src="https://ads-partners.coupang.com/banners/959252?subId=&traceId=V0-301-879dd1202e5c73b2-I959252&w=728&h=90" 
        alt="쿠팡 파트너스 광고"
      >
    </a>
    <p class="ad-disclaimer">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
  </div>
</template>

<style scoped>
.coupang-ad-container {
  margin: 2rem 0;
  padding: 1rem;
  text-align: center;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.coupang-ad-container a {
  display: inline-block;
  margin-bottom: 0.5rem;
}

.coupang-ad-container img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.ad-disclaimer {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: #6b7280;
}

:global(#app.dark-mode) .coupang-ad-container {
  background: #1e293b;
  border-color: #334155;
}

:global(#app.dark-mode) .ad-disclaimer {
  color: #94a3b8;
}
</style>
