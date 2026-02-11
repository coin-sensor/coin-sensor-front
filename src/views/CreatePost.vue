<template>
  <div class="create-post-container">
    <div class="create-header">
      <div class="header-left">
        <span class="category-info">{{ categoryName }}</span>
        <h2>새 글 작성</h2>
      </div>
      <button @click="goBack" class="back-btn">← 목록으로</button>
    </div>

    <div class="create-form">
      <div class="form-group">
        <label>제목</label>
        <input 
          v-model="newPost.title" 
          placeholder="제목을 입력하세요"
          class="title-input"
        />
      </div>

      <div class="form-group">
        <label>내용</label>
        <textarea 
          v-model="newPost.content" 
          placeholder="내용을 입력하세요"
          class="content-textarea"
        ></textarea>
      </div>

      <div class="form-actions">
        <button @click="goBack" class="cancel-btn">취소</button>
        <button @click="createPost" class="submit-btn">작성</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { postApi } from '../services/postApi'

const router = useRouter()
const route = useRoute()

const newPost = ref({
  categoryId: 1,
  title: '',
  content: ''
})

const categoryName = ref('공지사항')

function goBack() {
  router.push('/community')
}

async function createPost() {
  if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
    alert('제목과 내용을 입력해주세요.')
    return
  }

  try {
    const createdPost = await postApi.createPost(newPost.value)
    // 작성된 게시글로 리다이렉트
    router.push(`/community/post/${createdPost.postId}`)
  } catch (error) {
    console.error('Failed to create post:', error)
    alert('글 작성에 실패했습니다.')
  }
}

onMounted(() => {
  // URL 파라미터로 카테고리 설정
  const category = route.query.category
  if (category === 'trader') {
    newPost.value.categoryId = 2
    categoryName.value = '트레이더'
  } else {
    newPost.value.categoryId = 1
    categoryName.value = '공지사항'
  }
})
</script>

<style scoped>
.create-post-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-info h2 {
  color: var(--text-primary);
  margin: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h2 {
  color: var(--text-primary);
  margin: 0;
}

.category-info {
  background: var(--primary-color);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
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

.create-header h2 {
  color: var(--text-primary);
  margin: 0;
}

.create-form {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 500;
}

.category-select {
  width: 200px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.title-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 16px;
}

.content-textarea {
  width: 100%;
  height: 400px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  resize: vertical;
}

.title-input:focus, .content-textarea:focus, .category-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.cancel-btn, .submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
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
</style>