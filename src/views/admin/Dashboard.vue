<template>
  <div class="dashboard">
    <div class="nav-back">
      <button @click="$router.push('/')" class="back-button">
        ← 返回首页
      </button>
    </div>
    <div class="dashboard-header">
      <h1>管理员后台</h1>
      
      <div class="header-actions">
        <span class="welcome-text">欢迎回来，管理员！</span>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="stats-cards">
        <div class="stat-card">
          <h3>商品总数</h3>
          <p class="stat-number">{{ stats.totalProducts }}</p>
          <div class="stat-trend">
            <span class="trend-icon">📊</span>
            <span>所有商品数量</span>
          </div>
        </div>
        
        <div class="stat-card">
          <h3>上架商品</h3>
          <p class="stat-number">{{ stats.availableProducts }}</p>
          <div class="stat-trend">
            <span class="trend-icon">🛍️</span>
            <span>已上架商品</span>
          </div>
        </div>
        
        <div class="stat-card">
          <h3>总销量</h3>
          <p class="stat-number">{{ stats.totalSales }}</p>
          <div class="stat-trend">
            <span class="trend-icon">📈</span>
            <span>累计销售数量</span>
          </div>
        </div>
        
        <div class="stat-card">
          <h3>低库存</h3>
          <p class="stat-number">{{ stats.lowStockProducts }}</p>
          <div class="stat-trend">
            <span class="trend-icon">⚠️</span>
            <span>需要补货</span>
          </div>
        </div>
      </div>
      
      <div class="quick-actions">
        <div class="action-card" @click="$router.push('/admin/products')">
          <div class="action-icon">🛍️</div>
          <h3>商品管理</h3>
          <p>管理所有商品信息</p>
        </div>
        
        <div class="action-card" @click="$router.push('/admin/users')">
          <div class="action-icon">👥</div>
          <h3>用户管理</h3>
          <p>管理系统用户</p>
        </div>
        
        <div class="action-card" @click="$router.push('/admin/products/new')">
          <div class="action-icon">➕</div>
          <h3>添加商品</h3>
          <p>添加新的商品信息</p>
        </div>
      </div>
      
      <div class="recent-activities">
        <h2>最近活动</h2>
        <div class="activities-list">
          <div class="activity-item" v-if="recentActivities.length === 0">
            <p>暂无最近活动</p>
          </div>
          <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <p class="activity-title">{{ activity.title }}</p>
              <p class="activity-time">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      stats: {
        totalProducts: 0,
        availableProducts: 0,
        totalSales: 0,
        lowStockProducts: 0
      },
      recentActivities: [],
      loading: false
    }
  },
  mounted() {
    this.checkLoginStatus()
    this.loadStats()
    this.loadRecentActivities()
  },
  methods: {
    checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('isAdminLoggedIn')
      if (!isLoggedIn) {
        this.$router.push('/admin/login')
      }
    },
    
    handleLogout() {
      localStorage.removeItem('isAdminLoggedIn')
      this.$router.push('/admin/login')
    },
    
    async loadStats() {
      this.loading = true;
      try {
        // 获取商品统计数据
        const productsResponse = await this.$http.get('/products?page=1&size=1000');
        console.log('商品统计响应:', productsResponse);
        
        if (productsResponse.data.code === 200) {
          const productsData = productsResponse.data.data || {};
          const products = productsData.products || [];
          this.stats.totalProducts = productsData.total || products.length;
          this.stats.availableProducts = products.filter(p => p.status === '上架').length;
          this.stats.totalSales = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
          this.stats.lowStockProducts = products.filter(p => p.stock < 10).length;
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        this.stats = {
          totalProducts: 0,
          availableProducts: 0,
          totalSales: 0,
          lowStockProducts: 0
        };
      } finally {
        this.loading = false;
      }
    },
    
    loadRecentActivities() {
      // 模拟最近活动数据
      this.recentActivities = [
        {
          id: 1,
          icon: '🛍️',
          title: '新增商品"有机猫草种子"',
          time: '2小时前'
        },
        {
          id: 2,
          icon: '📝',
          title: '用户“李四”下单购买',
          time: '4小时前'
        },
        {
          id: 3,
          icon: '👤',
          title: '用户"张三"注册',
          time: '6小时前'
        }
      ];
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%);
  min-height: 100vh;
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

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #8bc34a 0%, #a5d6a7 100%);
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.3);
}

.dashboard-header h1 {
  margin: 0;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-text {
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.logout-btn {
  background: linear-gradient(135deg, #fff9c4, #f8bbd0);
  color: #ff6b6b;
  border: 2px solid #ff6b6b;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
}

.logout-btn:hover {
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px 20px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.2);
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(139, 195, 74, 0.3);
}

.stat-card h3 {
  margin: 0 0 15px 0;
  color: #2e7d32;
  font-size: 1.1rem;
  font-weight: 600;
}

.stat-number {
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #8bc34a, #a5d6a7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
}

.trend-icon {
  font-size: 1.2rem;
}

.quick-actions {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 40px;
}

.quick-actions h2 {
  margin-bottom: 25px;
  color: #2e7d32;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #8bc34a, #a5d6a7);
  border-radius: 15px;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 195, 74, 0.3);
}

.action-card:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 12px 35px rgba(139, 195, 74, 0.4);
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.action-card span {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.action-card p {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
  text-align: center;
}

.recent-activities {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(139, 195, 74, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.recent-activities h2 {
  margin-bottom: 25px;
  color: #2e7d32;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  border-left: 4px solid #8bc34a;
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.activity-content {
  flex: 1;
}

.activity-title {
  margin: 0 0 5px 0;
  font-weight: 600;
  color: #333;
}

.activity-time {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .dashboard-header {
    grid-template-columns: 1fr;
    gap: 15px;
    text-align: center;
  }
  
  .admin-search {
    width: 100%;
    max-width: 100%;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>