<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-disclaimer">
        코인센서는 사이트 내 모든 암호화폐 가격 및 투자 관련 정보에 대하여 어떠한 책임을 부담하지 않습니다.<br>
        디지털 자산 투자는 전적으로 스스로의 책임이므로 이에 유의하시기 바랍니다.
      </div>
      <div class="footer-links">
        <router-link to="/about" class="footer-link">서비스 소개</router-link>
        <router-link to="/terms" class="footer-link">이용약관</router-link>
        <router-link to="/privacy" class="footer-link">개인정보처리방침</router-link>
        <router-link to="/contact" class="footer-link">문의하기</router-link>
      </div>
      <div class="footer-copyright">
        © {{ currentYear }} Coin Sensor. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-disclaimer {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
  width: 100%;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.footer-logo {
  width: 32px;
  height: 32px;
}

.footer-links {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #374151;
}

.footer-copyright {
  font-size: 0.875rem;
  color: #9ca3af;
}

.dark-mode .footer {
  background: #000000;
  border-top: 1px solid #334155;
}

.dark-mode .footer-disclaimer {
  color: #94a3b8;
  border-bottom-color: #334155;
}

.dark-mode .footer-brand {
  color: #f1f5f9;
}

.dark-mode .footer-link {
  color: #94a3b8;
}

.dark-mode .footer-link:hover {
  color: #e2e8f0;
}

.dark-mode .footer-copyright {
  color: #64748b;
}

@media (max-width: 768px) {
  .footer {
    padding: 1.5rem 0;
  }
  
  .footer-content {
    gap: 1rem;
  }
  
  .footer-links {
    gap: 1.5rem;
  }
  
  .footer-brand {
    font-size: 1.1rem;
  }
}
</style>
