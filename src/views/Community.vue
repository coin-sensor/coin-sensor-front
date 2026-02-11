<template>
  <div class="community-container">
    <div class="posts-section">
      <div class="posts-header">
        <h2>{{ getCategoryDisplayName(selectedCategory) }}</h2>
        <button v-if="isAdmin" @click="router.push(`/community/create?category=${selectedCategory}`)" class="create-btn">
          글쓰기
        </button>
      </div>

      <div v-if="loading" class="loading">로딩 중...</div>
      
      <div v-else-if="posts.length === 0" class="no-posts">
        게시글이 없습니다.
      </div>

      <div v-else class="posts-list">
        <div 
          v-for="post in posts" 
          :key="post.postId"
          @click="viewPost(post.postId)"
          class="post-item"
        >
          <div class="post-title">{{ post.title }}</div>
          <div class="post-meta">
            <span class="post-writer">{{ post.writer }}</span>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            <span class="post-views">조회 {{ post.viewCount }}</span>
          </div>
        </div>
      </div>
      
      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToPage(1)" :disabled="currentPage <= 1" class="page-btn">처음</button>
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1" class="page-btn">이전</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="page-btn">다음</button>
        <button @click="goToPage(totalPages)" :disabled="currentPage >= totalPages" class="page-btn">마지막</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { postApi } from '../services/postApi'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isAdmin = ref(false)

const categories = [
  { id: 1, name: 'notice', displayName: '공지사항' },
  { id: 2, name: 'trader', displayName: '트레이더' }
]

const selectedCategory = computed(() => route.params.category || 'notice')
const currentPage = computed(() => parseInt(route.params.page) || 1)
const posts = ref([])
const loading = ref(false)
const totalPages = ref(0)
const totalElements = ref(0)
const newPost = ref({
  categoryId: 1,
  title: '',
  content: ''
})

function getCategoryDisplayName(categoryName) {
  const category = categories.find(c => c.name === categoryName)
  return category ? category.displayName : categoryName
}

function goToPage(page) {
  router.push(`/community/${selectedCategory.value}/${page}`)
}

async function loadPosts() {
  loading.value = true
  try {
    const response = await postApi.getPosts(selectedCategory.value, currentPage.value - 1)
    posts.value = response.content || []
    totalPages.value = response.totalPages || 1
    totalElements.value = response.totalElements || 0
  } catch (error) {
    console.error('Failed to load posts:', error)
    posts.value = []
    totalPages.value = 1
    totalElements.value = 0
  } finally {
    loading.value = false
  }
}

function viewPost(postId) {
  router.push(`/community/post/${postId}`)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  isAdmin.value = await authStore.checkAdminStatus()
  
  // URL에 카테고리가 없으면 기본값으로 리다이렉트
  if (!route.params.category) {
    router.replace('/community/notice/1')
    return
  }
  
  const category = categories.find(c => c.name === selectedCategory.value)
  newPost.value.categoryId = category?.id || 1
  
  loadPosts()
})

// URL 변경 감지
watch(() => [route.params.category, route.params.page], () => {
  const category = categories.find(c => c.name === selectedCategory.value)
  newPost.value.categoryId = category?.id || 1
  loadPosts()
})
</script>

<style scoped>
.community-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.community-header h2 {
  margin-bottom: 30px;
  color: var(--text-primary);
  font-size: 32px;
  font-weight: 700;
}

.category-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.category-tab {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-tab:hover {
  background: var(--bg-hover);
}

.category-tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.posts-header h2 {
  color: var(--text-primary);
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.create-btn {
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.create-btn:hover {
  background: var(--primary-hover);
}

.loading, .no-posts {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-item {
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.post-item:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.post-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.post-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 8px;
  width: 95%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 20px;
}

.title-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  margin-bottom: 15px;
  font-size: 16px;
}

.content-input {
  width: 100%;
  height: 300px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn, .submit-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: var(--bg-hover);
}

.submit-btn {
  background: var(--primary-color);
  color: white;
}

.submit-btn:hover {
  background: var(--primary-hover);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--bg-hover);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 8px 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.create-actions {
  display: flex;
  gap: 10px;
}

.save-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #218838;
}

.create-form {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 20px;
  overflow: hidden;
}

.form-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.form-header h3 {
  color: var(--text-primary);
  margin: 0;
}

.form-body {
  padding: 20px;
}

.create-title-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-primary);
  color: var(--text-primary);
  margin-bottom: 15px;
  font-size: 16px;
}

.create-title-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.create-content-textarea {
  width: 100%;
  height: 300px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  font-family: inherit;
}

.create-content-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}
</style>