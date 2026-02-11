<template>
  <div class="post-detail-container">
    <div v-if="loading" class="loading">로딩 중...</div>
    
    <div v-else-if="post" class="post-detail">
      <div class="post-header">
        <button @click="goBack" class="back-btn">← 목록으로</button>
        <div class="post-actions" v-if="isAdmin">
          <button v-if="!isEditMode" @click="editPost" class="edit-btn">수정</button>
          <template v-else>
            <button @click="updatePost" class="save-btn">저장</button>
            <button @click="cancelEdit" class="cancel-btn">취소</button>
          </template>
          <button v-if="!isEditMode" @click="deletePost" class="delete-btn">삭제</button>
        </div>
      </div>

      <div class="post-content">
        <div class="post-meta">
          <span class="category-badge">{{ getCategoryDisplayName(post.categoryName) }}</span>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          <span class="post-views">조회 {{ post.viewCount }}</span>
        </div>
        
        <input 
          v-if="isEditMode" 
          v-model="editForm.title" 
          class="edit-title-input"
          placeholder="제목을 입력하세요"
        />
        <h1 v-else class="post-title">{{ post.title }}</h1>
        
        <div class="post-info">
          <span class="post-writer">작성자: {{ post.writer }}</span>
        </div>
        
        <textarea 
          v-if="isEditMode" 
          v-model="editForm.content" 
          class="edit-content-textarea"
          placeholder="내용을 입력하세요"
        ></textarea>
        <div v-else class="post-body" v-html="formatContent(post.content)"></div>
      </div>
    </div>

    <div v-else class="error">
      게시글을 찾을 수 없습니다.
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { postApi } from '../services/postApi'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const post = ref(null)
const loading = ref(false)
const isEditMode = ref(false)
const isAdmin = ref(false)
const editForm = ref({
  title: '',
  content: ''
})

const loadPost = async () => {
  loading.value = true
  try {
    const postId = Number(route.params.id)
    post.value = await postApi.getPost(postId)
  } catch (error) {
    console.error('Failed to load post:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  if (post.value) {
    router.push(`/community/${post.value.categoryName}/1`)
  } else {
    router.push('/community/notice/1')
  }
}

function editPost() {
  if (post.value) {
    editForm.value.title = post.value.title
    editForm.value.content = post.value.content
    isEditMode.value = true
  }
}

function cancelEdit() {
  isEditMode.value = false
  editForm.value.title = ''
  editForm.value.content = ''
}

async function updatePost() {
  if (!editForm.value.title.trim() || !editForm.value.content.trim()) {
    alert('제목과 내용을 입력해주세요.')
    return
  }

  try {
    const postId = Number(route.params.id)
    const updatedPost = await postApi.updatePost(postId, editForm.value)
    post.value = updatedPost
    isEditMode.value = false
  } catch (error) {
    console.error('Failed to update post:', error)
    alert('게시글 수정에 실패했습니다.')
  }
}

const deletePost = async () => {
  if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    return
  }

  try {
    const postId = Number(route.params.id)
    const categoryName = post.value.categoryName
    await postApi.deletePost(postId)
    router.push(`/community/${categoryName}/1`)
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('게시글 삭제에 실패했습니다.')
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatContent = (content) => {
  return content.replace(/\n/g, '<br>')
}

const getCategoryDisplayName = (categoryName) => {
  return categoryName === 'notice' ? '공지사항' : '트레이더'
}

onMounted(async () => {
  isAdmin.value = await authStore.checkAdminStatus()
  loadPost()
})
</script>

<style scoped>
.post-detail-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  padding: 8px 16px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--bg-hover);
}

.post-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.edit-btn {
  background: var(--primary-color);
  color: white;
}

.edit-btn:hover {
  background: var(--primary-hover);
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.post-content {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 30px;
  border: 1px solid var(--border-color);
}

.post-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  font-size: 14px;
}

.category-badge {
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.post-date, .post-views {
  color: var(--text-secondary);
}

.post-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
  line-height: 1.3;
}

.post-info {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.post-writer {
  color: var(--text-secondary);
  font-size: 14px;
}

.post-body {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 16px;
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
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
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
  height: 200px;
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

.edit-title-input {
  width: 100%;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 12px;
  margin-bottom: 15px;
  line-height: 1.3;
}

.edit-title-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.edit-content-textarea {
  width: 100%;
  height: 400px;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 12px;
  font-size: 16px;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
}

.edit-content-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.save-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  background: #28a745;
  color: white;
}

.save-btn:hover {
  background: #218838;
}
</style>