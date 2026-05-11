<template>
  <div class="login-container">
    <div class="login-form">
      <div class="nav-back">
        <button @click="$router.push('/')" class="back-button">
          ← 返回首页
        </button>
      </div>
      <h2>管理员登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username" 
            required 
            placeholder="请输入管理员用户名"
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码:</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            required 
            placeholder="请输入密码"
          >
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-login" :disabled="isLoggingIn">
            {{ isLoggingIn ? '登录中...' : '登录' }}
          </button>
        </div>
        
        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      isLoggingIn: false,
      errorMessage: ''
    }
  },
  methods: {
    handleLogin() {
      this.isLoggingIn = true
      this.errorMessage = ''
      
      // 硬编码管理员账号密码（实际项目中应该调用后端API验证）
      const { username, password } = this.loginForm
      
      // 模拟登录验证
      setTimeout(() => {
        if (username === 'admin' && password === '123456') {
          // 登录成功，保存登录状态
          localStorage.setItem('isAdminLoggedIn', 'true')
          // 跳转到管理员后台首页
          this.$router.push('/admin/dashboard')
        } else {
          this.errorMessage = '用户名或密码错误'
        }
        this.isLoggingIn = false
      }, 1000)
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(255, 107, 53, 0.1),
    0 10px 20px rgba(255, 107, 53, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-form:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 25px 50px rgba(255, 107, 53, 0.15),
    0 15px 30px rgba(255, 107, 53, 0.08);
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

.login-form h2 {
  text-align: center;
  margin-bottom: 40px;
  color: #2e7d32;
  font-size: 2.2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(139, 195, 74, 0.1);
  position: relative;
}

.login-form h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #8bc34a, #a5d6a7);
  border-radius: 2px;
}

.form-group {
  margin-bottom: 25px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #8bc34a;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.form-group input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #c8e6c9;
  border-radius: 12px;
  font-size: 1rem;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  color: #2e7d32;
}

.form-group input:focus {
  outline: none;
  border-color: #8bc34a;
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.1);
  background: white;
  transform: translateY(-2px);
}

.form-group input::placeholder {
  color: #bcaaa4;
  font-style: italic;
}

.form-actions {
  margin-top: 35px;
}

.btn-login {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #8bc34a 0%, #a5d6a7 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(139, 195, 74, 0.3);
}

.btn-login::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(139, 195, 74, 0.4);
}

.btn-login:hover:not(:disabled)::before {
  left: 100%;
}

.btn-login:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(139, 195, 74, 0.3);
}

.btn-login:disabled {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.error-message {
  margin-top: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
  color: #c62828;
  border: 1px solid #ff8a80;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(198, 40, 40, 0.1);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }
  
  .login-form {
    padding: 30px 25px;
    border-radius: 15px;
  }
  
  .login-form h2 {
    font-size: 1.8rem;
    margin-bottom: 30px;
  }
  
  .form-group input {
    padding: 12px 15px;
  }
  
  .btn-login {
    padding: 14px;
  }
}
</style>