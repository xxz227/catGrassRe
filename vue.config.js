module.exports = {
  devServer: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      // 添加图片资源代理
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
    // 添加favicon请求拦截
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      
      // 拦截favicon.ico请求并返回204状态码
      devServer.app.get('/favicon.ico', (req, res) => {
        res.status(204).end();
      });
      
      return middlewares;
    }
  }
}