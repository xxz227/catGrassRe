<template>
  <div class="search-test">
    <h1>搜索功能测试页面</h1>
    
    <div class="test-section">
      <h2>全局搜索组件</h2>
      <GlobalSearch :isAdmin="false" />
    </div>
    
    <div class="test-section">
      <h2>直接API测试</h2>
      <div class="api-test">
        <input v-model="testKeyword" placeholder="输入测试关键词" />
        <button @click="testSearchAPI">测试搜索API</button>
        <button @click="testSuggestionsAPI">测试建议API</button>
      </div>
      
      <div class="api-result" v-if="apiResult">
        <h3>API响应：</h3>
        <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import GlobalSearch from '../components/GlobalSearch.vue'
import request from '../utils/request'

export default {
  name: 'SearchTest',
  components: {
    GlobalSearch
  },
  data() {
    return {
      testKeyword: '猫',
      apiResult: null
    }
  },
  methods: {
    async testSearchAPI() {
      try {
        console.log('测试搜索API，关键词:', this.testKeyword)
        const response = await request.get('/search', {
          params: {
            keyword: this.testKeyword,
            limit: 10,
            includeUsers: false
          }
        })
        console.log('搜索API响应:', response)
        this.apiResult = response.data
      } catch (error) {
        console.error('搜索API错误:', error)
        this.apiResult = { error: error.message }
      }
    },
    
    async testSuggestionsAPI() {
      try {
        console.log('测试建议API，关键词:', this.testKeyword)
        const response = await request.get('/search/suggestions', {
          params: {
            keyword: this.testKeyword
          }
        })
        console.log('建议API响应:', response)
        this.apiResult = response.data
      } catch (error) {
        console.error('建议API错误:', error)
        this.apiResult = { error: error.message }
      }
    }
  }
}
</script>

<style scoped>
.search-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #ff6b6b;
  margin-bottom: 2rem;
}

.test-section {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.api-test {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.api-test input {
  flex: 1;
  padding: 0.8rem;
  border: 2px solid #ffd54f;
  border-radius: 8px;
  font-size: 1rem;
}

.api-test button {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.api-test button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
}

.api-result {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.api-result h3 {
  margin-top: 0;
  color: #333;
}

pre {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.9rem;
}
</style>
