import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import ProductDetail from './views/ProductDetail.vue'
import UserCenter from './views/UserCenter.vue'
import SearchTest from './views/SearchTest.vue'
import AdminLogin from './views/admin/Login.vue'
import AdminDashboard from './views/admin/Dashboard.vue'
import ProductManagement from './views/admin/ProductManagement.vue'
import ProductForm from './views/admin/ProductForm.vue'
import UserManagement from './views/admin/UserManagement.vue'

// 引入自定义的axios实例
import request from './utils/request'

// 创建路由
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/product/:id', component: ProductDetail, props: true },
  { path: '/user/center', component: UserCenter },
  { path: '/admin/login', component: AdminLogin },
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/products', component: ProductManagement },
  { path: '/admin/products/new', component: ProductForm },
  { path: '/admin/products/edit/:id', component: ProductForm, props: true },
  { path: '/admin/users', component: UserManagement }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加导航守卫，保护管理员路由
router.beforeEach((to, from, next) => {
  // 检查是否是管理员路由
  if (to.path.startsWith('/admin/') && to.path !== '/admin/login') {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn')
    if (!isLoggedIn) {
      next('/admin/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

// 创建应用实例
const app = createApp(App)
app.use(router)
// 将自定义的axios实例挂载到全局属性
app.config.globalProperties.$http = request
app.mount('#app')