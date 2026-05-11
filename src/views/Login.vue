<template>
  <div class="login-container">
    <div class="login-form">
      <div class="nav-back">
        <button @click="$router.push('/')" class="back-button">
          ← 返回首页
        </button>
      </div>
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username" 
            required 
            placeholder="请输入用户名"
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            required 
            placeholder="请输入密码"
          >
        </div>
        
        <button type="submit" class="login-btn" :disabled="isLoggingIn">
          {{ isLoggingIn ? '登录中...' : '登录' }}
        </button>
        
        <div class="register-link">
          <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
        </div>
      </form>
      
      <div class="error-message" v-if="errorMessage">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      isLoggingIn: false,
      errorMessage: '',
      loginForm: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      this.isLoggingIn = true
      this.errorMessage = ''
      
      try {
        // 使用this.$http而不是原生fetch，这样可以利用拦截器
        const response = await this.$http.post('/users/login', {
          username: this.loginForm.username,
          password: this.loginForm.password
        })
        
        console.log('登录响应:', response)
        
        // 检查登录是否成功
        if (response.data.code === 200) {
          console.log('登录成功，用户数据:', response.data.data)
          // 保存登录状态
          localStorage.setItem('userInfo', JSON.stringify(response.data.data))
          
          // 根据用户角色跳转到不同页面
          if (response.data.data.role === 'admin') {
            this.$router.push('/admin/dashboard')
          } else {
            this.$router.push('/')
          }
        } else {
          console.log('登录失败，错误信息:', response.data.message)
          this.errorMessage = response.data.message || '用户名或密码错误'
        }
      } catch (error) {
        console.error('登录失败:', error)
        if (error.response && error.response.data) {
          this.errorMessage = error.response.data.message || '用户名或密码错误'
        } else {
          this.errorMessage = '登录失败，请检查网络连接'
        }
      } finally {
        this.isLoggingIn = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  padding: 20px;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(139, 195, 74, 0.2);
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.login-form h2 {
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

.login-btn {
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

.login-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.login-btn:disabled {
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
}

.register-link a {
  color: #8bc34a;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link a:hover {
  text-decoration: underline;
  color: #a5d6a7;
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

.nav-back {
  margin-bottom: 20px;
}

.back-button {
  background: linear-gradient(135deg, #8bc34a, #a5d6a7);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.3);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 195, 74, 0.4);
}

@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-form {
    padding: 30px 20px;
  }
  
  .login-form h2 {
    font-size: 1.8rem;
    margin-bottom: 30px;
  }
  
  .form-group input {
    padding: 12px;
  }
  
  .login-btn {
    padding: 14px;
  }
}
</style>