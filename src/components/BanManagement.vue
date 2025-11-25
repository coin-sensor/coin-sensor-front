<template>
  <div class="ban-management">
    <div class="section">
      <h3>🚫 금지 유형 관리</h3>
      
      <div class="form-section">
        <h4>{{ showEditModal ? '금지 유형 수정' : '새 금지 유형 추가' }}</h4>
        <form @submit.prevent="showEditModal ? updateBanType() : createBanType()" class="ban-type-form">
          <input v-model="newBanType.reason" placeholder="금지 사유" required />
          <input v-model.number="newBanType.period" type="number" placeholder="금지기간(일)" required />
          <button type="submit" class="btn-primary">{{ showEditModal ? '수정' : '추가' }}</button>
          <button v-if="showEditModal" @click="cancelEdit" type="button" class="btn-secondary">취소</button>
        </form>
      </div>

      <div class="ban-types-list">
        <h4>금지 유형 목록</h4>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>사유</th>
              <th>기간(일)</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="banType in banTypes" :key="banType.banTypeId">
              <td>{{ banType.banTypeId }}</td>
              <td>{{ banType.reason }}</td>
              <td>{{ banType.period }}일</td>
              <td>
                <button @click="editBanType(banType)" class="btn-warning">수정</button>
                <button @click="deleteBanType(banType.banTypeId)" class="btn-danger">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <h3>👤 사용자 금지 관리</h3>
      
      <div class="form-section">
        <h4>사용자 금지</h4>
        <form @submit.prevent="banUser" class="user-ban-form">
          <input v-model.number="newUserBan.userId" type="number" placeholder="사용자 ID" required />
          <select v-model="newUserBan.banTypeId" required>
            <option value="">금지 유형 선택</option>
            <option v-for="banType in banTypes" :key="banType.banTypeId" :value="banType.banTypeId">
              {{ banType.reason }} ({{ banType.period }}일)
            </option>
          </select>
          <button type="submit" class="btn-primary">금지</button>
        </form>
      </div>

      <div class="banned-users-list">
        <h4>금지된 사용자 목록</h4>
        <table>
          <thead>
            <tr>
              <th>사용자 ID</th>
              <th>금지 유형 ID</th>
              <th>사유</th>
              <th>시작 시간</th>
              <th>종료 시간</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ban in bannedUsers" :key="ban.userBanId">
              <td>{{ ban.userId }}</td>
              <td>{{ ban.banTypeId }}</td>
              <td>{{ ban.reason }}</td>
              <td>{{ formatDate(ban.startTime) }}</td>
              <td>{{ formatDate(ban.endTime) }}</td>
              <td>
                <button @click="unbanUser(ban.userBanId)" class="btn-success">해제</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { banApi, type BanTypeRequest, type BanTypeResponse, type UserBanRequest, type UserBanResponse } from '../services/banApi'

const banTypes = ref<BanTypeResponse[]>([])
const bannedUsers = ref<UserBanResponse[]>([])
const editingBanType = ref<BanTypeResponse | null>(null)
const showEditModal = ref(false)

const newBanType = ref<BanTypeRequest>({
  period: 1,
  reason: ''
})

const newUserBan = ref<UserBanRequest>({
  userId: 0,
  banTypeId: 0
})

const loadBanTypes = async () => {
  try {
    banTypes.value = await banApi.getAllBanTypes()
  } catch (error) {
    console.error('금지 유형 로드 실패:', error)
  }
}

const loadBannedUsers = async () => {
  try {
    bannedUsers.value = await banApi.getAllBannedUsers()
  } catch (error) {
    console.error('금지된 사용자 로드 실패:', error)
  }
}

const createBanType = async () => {
  try {
    await banApi.createBanType(newBanType.value)
    newBanType.value = { period: 1, reason: '' }
    await loadBanTypes()
  } catch (error) {
    console.error('금지 유형 생성 실패:', error)
  }
}

const editBanType = (banType: BanTypeResponse) => {
  editingBanType.value = banType
  newBanType.value = { period: banType.period, reason: banType.reason }
  showEditModal.value = true
}

const updateBanType = async () => {
  if (!editingBanType.value) return
  try {
    await banApi.updateBanType(editingBanType.value.banTypeId, newBanType.value)
    showEditModal.value = false
    editingBanType.value = null
    newBanType.value = { period: 1, reason: '' }
    await loadBanTypes()
  } catch (error) {
    console.error('금지 유형 수정 실패:', error)
  }
}

const cancelEdit = () => {
  showEditModal.value = false
  editingBanType.value = null
  newBanType.value = { period: 1, reason: '' }
}

const deleteBanType = async (banTypeId: number) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await banApi.deleteBanType(banTypeId)
      await loadBanTypes()
    } catch (error) {
      console.error('금지 유형 삭제 실패:', error)
    }
  }
}

const banUser = async () => {
  try {
    await banApi.banUser(newUserBan.value)
    newUserBan.value = { userId: 0, banTypeId: 0 }
    await loadBannedUsers()
  } catch (error) {
    console.error('사용자 금지 실패:', error)
  }
}

const unbanUser = async (userBanId: number) => {
  if (confirm('정말 금지를 해제하시겠습니까?')) {
    try {
      await banApi.unbanUser(userBanId)
      await loadBannedUsers()
    } catch (error) {
      console.error('금지 해제 실패:', error)
    }
  }
}



const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ko-KR')
}

onMounted(() => {
  loadBanTypes()
  loadBannedUsers()
})
</script>

<style scoped>
.ban-management {
  padding: 1rem;
}

.section {
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.form-section h4 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.ban-type-form,
.user-ban-form {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ban-type-form input,
.user-ban-form input,
.user-ban-form select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  flex: 1;
  min-width: 150px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-danger {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-success {
  background: #059669;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.btn-success:hover {
  background: #047857;
}

.btn-warning {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-right: 0.25rem;
  transition: background 0.2s;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #4b5563;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.status-active {
  color: #dc2626;
  font-weight: 600;
}

.status-expired {
  color: #6b7280;
}

:global(body.dark-mode) .section {
  background: #1e293b;
  color: #f1f5f9;
}

:global(body.dark-mode) .section h3 {
  color: #f1f5f9;
}

:global(body.dark-mode) .form-section {
  background: #374151;
}

:global(body.dark-mode) th {
  background: #374151;
  color: #f1f5f9;
}

:global(body.dark-mode) input,
:global(body.dark-mode) select {
  background: #374151;
  border-color: #4b5563;
  color: #f1f5f9;
}
</style>