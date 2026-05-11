<template>
  <div class="product-form">
    <div class="nav-back">
      <button @click="$router.back()" class="back-button">
        ← 返回商品管理
      </button>
    </div>
    <div class="form-container">
      <h1>{{ isEditMode ? '编辑商品' : '添加新商品' }}</h1>
      
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="name">商品名称: <span class="required">*</span></label>
          <input type="text" id="name" v-model="product.name" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="category">商品分类: <span class="required">*</span></label>
            <select id="category" v-model="product.category" required>
              <option value="">请选择</option>
              <option value="猫草种子">猫草种子</option>
              <option value="猫草盆栽">猫草盆栽</option>
              <option value="自动种植盒">自动种植盒</option>
              <option value="猫咪植物玩具">猫咪植物玩具</option>
              <option value="营养土">营养土</option>
              <option value="猫草培养套装">猫草培养套装</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="petType">种植方式:</label>
            <select id="petType" v-model="product.petType">
              <option value="通用">通用</option>
              <option value="水培">水培</option>
              <option value="土培">土培</option>
              <option value="自动种植">自动种植</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="price">价格: <span class="required">*</span></label>
            <input type="number" id="price" v-model.number="product.price" step="0.01" min="0" required>
          </div>
          
          <div class="form-group">
            <label for="stock">库存数量: <span class="required">*</span></label>
            <input type="number" id="stock" v-model.number="product.stock" min="0" required>
          </div>
        </div>
        
        <div class="form-group">
          <label for="status">商品状态:</label>
          <select id="status" v-model="product.status">
            <option value="上架">上架</option>
            <option value="下架">下架</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="description">商品描述:</label>
          <textarea id="description" v-model="product.description" rows="5" placeholder="请输入商品描述"></textarea>
        </div>
        
        <div class="form-group">
          <label for="images">商品图片:</label>
          <ImageUpload v-model="product.images" />
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn-cancel">取消</button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : (isEditMode ? '更新商品' : '添加商品') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload.vue'

export default {
  name: 'ProductForm',
  components: {
    ImageUpload
  },
  props: ['id'],
  data() {
    return {
      product: {
        name: '',
        category: '',
        petType: '通用',
        price: 0,
        stock: 0,
        description: '',
        images: '',
        status: '上架'
      },
      isEditMode: false,
      isSubmitting: false
    }
  },
  mounted() {
    this.checkLoginStatus()
    if (this.id) {
      this.isEditMode = true
      this.fetchProductDetail()
    }
  },
  methods: {
    checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('isAdminLoggedIn')
      if (!isLoggedIn) {
        this.$router.push('/admin/login')
      }
    },
    
    async fetchProductDetail() {
      try {
        const response = await this.$http.get(`/products/${this.id}`)
        
        if (response.data.code === 200) {
          this.product = response.data.data
        } else {
          alert('获取商品详情失败: ' + response.data.message)
          this.$router.back()
        }
      } catch (error) {
        console.error('获取商品详情失败:', error)
        alert('获取商品详情失败')
        this.$router.back()
      }
    },
    
    async submitForm() {
      // 表单验证
      if (!this.product.name || !this.product.name.trim()) {
        alert('请输入商品名称')
        return
      }
      
      if (!this.product.category) {
        alert('请选择商品分类')
        return
      }
      
      if (this.product.price === null || this.product.price < 0) {
        alert('请输入有效的价格')
        return
      }
      
      if (this.product.stock === null || this.product.stock < 0) {
        alert('请输入有效的库存数量')
        return
      }
      
      this.isSubmitting = true
      
      try {
        let response
        if (this.isEditMode) {
          response = await this.$http.put(`/products/${this.id}`, this.product)
        } else {
          response = await this.$http.post('/products', this.product)
        }
        
        if (response.data.code === 200) {
          alert(this.isEditMode ? '商品更新成功' : '商品添加成功')
          this.$router.push('/admin/products')
        } else {
          alert('操作失败: ' + response.data.message)
        }
      } catch (error) {
        console.error('提交表单失败:', error)
        alert('提交失败，请检查网络连接')
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.product-form {
  max-width: 900px;
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

.form-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 225, 0.95) 100%);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.15);
}

.form-container h1 {
  color: #ff6b6b;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ff6b6b;
  font-weight: 700;
  font-size: 1rem;
}

.required {
  color: #f44336;
}

input[type="text"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #ffd54f;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #ffd54f;
}

.btn-cancel,
.btn-submit {
  padding: 0.9rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-cancel {
  background: linear-gradient(135deg, #8e8e93 0%, #48484a 100%);
  color: white;
}

.btn-submit {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
  color: white;
}

.btn-cancel:hover,
.btn-submit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.btn-submit:disabled {
  background: linear-gradient(135deg, #bcaaa4 0%, #a1887f 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .product-form {
    padding: 1rem;
  }
  
  .form-container {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
