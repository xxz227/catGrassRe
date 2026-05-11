<template>
  <div class="product-management">
    <div class="nav-back">
      <button @click="$router.back()" class="back-button">
        ← 返回上一页
      </button>
    </div>
    <div class="page-header">
      <h1>商品信息管理</h1>
      <router-link to="/admin/products/new" class="btn-primary">添加新商品</router-link>
    </div>
    
    <div class="filters">
      <div class="search-area">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchKeyword"
            @keydown.enter="handleSearch"
            type="text"
            placeholder="搜索商品名称、描述..."
            class="search-input"
          />
          <button v-if="searchKeyword" @click="clearSearch" class="clear-btn">✕</button>
          <button @click="handleSearch" class="search-btn" :disabled="!searchKeyword.trim()">
            搜索
          </button>
        </div>
        <div v-if="isSearching" class="search-tip">
          正在搜索: "{{ currentSearchKeyword }}" 
          <button @click="clearSearch" class="clear-search-btn">清除搜索</button>
        </div>
      </div>
      
      <div class="filter-group">
        <label>商品状态:</label>
        <select v-model="filters.status">
          <option value="">全部</option>
          <option value="上架">上架</option>
          <option value="下架">下架</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>商品分类:</label>
        <select v-model="filters.category">
          <option value="">全部</option>
          <option value="猫草种子">猫草种子</option>
          <option value="猫草盆栽">猫草盆栽</option>
          <option value="自动种植盒">自动种植盒</option>
          <option value="猫咪植物玩具">猫咪植物玩具</option>
          <option value="营养土">营养土</option>
          <option value="猫草培养套装">猫草培养套装</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>种植方式:</label>
        <select v-model="filters.petType">
          <option value="">全部</option>
          <option value="水培">水培</option>
          <option value="土培">土培</option>
          <option value="自动种植">自动种植</option>
          <option value="通用">通用</option>
        </select>
      </div>
      
      <button @click="fetchProducts" class="btn-secondary">筛选</button>
    </div>
    
    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>商品名称</th>
            <th>分类</th>
            <th>种植方式</th>
            <th>价格</th>
            <th>库存</th>
            <th>销量</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td>{{ product.petType || '通用' }}</td>
            <td>¥{{ product.price }}</td>
            <td>
              <span :class="{ 'low-stock': product.stock < 10 }">{{ product.stock }}</span>
            </td>
            <td>{{ product.salesCount || 0 }}</td>
            <td>
              <span class="status-badge" :class="product.status">{{ product.status }}</span>
            </td>
            <td>
              <div class="actions">
                <router-link :to="`/admin/products/edit/${product.id}`" class="btn-small btn-edit">编辑</router-link>
                <button @click="toggleStatus(product)" class="btn-small btn-toggle">{{ product.status === '上架' ? '下架' : '上架' }}</button>
                <button @click="deleteProduct(product.id)" class="btn-small btn-delete">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination" v-if="total > 0">
      <button :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductManagement',
  data() {
    return {
      products: [],
      filters: {
        status: '',
        category: '',
        petType: ''
      },
      searchKeyword: '',
      currentSearchKeyword: '',
      isSearching: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.fetchProducts()
  },
  methods: {
    checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('isAdminLoggedIn')
      if (!isLoggedIn) {
        this.$router.push('/admin/login')
      }
    },
    
    async fetchProducts() {
      try {
        // 如果正在搜索，使用搜索接口
        if (this.isSearching && this.currentSearchKeyword) {
          await this.performSearch()
          return
        }
        
        const response = await this.$http.get('/products', {
          params: {
            status: this.filters.status || undefined,
            category: this.filters.category || undefined,
            petType: this.filters.petType || undefined,
            page: this.currentPage,
            size: this.pageSize
          }
        })
        
        console.log('获取商品列表响应:', response)
        
        if (!response || !response.data) {
          console.error('获取商品列表失败: 响应数据为空')
          this.products = []
          this.total = 0
          this.totalPages = 0
          return
        }
        
        if (response.data.code !== 200) {
          console.error('获取商品列表失败:', response.data.message)
          alert('获取商品列表失败: ' + response.data.message)
          this.products = []
          this.total = 0
          this.totalPages = 0
          return
        }
        
        const data = response.data.data || {}
        this.products = data.products || []
        this.total = data.total || 0
        this.totalPages = data.totalPages || 0
      } catch (error) {
        console.error('获取商品列表失败:', error)
        alert('获取商品列表失败，请检查网络连接')
      }
    },
    
    goToPage(page) {
      this.currentPage = page
      this.fetchProducts()
    },
    
    async performSearch() {
      try {
        console.log('执行搜索:', this.currentSearchKeyword)
        const response = await this.$http.get('/search', {
          params: {
            keyword: this.currentSearchKeyword,
            limit: 100
          }
        })
        
        if (response.data.code === 200) {
          const searchResults = response.data.data
          this.products = searchResults.products || []
          this.total = this.products.length
          this.totalPages = Math.ceil(this.total / this.pageSize)
          this.currentPage = 1
        } else {
          console.error('搜索失败:', response.data.message)
          this.products = []
          this.total = 0
          this.totalPages = 0
        }
      } catch (error) {
        console.error('搜索失败:', error)
        this.products = []
        this.total = 0
        this.totalPages = 0
      }
    },
    
    async handleSearch() {
      if (!this.searchKeyword.trim()) {
        return
      }
      
      this.currentSearchKeyword = this.searchKeyword.trim()
      this.isSearching = true
      
      // 清空筛选条件
      this.filters = {
        status: '',
        category: '',
        petType: ''
      }
      
      await this.performSearch()
    },
    
    clearSearch() {
      this.searchKeyword = ''
      this.currentSearchKeyword = ''
      this.isSearching = false
      this.fetchProducts()
    },
    
    async toggleStatus(product) {
      const newStatus = product.status === '上架' ? '下架' : '上架'
      try {
        const response = await this.$http.put(`/products/${product.id}/status`, null, {
          params: { status: newStatus }
        })
        
        if (response.data.code === 200) {
          alert(`商品已${newStatus}`)
          this.fetchProducts()
        } else {
          alert('操作失败: ' + response.data.message)
        }
      } catch (error) {
        console.error('更新商品状态失败:', error)
        alert('更新商品状态失败')
      }
    },
    
    async deleteProduct(id) {
      if (!confirm('确定要删除这个商品吗？此操作不可恢复。')) {
        return
      }
      
      try {
        const response = await this.$http.delete(`/products/${id}`)
        
        if (response.data.code === 200) {
          alert('商品删除成功')
          this.fetchProducts()
        } else {
          alert('删除失败: ' + response.data.message)
        }
      } catch (error) {
        console.error('删除商品失败:', error)
        alert('删除商品失败')
      }
    }
  }
}
</script>

<style scoped>
.product-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.nav-back {
  margin-bottom: 1.5rem;
}

.back-button {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 225, 0.95) 100%);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.15);
}

.page-header h1 {
  color: #ff6b6b;
  font-size: 2rem;
  margin: 0;
}

.btn-primary {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
  color: white;
  border: none;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 225, 0.95) 100%);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.15);
}

.search-area {
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #ffd54f;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.search-icon {
  font-size: 1.2rem;
  color: #ff6b6b;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 0.3rem;
}

.clear-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.3rem;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.clear-btn:hover {
  color: #ff6b6b;
}

.search-btn {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-tip {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  color: #ff6b6b;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.clear-search-btn {
  padding: 0.3rem 0.8rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: #ff5252;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #ff6b6b;
  white-space: nowrap;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem;
  border: 2px solid #ffd54f;
  border-radius: 8px;
  font-size: 0.9rem;
}

.btn-secondary {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #ffa726 0%, #ffd54f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 167, 38, 0.4);
}

.products-table {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.15);
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
  color: white;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.95rem;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

tbody tr:hover {
  background-color: rgba(255, 213, 79, 0.1);
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.上架 {
  background: linear-gradient(135deg, #4cd964 0%, #5ac8fa 100%);
  color: white;
}

.status-badge.下架 {
  background: linear-gradient(135deg, #8e8e93 0%, #48484a 100%);
  color: white;
}

.low-stock {
  color: #f44336;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-edit {
  background: linear-gradient(135deg, #4cd964 0%, #5ac8fa 100%);
  color: white;
}

.btn-toggle {
  background: linear-gradient(135deg, #ffa726 0%, #ffd54f 100%);
  color: white;
}

.btn-delete {
  background: linear-gradient(135deg, #f44336 0%, #ff6b6b 100%);
  color: white;
}

.btn-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.pagination button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.pagination button:disabled {
  background: linear-gradient(135deg, #bcaaa4 0%, #a1887f 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination span {
  font-weight: 700;
  color: #ff6b6b;
  font-size: 1.1rem;
}
</style>
