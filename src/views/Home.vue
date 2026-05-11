<template>
  <div class="home">
    <div class="filters">
      <!-- 搜索框区域 -->
      <div class="search-area">
        <div class="search-box" :class="{ focused: isSearchFocused }">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchKeyword"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
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
      
      <!-- 筛选条件区域 -->
      <div class="filter-area">
        <div class="filter-group">
          <label>商品分类:</label>
          <select v-model="filters.category" @change="fetchProducts">
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
          <select v-model="filters.petType" @change="fetchProducts">
            <option value="">全部</option>
            <option value="水培">水培</option>
            <option value="土培">土培</option>
            <option value="自动种植">自动种植</option>
            <option value="通用">通用</option>
          </select>
        </div>
        <div class="filter-group">
          <label>商品状态:</label>
          <select v-model="filters.status" @change="fetchProducts">
            <option value="">全部</option>
            <option value="上架">上架</option>
            <option value="下架">下架</option>
          </select>
        </div>
        <div class="filter-group">
          <label>排序:</label>
          <select v-model="filters.orderBy" @change="fetchProducts">
            <option value="">默认排序</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
            <option value="sales">销量优先</option>
            <option value="new">最新上架</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="products-grid" v-if="products && products.length > 0">
      <div class="product-card" v-for="product in products" :key="product.id" @click="viewProductDetails(product.id)">
        <div class="product-image">
          <img v-if="product.images && product.images.split(',')[0]" :src="getImageUrl(product.images.split(',')[0])" :alt="product.name">
          <div v-else class="no-image">暂无图片</div>
        </div>
        <div class="product-info">
          <h3>{{ product.name || '未命名' }}</h3>
          <p class="product-category">{{ (product.category || '未知分类') }} | {{ (product.petType || '通用') }}</p>
          <p class="product-price">¥{{ product.price || '0.00' }}</p>
          <p class="product-stock">库存: {{ product.stock || 0 }}</p>
          <p class="product-status" :class="product.status || '上架'">{{ product.status || '上架' }}</p>
        </div>
      </div>
    </div>
    
    <div class="pagination" v-if="total > 0">
      <button :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
    </div>
    
    <div class="no-products" v-else>
      <p>暂无符合条件的商品信息</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      products: [],
      filters: {
        category: '',
        status: '',
        petType: '',
        orderBy: ''
      },
      searchKeyword: '',
      currentSearchKeyword: '',
      isSearching: false,
      isSearchFocused: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
  },
  mounted() {
    console.log('Home组件挂载完成，开始获取商品列表')
    this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      try {
        // 如果正在搜索，使用搜索接口
        if (this.isSearching && this.currentSearchKeyword) {
          await this.performSearch()
          return
        }
        
        // 否则使用正常的筛选接口
        const response = await this.$http.get('/products', {
          params: {
            category: this.filters.category || undefined,
            status: this.filters.status || undefined,
            petType: this.filters.petType || undefined,
            orderBy: this.filters.orderBy || undefined,
            page: this.currentPage,
            size: this.pageSize
          }
        })
        
        console.log('获取商品列表响应:', response)
        
        const data = response.data?.data
        console.log('响应数据:', data)
        
        // 确保数据存在并正确赋值
        this.products = (data && data.products) || []
        this.total = (data && data.total) || 0
        this.totalPages = (data && data.totalPages) || 0
        console.log('设置后的数据:', { products: this.products, total: this.total, totalPages: this.totalPages })
      } catch (error) {
        console.error('获取商品列表失败:', error)
      }
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
        
        console.log('搜索响应:', response)
        
        if (response.data.code === 200) {
          const searchResults = response.data.data
          this.products = searchResults.products || []
          this.total = this.products.length
          this.totalPages = Math.ceil(this.total / this.pageSize)
          this.currentPage = 1
          console.log('搜索结果:', this.products)
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
        category: '',
        status: '',
        petType: '',
        orderBy: ''
      }
      
      await this.performSearch()
    },
    
    clearSearch() {
      this.searchKeyword = ''
      this.currentSearchKeyword = ''
      this.isSearching = false
      this.fetchProducts()
    },
    
    goToPage(page) {
      this.currentPage = page
      this.fetchProducts()
    },
    
    viewProductDetails(id) {
      this.$router.push(`/product/${id}`)
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
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

.home::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 10% 20%, rgba(200, 230, 201, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(165, 214, 167, 0.2) 0%, transparent 50%);
  z-index: -1;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 248, 233, 0.95) 100%);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(139, 195, 74, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.filters::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #8bc34a, #a5d6a7, #c8e6c9);
}

.search-area {
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(165, 214, 167, 0.5);
  border-radius: 25px;
  padding: 0.6rem 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.1);
}

.search-box.focused {
  border-color: #8bc34a;
  box-shadow: 0 6px 20px rgba(139, 195, 74, 0.3);
  transform: translateY(-2px);
}

.search-icon {
  font-size: 1.2rem;
  margin-right: 0.8rem;
  color: #8bc34a;
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
  color: #8bc34a;
}

.search-btn {
  background: linear-gradient(135deg, #8bc34a, #c8e6c9);
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  margin-left: 0.8rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(139, 195, 74, 0.3);
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 195, 74, 0.5);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.search-tip {
  margin-top: 0.8rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, rgba(139, 195, 74, 0.1), rgba(200, 230, 201, 0.1));
  border-radius: 15px;
  font-size: 0.9rem;
  color: #8bc34a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.clear-search-btn {
  background: linear-gradient(135deg, #8bc34a, #c8e6c9);
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(139, 195, 74, 0.3);
}

.clear-search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 195, 74, 0.5);
}

.filter-area {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #8bc34a;
  font-size: 0.85rem;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(139, 195, 74, 0.2);
}

.filter-group select {
  padding: 0.75rem 1rem;
  border: 2px solid #c8e6c9;
  border-radius: 10px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.4s ease;
  width: 100%;
  color: #2e7d32;
  box-shadow: 0 4px 15px rgba(200, 230, 201, 0.2);
}

.filter-group select:focus {
  outline: none;
  border-color: #8bc34a;
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2);
  background: white;
  transform: translateY(-2px);
}

.filter-group select option {
  background: white;
  color: #2e7d32;
  padding: 0.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2.5rem;
  margin-bottom: 3rem;
}

.product-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 248, 233, 0.95) 100%);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 8px 32px rgba(139, 195, 74, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  backdrop-filter: blur(10px);
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #8bc34a, #a5d6a7, #c8e6c9);
  z-index: 1;
}

.product-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 16px 50px rgba(139, 195, 74, 0.25);
}

.product-image {
  height: 240px;
  overflow: hidden;
  position: relative;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #8bc34a 0%, #a5d6a7 100%);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.product-info {
  padding: 1.8rem;
}

.product-info h3 {
  margin: 0 0 0.9rem 0;
  color: #2e7d32;
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(139, 195, 74, 0.2);
}

.product-category {
  color: #8bc34a;
  margin: 0.6rem 0;
  font-size: 1rem;
  font-weight: 500;
}

.product-price {
  color: #f44336;
  margin: 0.6rem 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.product-stock {
  color: #757575;
  margin: 0.6rem 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.product-status {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.product-status.上架 {
  background: linear-gradient(135deg, #4cd964 0%, #5ac8fa 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.product-status.下架 {
  background: linear-gradient(135deg, #8e8e93 0%, #48484a 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
}

.pagination button {
  padding: 0.9rem 1.8rem;
  background: linear-gradient(135deg, #8bc34a 0%, #a5d6a7 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.4s ease;
  box-shadow: 0 6px 20px rgba(139, 195, 74, 0.3);
  position: relative;
  overflow: hidden;
}

.pagination button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.pagination button:hover:not(:disabled)::before {
  left: 100%;
}

.pagination button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(139, 195, 74, 0.4);
}

.pagination button:disabled {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination span {
  font-weight: 700;
  color: #8bc34a;
  font-size: 1.1rem;
  text-shadow: 0 1px 2px rgba(139, 195, 74, 0.2);
}

.no-products {
  text-align: center;
  padding: 5rem 2rem;
  color: #a5d6a7;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 248, 233, 0.95) 100%);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(139, 195, 74, 0.15);
  margin: 2rem 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.no-products p {
  font-size: 1.3rem;
  margin: 0;
  font-weight: 600;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }
  
  .filters {
    padding: 1.5rem;
  }
  
  .filter-area {
    grid-template-columns: 1fr;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .pagination {
    gap: 1.5rem;
  }
  
  .pagination button {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>