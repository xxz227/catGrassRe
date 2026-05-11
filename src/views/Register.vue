<template>
  <div class="register-container">
    <div class="register-form">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="registerForm.username" 
            required 
            placeholder="请输入用户名"
            @input="validateUsername"
          >
          <div class="error" v-if="errors.username">{{ errors.username }}</div>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="registerForm.password" 
            required 
            placeholder="请输入密码"
            @input="validatePassword"
          >
          <div class="error" v-if="errors.password">{{ errors.password }}</div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="registerForm.confirmPassword" 
            required 
            placeholder="请再次输入密码"
            @input="validateConfirmPassword"
          >
          <div class="error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="registerForm.email" 
            required 
            placeholder="请输入邮箱地址"
            @input="validateEmail"
          >
          <div class="error" v-if="errors.email">{{ errors.email }}</div>
        </div>
        
        <div class="form-group">
          <label for="phone">手机号</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="registerForm.phone" 
            required 
            placeholder="请输入手机号"
            @input="validatePhone"
          >
          <div class="error" v-if="errors.phone">{{ errors.phone }}</div>
        </div>
        
        <button type="submit" class="register-btn" :disabled="isRegistering">
          {{ isRegistering ? '注册中...' : '注册' }}
        </button>
        
        <div class="login-link">
          <p>已有账号？<router-link to="/login">立即登录</router-link></p>
        </div>
      </form>
      
      <div class="success-message" v-if="successMessage">
        {{ successMessage }}
      </div>
      
      <div class="error-message" v-if="errorMessage">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      isRegistering: false,
      successMessage: '',
      errorMessage: '',
      errors: {},
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: ''
      }
    }
  },
  methods: {
    validateUsername() {
      if (!this.registerForm.username || this.registerForm.username.trim() === '') {
        this.errors.username = '用户名不能为空'
      } else if (this.registerForm.username.length < 3) {
        this.errors.username = '用户名至少需要3个字符'
      } else {
        delete this.errors.username
      }
    },
    
    validatePassword() {
      if (!this.registerForm.password || this.registerForm.password.trim() === '') {
        this.errors.password = '密码不能为空'
      } else if (this.registerForm.password.length < 6) {
        this.errors.password = '密码至少需要6个字符'
      } else {
        delete this.errors.password
      }
    },
    
    validateConfirmPassword() {
      if (!this.registerForm.confirmPassword || this.registerForm.confirmPassword.trim() === '') {
        this.errors.confirmPassword = '请确认密码'
      } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致'
      } else {
        delete this.errors.confirmPassword
      }
    },
    
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.registerForm.email || this.registerForm.email.trim() === '') {
        this.errors.email = '邮箱不能为空'
      } else if (!emailRegex.test(this.registerForm.email)) {
        this.errors.email = '请输入有效的邮箱地址'
      } else {
        delete this.errors.email
      }
    },
    
    validatePhone() {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!this.registerForm.phone || this.registerForm.phone.trim() === '') {
        this.errors.phone = '手机号不能为空'
      } else if (!phoneRegex.test(this.registerForm.phone)) {
        this.errors.phone = '请输入有效的手机号码'
      } else {
        delete this.errors.phone
      }
    },
    
    validateForm() {
      this.validateUsername()
      this.validatePassword()
      this.validateConfirmPassword()
      this.validateEmail()
      this.validatePhone()
      
      return Object.keys(this.errors).length === 0
    },
    
    async handleRegister() {
      if (!this.validateForm()) {
        return
      }
      
      this.isRegistering = true
      this.errorMessage = ''
      this.successMessage = ''
      
      try {
        // 使用this.$http而不是原生fetch，这样可以利用拦截器
        const response = await this.$http.post('/users/register', {
          username: this.registerForm.username,
          password: this.registerForm.password,
          email: this.registerForm.email,
          phone: this.registerForm.phone,
          role: 'user'
        })
        
        console.log('注册响应:', response)
        
        // 检查注册是否成功
        if (response.data.code === 200) {
          this.successMessage = '注册成功！正在跳转到登录页面...'
          
          // 2秒后跳转到登录页面
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        } else {
          this.errorMessage = response.data.message || '注册失败，请稍后重试'
        }
      } catch (error) {
        console.error('注册失败:', error)
        if (error.response && error.response.data) {
          this.errorMessage = error.response.data.message || '注册失败，请稍后重试'
        } else {
          this.errorMessage = '注册失败，请检查网络连接'
        }
      } finally {
        this.isRegistering = false
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  padding: 20px;
}

.register-form {
  background: rgba(255, 255, 255, 0.95);
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(139, 195, 74, 0.2);
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.register-form h2 {
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #8bc34a, #a5d6a7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.2rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #8bc34a;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-group input:focus {
  outline: none;
  border-color: #8bc34a;
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.1);
  transform: translateY(-2px);
}

.form-group input::placeholder {
  color: #aaa;
}

.error {
  color: #8bc34a;
  font-size: 0.85rem;
  margin-top: 8px;
  font-weight: 500;
  padding-left: 5px;
}

.register-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #8bc34a, #a5d6a7);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 25px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.4);
}

.register-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.register-btn:disabled {
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
}

.login-link a {
  color: #8bc34a;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-link a:hover {
  text-decoration: underline;
  color: #a5d6a7;
}

.success-message {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  padding: 15px;
  border-radius: 12px;
  margin-top: 25px;
  text-align: center;
  font-weight: 500;
  border: 1px solid #c3e6cb;
  box-shadow: 0 2px 10px rgba(52, 168, 83, 0.1);
}

.error-message {
  background: linear-gradient(135deg, #ffcdd2, #ef9a9a);
  color: #c62828;
  padding: 15px;
  border-radius: 12px;
  margin-top: 25px;
  text-align: center;
  font-weight: 500;
  border: 1px solid #ef9a9a;
  box-shadow: 0 2px 10px rgba(198, 40, 40, 0.1);
}

@media (max-width: 480px) {
  .register-container {
    padding: 10px;
  }
  
  .register-form {
    padding: 30px 20px;
  }
  
  .register-form h2 {
    font-size: 1.8rem;
    margin-bottom: 30px;
  }
  
  .form-group input {
    padding: 12px;
  }
  
  .register-btn {
    padding: 14px;
  }
}
</style>