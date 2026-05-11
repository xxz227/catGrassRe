<template>
  <div class="user-management">
    <div class="header">
      <h2>👥 用户管理</h2>
      <div class="header-actions">
        <span class="total-count">共 {{ total }} 个用户</span>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <div class="search-row">
        <input 
          v-model="searchParams.username" 
          type="text" 
          placeholder="搜索用户名..."
          @keyup.enter="searchUsers"
          class="search-input"
        />
        <input 
          v-model="searchParams.email" 
          type="text" 
          placeholder="搜索邮箱..."
          @keyup.enter="searchUsers"
          class="search-input"
        />
        
        <select v-model="searchParams.role" class="filter-select">
          <option value="">全部角色</option>
          <option value="管理员">管理员</option>
          <option value="用户">用户</option>
        </select>
        
        <select v-model="searchParams.status" class="filter-select">
          <option value="">全部状态</option>
          <option value="1">正常</option>
          <option value="0">禁用</option>
        </select>
        
        <button @click="searchUsers" class="btn-search">🔍 搜索</button>
        <button @click="resetSearch" class="btn-reset">🔄 重置</button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>头像</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>电话</th>
            <th>角色</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" :class="{ 'disabled-user': user.status === 0 }">
            <td>{{ user.id }}</td>
            <td>
              <img 
                :src="user.avatar || '/default-avatar.png'" 
                alt="头像" 
                class="user-avatar"
                @error="handleAvatarError"
              />
            </td>
            <td>{{ user.username }}</td>
            <td>{{ user.email || '-' }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>
              <span :class="['role-badge', user.role === '管理员' ? 'role-admin' : 'role-user']">
                {{ user.role }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', user.status === 1 ? 'status-active' : 'status-disabled']">
                {{ user.status === 1 ? '正常' : '禁用' }}
              </span>
            </td>
            <td>{{ formatDate(user.createTime) }}</td>
            <td class="actions">
              <button @click="viewUser(user)" class="btn-action btn-view" title="查看详情">👁️</button>
              <button @click="editUser(user)" class="btn-action btn-edit" title="编辑">✏️</button>
              <button @click="resetUserPassword(user)" class="btn-action btn-password" title="重置密码">🔑</button>
              <button 
                @click="toggleUserStatus(user)" 
                :class="['btn-action', user.status === 1 ? 'btn-disable' : 'btn-enable']"
                :title="user.status === 1 ? '禁用' : '启用'"
              >
                {{ user.status === 1 ? '🚫' : '✅' }}
              </button>
              <button @click="deleteUser(user)" class="btn-action btn-delete" title="删除">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="users.length === 0" class="no-data">
        暂无用户数据
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn-page">上一页</button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-page">下一页</button>
      
      <select v-model.number="pageSize" @change="changePageSize" class="page-size-select">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
      </select>
    </div>

    <!-- 编辑用户弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isViewMode ? '查看用户详情' : '编辑用户信息' }}</h3>
          <button @click="closeEditModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名：</label>
            <input v-model="editingUser.username" type="text" :disabled="isViewMode" />
          </div>
          <div class="form-group">
            <label>邮箱：</label>
            <input v-model="editingUser.email" type="email" :disabled="isViewMode" />
          </div>
          <div class="form-group">
            <label>电话：</label>
            <input v-model="editingUser.phone" type="text" :disabled="isViewMode" />
          </div>
          <div class="form-group">
            <label>角色：</label>
            <select v-model="editingUser.role" :disabled="isViewMode">
              <option value="用户">用户</option>
              <option value="管理员">管理员</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态：</label>
            <select v-model.number="editingUser.status" :disabled="isViewMode">
              <option :value="1">正常</option>
              <option :value="0">禁用</option>
            </select>
          </div>
        </div>
        <div class="modal-footer" v-if="!isViewMode">
          <button @click="closeEditModal" class="btn-cancel">取消</button>
          <button @click="saveUser" class="btn-save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  
  data() {
    return {
      users: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      totalPages: 0,
      
      searchParams: {
        username: '',
        email: '',
        role: '',
        status: ''
      },
      
      showEditModal: false,
      isViewMode: false,
      editingUser: {
        id: null,
        username: '',
        email: '',
        phone: '',
        role: '用户',
        status: 1
      }
    }
  },
  
  mounted() {
    this.loadUsers()
  },
  
  methods: {
    async loadUsers() {
      try {
        console.log('========== 加载用户列表 ==========')
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          ...this.searchParams
        }
        
        // 移除空参数
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null) {
            delete params[key]
          }
        })
        
        console.log('请求参数:', params)
        const response = await this.$http.get('/admin/users', { params })
        
        if (response.data.code === 200) {
          const data = response.data.data
          this.users = data.users || []
          this.total = data.total || 0
          this.totalPages = data.totalPages || 1
          this.currentPage = data.page || 1
          console.log(`加载成功，共${this.total}个用户`)
        } else {
          alert('加载用户列表失败：' + response.data.message)
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        alert('加载用户列表失败，请稍后重试')
      }
    },
    
    searchUsers() {
      this.currentPage = 1
      this.loadUsers()
    },
    
    resetSearch() {
      this.searchParams = {
        username: '',
        email: '',
        role: '',
        status: ''
      }
      this.currentPage = 1
      this.loadUsers()
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.loadUsers()
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.loadUsers()
      }
    },
    
    changePageSize() {
      this.currentPage = 1
      this.loadUsers()
    },
    
    viewUser(user) {
      this.isViewMode = true
      this.editingUser = { ...user }
      this.showEditModal = true
    },
    
    editUser(user) {
      this.isViewMode = false
      this.editingUser = { ...user }
      this.showEditModal = true
    },
    
    closeEditModal() {
      this.showEditModal = false
      this.editingUser = {
        id: null,
        username: '',
        email: '',
        phone: '',
        role: '用户',
        status: 1
      }
    },
    
    async saveUser() {
      try {
        console.log('========== 保存用户信息 ==========')
        console.log('更新数据:', this.editingUser)
        
        const response = await this.$http.put(`/admin/users/${this.editingUser.id}`, this.editingUser)
        
        if (response.data.code === 200) {
          alert('保存成功')
          this.closeEditModal()
          this.loadUsers()
        } else {
          alert('保存失败：' + response.data.message)
        }
      } catch (error) {
        console.error('保存用户失败:', error)
        alert('保存失败，请稍后重试')
      }
    },
    
    async resetUserPassword(user) {
      const newPassword = prompt(`请输入用户 ${user.username} 的新密码：`)
      if (!newPassword) return
      
      if (newPassword.length < 6) {
        alert('密码长度至少6位')
        return
      }
      
      if (!confirm(`确定要重置用户 ${user.username} 的密码吗？`)) return
      
      try {
        const response = await this.$http.put(`/admin/users/${user.id}/password`, {
          newPassword: newPassword
        })
        
        if (response.data.code === 200) {
          alert('密码重置成功')
        } else {
          alert('密码重置失败：' + response.data.message)
        }
      } catch (error) {
        console.error('重置密码失败:', error)
        alert('重置密码失败，请稍后重试')
      }
    },
    
    async toggleUserStatus(user) {
      const newStatus = user.status === 1 ? 0 : 1
      const action = newStatus === 1 ? '启用' : '禁用'
      
      if (!confirm(`确定要${action}用户 ${user.username} 吗？`)) return
      
      try {
        const response = await this.$http.put(`/admin/users/${user.id}/status`, {
          status: newStatus
        })
        
        if (response.data.code === 200) {
          alert(`${action}成功`)
          this.loadUsers()
        } else {
          alert(`${action}失败：` + response.data.message)
        }
      } catch (error) {
        console.error('更新状态失败:', error)
        alert('操作失败，请稍后重试')
      }
    },
    
    async deleteUser(user) {
      if (!confirm(`确定要删除用户 ${user.username} 吗？此操作不可恢复！`)) return
      
      try {
        const response = await this.$http.delete(`/admin/users/${user.id}`)
        
        if (response.data.code === 200) {
          alert('删除成功')
          this.loadUsers()
        } else {
          alert('删除失败：' + response.data.message)
        }
      } catch (error) {
        console.error('删除用户失败:', error)
        alert('删除失败，请稍后重试')
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    handleAvatarError(e) {
      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%23ddd" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="20"%3E👤%3C/text%3E%3C/svg%3E'
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.total-count {
  font-size: 1rem;
  color: #666;
  background: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

/* 搜索筛选区域 */
.search-filter {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.search-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #ff6b6b;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #ff6b6b;
}

.btn-search, .btn-reset {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-search {
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  color: white;
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn-reset {
  background: #f0f0f0;
  color: #666;
}

.btn-reset:hover {
  background: #e0e0e0;
}

/* 表格样式 */
.user-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-table th {
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.user-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.user-table tbody tr:hover {
  background: #f9f9f9;
}

.disabled-user {
  opacity: 0.6;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.role-badge, .status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.role-admin {
  background: #ff6b6b;
  color: white;
}

.role-user {
  background: #4ecdc4;
  color: white;
}

.status-active {
  background: #51cf66;
  color: white;
}

.status-disabled {
  background: #868e96;
  color: white;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-action:hover {
  transform: scale(1.1);
}

.btn-view {
  background: #4dabf7;
}

.btn-edit {
  background: #ffd43b;
}

.btn-password {
  background: #a78bfa;
}

.btn-disable {
  background: #ff6b6b;
}

.btn-enable {
  background: #51cf66;
}

.btn-delete {
  background: #ff8787;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1.2rem;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-page {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-page:hover:not(:disabled) {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #333;
}

.page-size-select {
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel, .btn-save {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #e0e0e0;
  color: #666;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.btn-save {
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  color: white;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}
</style>
