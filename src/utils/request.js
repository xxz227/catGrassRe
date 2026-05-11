import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // api的base_url
  timeout: 15000, // 请求超时时间
  withCredentials: true // 允许携带Cookie和Session
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    console.log('发送请求:', config)
    
    // 如果是管理员接口，添加管理员认证头
    if (config.url && config.url.startsWith('/admin/')) {
      const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
      if (isAdminLoggedIn) {
        config.headers['Admin-Token'] = 'admin-token-value';
      }
    }
    
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    console.log('收到响应:', response)
    
    // 对于登录等需要区分业务成功/失败的场景，我们不直接拦截错误
    // 而是返回完整的响应，让调用方自己处理业务逻辑
    return response
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    
    // 根据不同的状态码显示不同的错误信息
    if (error.response) {
      switch (error.response.status) {
        case 400:
          console.error('请求错误')
          break
        case 401:
          console.error('未授权，请登录')
          break
        case 403:
          console.error('拒绝访问')
          break
        case 404:
          console.error('请求地址出错')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error('未知错误')
      }
    }
    
    return Promise.reject(error)
  }
)

export default service