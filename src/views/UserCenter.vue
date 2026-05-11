<template>
  <div class="user-center">
    <div class="nav-back">
      <button @click="$router.push('/')" class="back-button">
        ← 返回首页
      </button>
    </div>
    <div class="page-header">
      <h1>个人中心</h1>
    </div>
    
    <!-- 标签页导航 -->
    <div class="tabs">
      <div 
        :class="['tab-item', { active: activeTab === 'info' }]"
        @click="activeTab = 'info'"
      >
        基本信息
      </div>
      <div 
        :class="['tab-item', { active: activeTab === 'cart' }]"
        @click="switchToCart"
      >
        购物车
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </div>
      <div 
        :class="['tab-item', { active: activeTab === 'orders' }]"
        @click="switchToOrders"
      >
        我的订单
      </div>
    </div>

    <!-- 基本信息标签页 -->
    <div v-show="activeTab === 'info'" class="tab-content">
      <div class="info-card">
        <h2>基本信息</h2>
        <div class="info-item">
          <label>用户名：</label>
          <span>{{ userInfo.username || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>邮箱：</label>
          <span>{{ userInfo.email || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>手机号：</label>
          <span>{{ userInfo.phone || '未设置' }}</span>
        </div>
        <div class="info-item">
          <label>注册时间：</label>
          <span>{{ formatDate(userInfo.registerTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 购物车标签页 -->
    <div v-show="activeTab === 'cart'" class="tab-content">
      <div class="cart-container">
        <div v-if="cartList.length === 0" class="empty-cart">
          <p>🛒 购物车还是空的</p>
          <button @click="$router.push('/')" class="btn-primary">去逛逛</button>
        </div>
        <div v-else>
          <div class="cart-header">
            <h2>购物车 ({{ cartList.length }}件商品)</h2>
            <button @click="clearCart" class="btn-danger">清空购物车</button>
          </div>
          <div class="cart-list">
            <div v-for="item in cartList" :key="item.id" class="cart-item">
              <input 
                type="checkbox" 
                v-model="item.selected"
                @change="updateSelected(item)"
                class="item-checkbox"
              >
              <img :src="getImageUrl(item.product.images)" :alt="item.product.name" class="item-image">
              <div class="item-info">
                <h3>{{ item.product.name }}</h3>
                <p class="item-desc">{{ item.product.description }}</p>
                <p class="item-price">¥{{ item.product.price }}</p>
              </div>
              <div class="item-quantity">
                <button @click="decreaseQuantity(item)" class="qty-btn">-</button>
                <input 
                  type="number" 
                  v-model.number="item.quantity" 
                  @change="updateQuantity(item)"
                  min="1"
                  class="qty-input"
                >
                <button @click="increaseQuantity(item)" class="qty-btn">+</button>
              </div>
              <div class="item-total">
                <p class="total-price">¥{{ (item.product.price * item.quantity).toFixed(2) }}</p>
                <button @click="removeItem(item.id)" class="btn-remove">删除</button>
              </div>
            </div>
          </div>
          <div class="cart-summary">
            <div class="summary-info">
              <span>已选 {{ selectedCount }} 件商品</span>
              <span class="total-amount">总计：¥{{ totalAmount }}</span>
            </div>
            <button @click="checkout" class="btn-checkout" :disabled="selectedCount === 0">
              结算
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的订单标签页 -->
    <div v-show="activeTab === 'orders'" class="tab-content">
      <div class="orders-container">
        <div v-if="orderList.length === 0" class="empty-orders">
          <p>📦 还没有订单</p>
          <button @click="$router.push('/')" class="btn-primary">去购物</button>
        </div>
        <div v-else>
          <div class="order-list">
            <div v-for="order in orderList" :key="order.id" class="order-item">
              <div class="order-header">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span :class="['order-status', getStatusClass(order.orderStatus)]">{{ order.orderStatus }}</span>
              </div>
              <div class="order-products">
                <div v-for="item in order.orderItems" :key="item.id" class="order-product">
                  <img :src="getImageUrl(item.productImage)" :alt="item.productName" class="product-img">
                  <div class="product-info">
                    <h4>{{ item.productName }}</h4>
                    <p>¥{{ item.price }} × {{ item.quantity }}</p>
                  </div>
                </div>
              </div>
              <div class="order-footer">
                <div class="order-info">
                  <p>收货人：{{ order.receiverName }} {{ order.receiverPhone }}</p>
                  <p>收货地址：{{ order.receiverAddress }}</p>
                  <p>下单时间：{{ formatDate(order.createTime) }}</p>
                </div>
                <div class="order-actions">
                  <div class="order-total">合计：¥{{ order.totalAmount }}</div>
                  <button v-if="order.orderStatus === '待付款'" @click="payOrder(order.id)" class="btn-primary">去支付</button>
                  <button v-if="order.orderStatus === '待付款' || order.orderStatus === '待发货'" 
                    @click="cancelOrder(order.id)" class="btn-secondary">取消订单</button>
                  <button v-if="order.orderStatus === '待发货'" @click="confirmReceipt(order.id)" class="btn-primary">确认收货</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单确认弹窗 -->
    <div v-if="showCheckoutModal" class="modal-overlay" @click="showCheckoutModal = false">
      <div class="modal-content" @click.stop>
        <h2>确认订单</h2>
        <div class="checkout-form">
          <div class="form-group">
            <label>收货人姓名：</label>
            <input v-model="checkoutForm.receiverName" type="text" placeholder="请输入收货人姓名">
          </div>
          <div class="form-group">
            <label>手机号：</label>
            <input v-model="checkoutForm.receiverPhone" type="text" placeholder="请输入手机号">
          </div>
          <div class="form-group">
            <label>收货地址：</label>
            <textarea v-model="checkoutForm.receiverAddress" placeholder="请输入详细地址"></textarea>
          </div>
          <div class="form-group">
            <label>备注：</label>
            <textarea v-model="checkoutForm.remark" placeholder="选填"></textarea>
          </div>
          <div class="checkout-summary">
            <p>商品总额：¥{{ totalAmount }}</p>
          </div>
          <div class="modal-actions">
            <button @click="showCheckoutModal = false" class="btn-secondary">取消</button>
            <button @click="submitOrder" class="btn-primary">提交订单</button>
          </div>
        </div>
      </div>
    </div>
    

  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  data() {
    return {
      activeTab: 'info', // 当前标签页
      userInfo: {
        username: '',
        email: '',
        phone: '',
        registerTime: ''
      },
      cartList: [], // 购物车列表
      cartCount: 0, // 购物车数量
      orderList: [], // 订单列表
      showCheckoutModal: false, // 是否显示结算弹窗
      checkoutForm: {
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        remark: ''
      }
    }
  },

  mounted() {
    console.log('=== UserCenter组件挂载开始 ===')
    console.log('初始 userInfo:', JSON.stringify(this.userInfo))
    console.log('初始 allApplications:', this.allApplications)
    
    this.checkLoginStatus()
    this.loadUserInfo()
    
    console.log('=== UserCenter组件挂载完成 ===')
  },
  
  computed: {
    // 选中的商品数量
    selectedCount() {
      return this.cartList.filter(item => item.selected).length
    },
    // 总金额
    totalAmount() {
      return this.cartList
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        .toFixed(2)
    }
  },
  methods: {
    checkLoginStatus() {
      const userData = localStorage.getItem('userInfo')
      console.log('检查登录状态，localStorage中的用户数据:', userData)
      if (!userData) {
        this.$router.push('/login')
      }
    },
    
    async loadUserInfo() {
      try {
        const storedUserData = localStorage.getItem('userInfo')
        console.log('获取用户信息，localStorage中的用户数据:', storedUserData)
        if (!storedUserData) {
          console.error('用户未登录')
          this.$router.push('/login')
          return
        }
        
        let userInfo
        try {
          userInfo = JSON.parse(storedUserData)
          console.log('解析后的用户信息:', userInfo)
        } catch (parseError) {
          console.error('解析用户信息失败:', parseError)
          this.$router.push('/login')
          return
        }
        
        if (!userInfo || !userInfo.id) {
          console.error('用户ID不存在')
          this.$router.push('/login')
          return
        }
        
        // 先使用localStorage中的数据渲染界面
        this.userInfo = {
          id: userInfo.id || '',
          username: userInfo.username || '',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          registerTime: userInfo.createTime || userInfo.registerTime || new Date().toISOString()
        }
        console.log('使用localStorage数据渲染:', this.userInfo)
        
        // TODO: 如果需要从后端获取最新用户信息，可以实现/users/info/{id}接口
        // const response = await this.$http.get(`/users/info/${userInfo.id}`)
      } catch (error) {
        console.error('获取用户信息异常:', error)
        console.error('获取用户信息失败:', error.message || error)
        // 如果发生错误，使用localStorage中的信息
        const localStorageUserData = localStorage.getItem('userInfo')
        if (localStorageUserData) {
          try {
            const userInfo = JSON.parse(localStorageUserData)
            this.userInfo = {
              id: userInfo.id || '',
              username: userInfo.username || '',
              email: userInfo.email || '',
              phone: userInfo.phone || '',
              registerTime: userInfo.registerTime || new Date().toISOString()
            }
            console.log('使用localStorage备用数据:', this.userInfo)
          } catch (parseError) {
            console.error('解析本地用户信息失败:', parseError)
          }
        }
      }
    },
    
    
    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        // 处理各种可能的日期格式
        let date
        if (typeof dateString === 'string') {
          // 如果是ISO格式字符串，直接解析
          date = new Date(dateString)
        } else if (dateString instanceof Date) {
          date = dateString
        } else if (Array.isArray(dateString)) {
          // 处理LocalDateTime数组格式 [year, month, day, hour, minute, second]
          const [year, month, day, hour = 0, minute = 0, second = 0] = dateString
          date = new Date(year, month - 1, day, hour, minute, second)
        } else {
          return '-'
        }
        
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          console.warn('无效的日期格式:', dateString)
          return '-'
        }
        
        // 格式化为中文日期时间
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        
        return `${year}-${month}-${day} ${hours}:${minutes}`
      } catch (error) {
        console.error('日期格式化错误:', error, '原始值:', dateString)
        return '-'
      }
    },
    
    // 图片URL处理
    getImageUrl(url) {
      if (!url) {
        return 'https://via.placeholder.com/300x200?text=商品图片'
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url.split(',')[0]
      }
      return `http://localhost:8080${url.split(',')[0]}`
    },
    
    // 切换到购物车标签页
    async switchToCart() {
      this.activeTab = 'cart'
      await this.loadCart()
    },
    
    // 切换到订单标签页
    async switchToOrders() {
      this.activeTab = 'orders'
      await this.loadOrders()
    },
    
    // 加载购物车
    async loadCart() {
      try {
        const response = await this.$http.get('/cart/list')
        if (response.data.code === 200) {
          this.cartList = response.data.data.cartList || []
          this.cartCount = response.data.data.count || 0
        }
      } catch (error) {
        console.error('加载购物车失败:', error)
      }
    },
    
    // 更新选中状态
    async updateSelected(item) {
      try {
        await this.$http.put('/cart/select', {
          cartId: item.id,
          selected: item.selected
        })
      } catch (error) {
        console.error('更新选中状态失败:', error)
        item.selected = !item.selected
      }
    },
    
    // 更新数量
    async updateQuantity(item) {
      if (item.quantity < 1) {
        item.quantity = 1
        return
      }
      try {
        await this.$http.put('/cart/update', {
          cartId: item.id,
          quantity: item.quantity
        })
      } catch (error) {
        console.error('更新数量失败:', error)
        await this.loadCart()
      }
    },
    
    // 增加数量
    async increaseQuantity(item) {
      item.quantity++
      await this.updateQuantity(item)
    },
    
    // 减少数量
    async decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--
        await this.updateQuantity(item)
      }
    },
    
    // 删除商品
    async removeItem(cartId) {
      if (!confirm('确认删除该商品？')) return
      try {
        const response = await this.$http.delete(`/cart/remove/${cartId}`)
        if (response.data.code === 200) {
          await this.loadCart()
        }
      } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败：' + error.message)
      }
    },
    
    // 清空购物车
    async clearCart() {
      if (!confirm('确认清空购物车？')) return
      try {
        const response = await this.$http.delete('/cart/clear')
        if (response.data.code === 200) {
          this.cartList = []
          this.cartCount = 0
        }
      } catch (error) {
        console.error('清空失败:', error)
        alert('清空失败：' + error.message)
      }
    },
    
    // 结算
    checkout() {
      if (this.selectedCount === 0) {
        alert('请选择要结算的商品')
        return
      }
      // 预填用户信息
      this.checkoutForm.receiverName = this.userInfo.username || ''
      this.checkoutForm.receiverPhone = this.userInfo.phone || ''
      this.showCheckoutModal = true
    },
    
    // 提交订单
    async submitOrder() {
      // 验证表单
      if (!this.checkoutForm.receiverName.trim()) {
        alert('请填写收货人姓名')
        return
      }
      if (!this.checkoutForm.receiverPhone.trim()) {
        alert('请填写手机号')
        return
      }
      if (!this.checkoutForm.receiverAddress.trim()) {
        alert('请填写收货地址')
        return
      }
      
      try {
        const response = await this.$http.post('/orders/create', this.checkoutForm)
        if (response.data.code === 200) {
          alert('订单创建成功！')
          this.showCheckoutModal = false
          // 清空表单
          this.checkoutForm = {
            receiverName: '',
            receiverPhone: '',
            receiverAddress: '',
            remark: ''
          }
          // 刷新购物车
          await this.loadCart()
          // 跳转到订单页
          this.activeTab = 'orders'
          await this.loadOrders()
        }
      } catch (error) {
        console.error('创建订单失败:', error)
        alert('创建订单失败：' + (error.response?.data?.message || error.message))
      }
    },
    
    // 加载订单列表
    async loadOrders() {
      try {
        const response = await this.$http.get('/orders/all')
        if (response.data.code === 200) {
          this.orderList = response.data.data || []
        }
      } catch (error) {
        console.error('加载订单失败:', error)
      }
    },
    
    // 支付订单
    async payOrder(orderId) {
      if (!confirm('确认支付该订单？')) return
      try {
        const response = await this.$http.post(`/orders/${orderId}/pay`)
        if (response.data.code === 200) {
          alert('支付成功！')
          await this.loadOrders()
        }
      } catch (error) {
        console.error('支付失败:', error)
        alert('支付失败：' + (error.response?.data?.message || error.message))
      }
    },
    
    // 取消订单
    async cancelOrder(orderId) {
      if (!confirm('确认取消该订单？')) return
      try {
        const response = await this.$http.post(`/orders/${orderId}/cancel`)
        if (response.data.code === 200) {
          alert('订单已取消')
          await this.loadOrders()
        }
      } catch (error) {
        console.error('取消失败:', error)
        alert('取消失败：' + (error.response?.data?.message || error.message))
      }
    },
    
    // 确认收货
    async confirmReceipt(orderId) {
      if (!confirm('确认收货？')) return
      try {
        const response = await this.$http.post(`/orders/${orderId}/confirm`)
        if (response.data.code === 200) {
          alert('确认收货成功！')
          await this.loadOrders()
        }
      } catch (error) {
        console.error('确认收货失败:', error)
        alert('操作失败：' + (error.response?.data?.message || error.message))
      }
    },
    
    // 获取订单状态样式类
    getStatusClass(status) {
      const statusMap = {
        '待付款': 'status-pending',
        '待发货': 'status-paid',
        '已完成': 'status-completed',
        '已取消': 'status-cancelled'
      }
      return statusMap[status] || ''
    }
  }
}
</script>

<style scoped>
.user-center {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.nav-back {
  margin-bottom: 20px;
}

.back-button {
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.page-header h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 600;
}

.user-info {
  margin-bottom: 3rem;
}

.info-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-card h2 {
  margin-bottom: 1.5rem;
  color: #343a40;
  border-bottom: 2px solid #ff6b6b;
  padding-bottom: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 600;
  color: #495057;
}

.info-item span {
  color: #212529;
  font-weight: 500;
}

/* 标签页样式 */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.tab-item {
  padding: 1rem 2rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 600;
  color: #6c757d;
  position: relative;
}

.tab-item:hover {
  color: #ff6b6b;
}

.tab-item.active {
  color: #ff6b6b;
  border-bottom-color: #ff6b6b;
}

.cart-badge {
  background: #ff6b6b;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  margin-left: 5px;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 购物车样式 */
.cart-container, .orders-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-cart, .empty-orders {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-cart p, .empty-orders p {
  font-size: 1.5rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.cart-list {
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.cart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #212529;
}

.item-desc {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.qty-btn:hover {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.qty-input {
  width: 60px;
  text-align: center;
  border: 1px solid #ddd;
  padding: 0.25rem;
  border-radius: 4px;
}

.item-total {
  text-align: right;
  min-width: 120px;
}

.total-price {
  color: #ff6b6b;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background: #c82333;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
}

.btn-checkout {
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.btn-checkout:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.btn-checkout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 订单样式 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.order-no {
  font-weight: 600;
  color: #495057;
}

.order-status {
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-paid {
  background: #d1ecf1;
  color: #0c5460;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-products {
  padding: 1.5rem;
}

.order-product {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.order-product:last-child {
  margin-bottom: 0;
}

.product-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.product-info p {
  margin: 0;
  color: #6c757d;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.order-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.order-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.order-total {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ff6b6b;
  margin-bottom: 0.5rem;
}

.order-actions button {
  margin-left: 0.5rem;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin: 0 0 1.5rem 0;
  color: #212529;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #495057;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.checkout-summary {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.checkout-summary p {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff6b6b;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}



.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 600;
}

.btn-primary {
  background-color: #ff6b6b;
  color: white;
}

.btn-primary:hover {
  background-color: #ff5252;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .user-center {
    padding: 1rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .application-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  

}
</style>