<template>
  <div class="global-search">
    <div class="search-box" :class="{ focused: isFocused }">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchKeyword"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.enter="handleSearch"
        @keydown.down.prevent="navigateSuggestions(1)"
        @keydown.up.prevent="navigateSuggestions(-1)"
        type="text"
        placeholder="搜索宠物、品种..."
        class="search-input"
      />
      <button v-if="searchKeyword" @click="clearSearch" class="clear-btn">✕</button>
      <button @click="handleSearch" class="search-btn" :disabled="!searchKeyword.trim()">
        搜索
      </button>
    </div>
    
    <!-- 搜索建议下拉框 -->
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
      <div class="suggestions-header">
        <span>搜索建议</span>
        <span class="result-count">共 {{ suggestions.length }} 条</span>
      </div>
      <div
        v-for="(item, index) in suggestions"
        :key="item.id"
        :class="['suggestion-item', { active: selectedIndex === index }]"
        @mousedown.prevent="selectSuggestion(item)"
        @mouseenter="selectedIndex = index"
      >
        <div class="suggestion-image">
          <img
            v-if="item.images"
            :src="getImageUrl(item.images.split(',')[0])"
            :alt="item.name"
            @error="handleImageError"
          />
          <div v-else class="no-image">🐾</div>
        </div>
        <div class="suggestion-info">
          <div class="suggestion-name">{{ item.name }}</div>
          <div class="suggestion-details">
            <span class="category">{{ item.category }}</span>
            <span class="breed">{{ item.breed }}</span>
            <span class="status" :class="item.status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 搜索结果弹窗 -->
    <div v-if="showResults" class="search-results-modal" @click.self="closeResults">
      <div class="results-container">
        <div class="results-header">
          <h2>搜索结果</h2>
          <button @click="closeResults" class="close-btn">✕</button>
        </div>
        
        <div class="results-info">
          <span>关键词: <strong>{{ searchResults.keyword }}</strong></span>
          <span>共找到 <strong>{{ searchResults.totalCount }}</strong> 条结果</span>
        </div>
        
        <!-- 宠物搜索结果 -->
        <div v-if="searchResults.pets && searchResults.pets.length > 0" class="results-section">
          <h3>🐾 宠物 ({{ searchResults.pets.length }})</h3>
          <div class="pets-grid">
            <div
              v-for="pet in searchResults.pets"
              :key="pet.id"
              class="pet-result-card"
              @click="goToPetDetail(pet.id)"
            >
              <div class="pet-image">
                <img
                  v-if="pet.images"
                  :src="getImageUrl(pet.images.split(',')[0])"
                  :alt="pet.name"
                  @error="handleImageError"
                />
                <div v-else class="no-image">🐾</div>
              </div>
              <div class="pet-info">
                <h4>{{ pet.name }}</h4>
                <p class="pet-category">{{ pet.category }} · {{ pet.breed }}</p>
                <span class="pet-status" :class="pet.status">{{ pet.status }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 用户搜索结果（仅管理员） -->
        <div v-if="searchResults.users && searchResults.users.length > 0" class="results-section">
          <h3>👤 用户 ({{ searchResults.users.length }})</h3>
          <div class="users-list">
            <div
              v-for="user in searchResults.users"
              :key="user.id"
              class="user-result-card"
            >
              <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
              <div class="user-info">
                <h4>{{ user.username }}</h4>
                <p>{{ user.email }}</p>
                <p class="user-meta">
                  <span>{{ user.role }}</span>
                  <span>{{ formatDate(user.createTime) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 无结果 -->
        <div v-if="searchResults.totalCount === 0" class="no-results">
          <div class="no-results-icon">🔍</div>
          <p>未找到相关结果</p>
          <p class="hint">请尝试其他关键词</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'GlobalSearch',
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchKeyword: '',
      isFocused: false,
      showSuggestions: false,
      showResults: false,
      suggestions: [],
      searchResults: {
        pets: [],
        users: [],
        totalCount: 0,
        keyword: ''
      },
      selectedIndex: -1,
      debounceTimer: null
    }
  },
  methods: {
    handleInput() {
      // 防抖处理
      clearTimeout(this.debounceTimer)
      
      if (this.searchKeyword.length < 2) {
        this.suggestions = []
        this.showSuggestions = false
        return
      }
      
      this.debounceTimer = setTimeout(() => {
        this.fetchSuggestions()
      }, 300)
    },
    
    async fetchSuggestions() {
      try {
        console.log('获取搜索建议:', this.searchKeyword)
        const response = await request.get('/search/suggestions', {
          params: { keyword: this.searchKeyword }
        })
        
        console.log('搜索建议响应:', response)
        
        if (response.data.code === 200) {
          this.suggestions = response.data.data || []
          this.showSuggestions = this.suggestions.length > 0 && this.isFocused
          this.selectedIndex = -1
          console.log('搜索建议结果:', this.suggestions)
        }
      } catch (error) {
        console.error('获取搜索建议失败:', error)
        this.suggestions = []
        this.showSuggestions = false
      }
    },
    
    async handleSearch() {
      if (!this.searchKeyword.trim()) {
        console.log('搜索关键词为空')
        return
      }
      
      console.log('开始搜索:', this.searchKeyword)
      
      // 关闭搜索建议
      this.showSuggestions = false
      
      try {
        const response = await request.get('/search', {
          params: {
            keyword: this.searchKeyword,
            limit: 20,
            includeUsers: this.isAdmin
          }
        })
        
        console.log('搜索响应:', response)
        
        if (response.data.code === 200) {
          this.searchResults = response.data.data
          this.showResults = true
          console.log('搜索结果:', this.searchResults)
        } else {
          console.error('搜索失败:', response.data.message)
          alert('搜索失败：' + (response.data.message || '请稍后重试'))
        }
      } catch (error) {
        console.error('搜索失败:', error)
        alert('搜索失败，请稍后重试')
      }
    },
    
    selectSuggestion(item) {
      this.goToPetDetail(item.id)
      this.clearSearch()
    },
    
    navigateSuggestions(direction) {
      if (this.suggestions.length === 0) return
      
      this.selectedIndex += direction
      
      if (this.selectedIndex < 0) {
        this.selectedIndex = this.suggestions.length - 1
      } else if (this.selectedIndex >= this.suggestions.length) {
        this.selectedIndex = 0
      }
      
      // 按回车选中
      if (direction === 0 && this.selectedIndex >= 0) {
        this.selectSuggestion(this.suggestions[this.selectedIndex])
      }
    },
    
    handleFocus() {
      this.isFocused = true
      if (this.searchKeyword.length >= 2) {
        this.showSuggestions = this.suggestions.length > 0
      }
    },
    
    handleBlur() {
      this.isFocused = false
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },
    
    clearSearch() {
      this.searchKeyword = ''
      this.suggestions = []
      this.showSuggestions = false
      this.selectedIndex = -1
    },
    
    closeResults() {
      this.showResults = false
    },
    
    goToPetDetail(petId) {
      this.$router.push(`/pet/${petId}`)
      this.closeResults()
    },
    
    handleImageError(e) {
      e.target.style.display = 'none'
      e.target.parentElement.innerHTML = '<div class="no-image">🐾</div>'
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    
    getImageUrl(url) {
      if (!url) {
        // 返回占位图
        return 'https://via.placeholder.com/300x200?text=商品图片'
      }
      // 如果是完整URL，直接返回
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      // 否则使用后端服务器地址
      return `http://localhost:8080${url}`
    }
  }
}
</script>

<style scoped>
.global-search {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 213, 79, 0.5);
  border-radius: 25px;
  padding: 0.6rem 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.1);
}

.search-box.focused {
  border-color: #ff6b6b;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
  transform: translateY(-2px);
}

.search-icon {
  font-size: 1.2rem;
  margin-right: 0.8rem;
  color: #ff6b6b;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.95rem;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  margin-left: 0.5rem;
  transition: color 0.3s ease;
}

.clear-btn:hover {
  color: #ff6b6b;
}

.search-btn {
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  margin-left: 0.8rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 搜索建议下拉框 */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  color: #ff6b6b;
}

.result-count {
  font-size: 0.85rem;
  color: #999;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  border-bottom: 1px solid #f5f5f5;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.05), rgba(255, 213, 79, 0.05));
}

.suggestion-image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
}

.suggestion-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff9c4, #f8bbd0);
  font-size: 1.5rem;
}

.suggestion-info {
  flex: 1;
  min-width: 0;
}

.suggestion-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-details {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.category,
.breed {
  padding: 0.2rem 0.5rem;
  background: #f0f0f0;
  border-radius: 8px;
}

.status {
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.status.待领养 {
  background: #d4edda;
  color: #155724;
}

.status.已被申请 {
  background: #fff3cd;
  color: #856404;
}

/* 搜索结果弹窗 */
.search-results-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.results-container {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  border-radius: 20px 20px 0 0;
}

.results-header h2 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.results-info {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #f8f9fa;
  font-size: 0.9rem;
  color: #666;
}

.results-info strong {
  color: #ff6b6b;
}

.results-section {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.results-section:last-child {
  border-bottom: none;
}

.results-section h3 {
  margin: 0 0 1rem 0;
  color: #ff6b6b;
  font-size: 1.2rem;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.pet-result-card {
  background: linear-gradient(135deg, rgba(255, 249, 196, 0.3), rgba(248, 187, 208, 0.3));
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.1);
}

.pet-result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

.pet-image {
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.pet-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-info {
  padding: 1rem;
}

.pet-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.pet-category {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.pet-status {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.pet-status.待领养 {
  background: #d4edda;
  color: #155724;
}

.pet-status.已被申请 {
  background: #fff3cd;
  color: #856404;
}

.users-list {
  display: grid;
  gap: 1rem;
}

.user-result-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 249, 196, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-result-card:hover {
  background: rgba(255, 249, 196, 0.4);
  transform: translateX(5px);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin-right: 1rem;
}

.user-info h4 {
  margin: 0 0 0.3rem 0;
  color: #333;
}

.user-info p {
  margin: 0.2rem 0;
  color: #666;
  font-size: 0.9rem;
}

.user-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem !important;
}

.no-results {
  text-align: center;
  padding: 3rem 2rem;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results p {
  margin: 0.5rem 0;
  color: #666;
}

.hint {
  font-size: 0.9rem;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-search {
    max-width: 100%;
  }
  
  .results-container {
    width: 95%;
    max-height: 90vh;
  }
  
  .pets-grid {
    grid-template-columns: 1fr;
  }
  
  .results-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
