<template>
  <div class="product-detail" v-if="product">
    <div class="nav-back">
      <button @click="$router.back()" class="back-button">
        ← 返回上一页
      </button>
    </div>
    <div class="product-header">
      <h1>{{ product.name }}</h1>
      <span class="product-status" :class="product.status">{{ product.status }}</span>
    </div>
    
    <div class="product-gallery">
      <div class="main-image" v-if="currentImage">
        <img :src="currentImage" :alt="product.name">
      </div>
      <div class="thumbnails" v-if="images.length > 1">
        <div 
          v-for="(image, index) in images" 
          :key="index" 
          class="thumbnail" 
          :class="{ active: currentImage === image }"
          @click="currentImage = image"
        >
          <img :src="image" :alt="`图片${index + 1}`">
        </div>
      </div>
      <div class="no-images" v-if="images.length === 0">
        <p>暂无图片</p>
      </div>
    </div>
    
    <div class="product-info">
      <div class="info-group">
        <h3>商品信息</h3>
        <p><strong>商品分类:</strong> {{ product.category }}</p>
        <p><strong>种植方式:</strong> {{ product.petType || '通用' }}</p>
        <p><strong>价格:</strong> <span class="price">¥{{ product.price }}</span></p>
        <p><strong>库存:</strong> {{ product.stock }}</p>
        <p><strong>销量:</strong> {{ product.salesCount || 0 }}</p>
        <p><strong>浏览量:</strong> {{ product.viewCount || 0 }}</p>
      </div>
      
      <div class="info-group">
        <h3>商品描述</h3>
        <p>{{ product.description || '暂无描述' }}</p>
      </div>
      
      <div class="info-group">
        <h3>购买操作</h3>
        <div class="purchase-actions">
          <div class="quantity-selector">
            <label>购买数量:</label>
            <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
            <input type="number" v-model.number="quantity" min="1" :max="product.stock">
            <button @click="increaseQuantity" :disabled="quantity >= product.stock">+</button>
          </div>
          <button 
            class="buy-button" 
            :disabled="product.status !== '上架' || product.stock === 0 || !isUserLoggedIn" 
            @click="handleBuyNow"
          >
            {{ getBuyButtonText() }}
          </button>
          <button 
            class="cart-button" 
            :disabled="product.status !== '上架' || product.stock === 0 || !isUserLoggedIn" 
            @click="handleAddToCart"
          >
            加入购物车
          </button>
          <p class="login-hint" v-if="!isUserLoggedIn">请先登录才能购买</p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="loading" v-else>
    <p>加载中...</p>
  </div>
</template>

<script>
export default {
  name: 'ProductDetail',
  props: ['id'],
  data() {
    return {
      product: null,
      currentImage: '',
      images: [],
      quantity: 1,
      isUserLoggedIn: false,
      currentUser: null
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.fetchProductDetail()
  },
  
  methods: {
    checkLoginStatus() {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        this.isUserLoggedIn = true
        this.currentUser = JSON.parse(userInfo)
      }
    },
    
    async fetchProductDetail() {
      try {
        const response = await this.$http.get(`/products/${this.id}`)
        console.log('商品详情响应:', response)
        
        if (response.data.code === 200) {
          this.product = response.data.data
          
          // 处理图片
          if (this.product.images) {
            this.images = this.product.images.split(',').filter(img => img.trim())
            if (this.images.length > 0) {
              this.currentImage = this.images[0]
            }
          }
        } else {
          console.error('获取商品详情失败:', response.data.message)
          this.$router.push('/')
        }
      } catch (error) {
        console.error('获取商品详情失败:', error)
        this.$router.push('/')
      }
    },
    
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    
    increaseQuantity() {
      if (this.quantity < this.product.stock) {
        this.quantity++
      }
    },
    
    getBuyButtonText() {
      if (!this.isUserLoggedIn) return '请先登录'
      if (this.product.status !== '上架') return '商品已下架'
      if (this.product.stock === 0) return '商品已售罄'
      return '立即购买'
    },
    
    handleBuyNow() {
      if (!this.isUserLoggedIn) {
        this.$router.push('/login')
        return
      }
      
      // TODO: 实现购买逻辑
      alert(`购买商品: ${this.product.name}, 数量: ${this.quantity}`)
    },
    
    handleAddToCart() {
      if (!this.isUserLoggedIn) {
        this.$router.push('/login')
        return
      }
      
      // 调用后端API加入购物车
      this.$http.post('/cart/add', {
        productId: this.product.id,
        quantity: this.quantity
      }).then(response => {
        if (response.data.code === 200) {
          alert(`已将 ${this.quantity} 件商品加入购物车`)
          this.quantity = 1 // 重置数量
        } else {
          alert('加入购物车失败：' + response.data.message)
        }
      }).catch(error => {
        console.error('加入购物车失败:', error)
        alert('加入购物车失败：' + (error.response?.data?.message || error.message))
      })
    }
  }
}
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.nav-back {
  margin-bottom: 1.5rem;
}

.back-button {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #8bc34a 0%, #a5d6a7 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.3);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 195, 74, 0.4);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 248, 233, 0.95) 100%);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(139, 195, 74, 0.15);
}

.product-header h1 {
  color: #2e7d32;
  font-size: 2rem;
  margin: 0;
}

.product-status {
  padding: 0.6rem 1.5rem;
  border-radius: 25px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.product-status.上架 {
  background: linear-gradient(135deg, #4cd964 0%, #5ac8fa 100%);
  color: white;
}

.product-status.下架 {
  background: linear-gradient(135deg, #8e8e93 0%, #48484a 100%);
  color: white;
}

.product-gallery {
  margin-bottom: 2rem;
}

.main-image {
  width: 100%;
  max-height: 500px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(139, 195, 74, 0.15);
  margin-bottom: 1rem;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnails {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail.active {
  border-color: #8bc34a;
  box-shadow: 0 4px 12px rgba(139, 195, 74, 0.3);
}

.thumbnail:hover {
  transform: scale(1.05);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-images {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 248, 233, 0.95) 100%);
  border-radius: 15px;
  color: #a5d6a7;
  font-weight: 600;
}

.product-info {
  display: grid;
  gap: 2rem;
}

.info-group {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 248, 233, 0.95) 100%);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(139, 195, 74, 0.15);
}

.info-group h3 {
  color: #2e7d32;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #c8e6c9;
  padding-bottom: 0.5rem;
}

.info-group p {
  margin: 1rem 0;
  line-height: 1.8;
  color: #2e7d32;
  font-size: 1.1rem;
}

.info-group strong {
  color: #8bc34a;
  font-weight: 700;
}

.price {
  color: #f44336;
  font-size: 1.5rem;
  font-weight: 700;
}

.purchase-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-selector label {
  font-weight: 600;
  color: #8bc34a;
}

.quantity-selector button {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #8bc34a 0%, #a5d6a7 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.quantity-selector button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 195, 74, 0.3);
}

.quantity-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 80px;
  height: 40px;
  text-align: center;
  border: 2px solid #c8e6c9;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
}

.buy-button,
.cart-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(139, 195, 74, 0.3);
}

.buy-button {
  background: linear-gradient(135deg, #8bc34a 0%, #a5d6a7 100%);
  color: white;
}

.cart-button {
  background: linear-gradient(135deg, #a5d6a7 0%, #c8e6c9 100%);
  color: white;
}

.buy-button:hover:not(:disabled),
.cart-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(139, 195, 74, 0.4);
}

.buy-button:disabled,
.cart-button:disabled {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-hint {
  color: #8bc34a;
  font-weight: 600;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 5rem 2rem;
  color: #a5d6a7;
  font-size: 1.5rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .product-detail {
    padding: 1rem;
  }
  
  .product-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .product-header h1 {
    font-size: 1.5rem;
  }
  
  .quantity-selector {
    flex-wrap: wrap;
  }
}
</style>
