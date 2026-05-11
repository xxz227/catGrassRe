       <template>
  <div id="app">
    <header v-if="!isAdminRoute">
      <div class="header-container">
        <h1>🌿 猫草商城</h1>
        
        <nav>
          <router-link to="/">🏠 首页</router-link>
          <template v-if="isUserLoggedIn">
            <router-link to="/user/center">👤 个人中心</router-link>
            <span class="user-info">欢迎，{{ currentUser?.username }}</span>
            <button @click="handleLogout" class="logout-btn">退出</button>
          </template>
          <template v-else>
            <router-link to="/login">登录</router-link>
            <router-link to="/register">注册</router-link>
          </template>
          <router-link to="/admin/login">🔧 管理员</router-link>
        </nav>
      </div>
    </header>
    <main>
      <router-view></router-view>
    </main>
    <footer v-if="!isAdminRoute">
      <div class="footer-content">
        <p>&copy; 2024 猫草商城 - 为猫咪提供健康绿色的生活方式</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isUserLoggedIn: false,
      currentUser: null
    }
  },
  computed: {
    isAdminRoute() {
      return this.$route.path.startsWith('/admin')
    },
    isAdmin() {
      return this.currentUser?.role === 'admin'
    }
  },
  mounted() {
    this.checkLoginStatus()
  },
  methods: {
    checkLoginStatus() {
      const userData = localStorage.getItem('userInfo')
      
      this.isUserLoggedIn = !!userData
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    },
    
    handleLogout() {
      localStorage.removeItem('userInfo')

      this.currentUser = null
      
      // 如果当前在管理员页面，跳转到首页
      if (this.$route.path.startsWith('/admin')) {
        this.$router.push('/')
      }
      

    }
  },
  watch: {
    '$route'() {
      this.checkLoginStatus()
    }
  }
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #5d4037;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 50%, #c8e6c9 100%);
  position: relative;
  overflow-x: hidden;
}

#app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(200, 230, 201, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(165, 214, 167, 0.3) 0%, transparent 50%);
  z-index: -1;
}

header {
  background: linear-gradient(135deg, #8bc34a 0%, #a5d6a7 50%, #c8e6c9 100%);
  color: white;
  padding: 0;
  box-shadow: 0 8px 32px rgba(139, 195, 74, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 1rem 2rem;
}

header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(139, 195, 74, 0.4);
  background: linear-gradient(45deg, #ffffff, #f1f8e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

header h1::after {
  content: '🌿';
  margin-left: 10px;
  font-size: 1.8rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.2));
}

nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0.8rem 1.8rem;
  border-radius: 30px;
  transition: all 0.4s ease;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.2);
}

nav a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s;
}

nav a:hover::before {
  left: 100%;
}

nav a:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
}

nav a.router-link-active {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 6px 20px rgba(139, 195, 74, 0.5);
  border-color: rgba(255, 255, 255, 0.5);
}

.user-info {
  color: white;
  font-weight: 600;
  margin-right: 10px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.user-center-link {
  color: white;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.2);
}

.user-center-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.4s ease;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.2);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
}

main {
  min-height: calc(100vh - 160px);
  padding: 0;
}

footer {
  background: linear-gradient(135deg, #8bc34a 0%, #a5d6a7 100%);
  color: white;
  padding: 2.5rem;
  text-align: center;
  margin-top: auto;
  position: relative;
  overflow: hidden;
}

footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

footer p {
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  header h1 {
    font-size: 1.8rem;
    text-align: center;
  }
  
  nav {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  nav a {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .user-info {
    margin: 0;
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
  }
}
</style>