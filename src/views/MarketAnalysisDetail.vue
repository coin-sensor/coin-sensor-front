<template>
  <div class="insight-container">
    <InsightSidebar />

    <main class="main-content">
      <div class="header-section">
        <h1>📊 시장 분석</h1>
        <p class="description">암호화폐 시장의 주요 지표와 분석 데이터를 제공합니다.</p>
      </div>

      <div class="analysis-grid">
        <MiniChart />
        <TechnicalAnalysis />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import MiniChart from '@/components/MiniChart.vue'
import TechnicalAnalysis from '@/components/TechnicalAnalysis.vue'
import InsightSidebar from '../components/InsightSidebar.vue'
</script>

<style scoped>
.insight-container {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}



.main-content {
  flex: 1;
  min-width: 0;
}

.header-section {
  margin-bottom: 2rem;
}

.header-section h1 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 2rem;
}

.description {
  color: #6b7280;
  margin: 0;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

:global(body.dark-mode) .header-section h1 {
  color: #f1f5f9;
}

:global(body.dark-mode) .description {
  color: #94a3b8;
}

@media (max-width: 768px) {
  .insight-container {
    flex-direction: column;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}
</style>
