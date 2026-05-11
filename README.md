# 宠物领养平台前端

这是一个基于Vue 3的宠物领养平台前端项目。

## 项目结构

```
src/
├── main.js            # 应用入口文件
├── App.vue            # 根组件
├── views/             # 页面组件
│   ├── Home.vue       # 首页/宠物列表页
│   └── PetDetail.vue  # 宠物详情页
└── public/            # 静态资源
    └── index.html     # HTML模板
```

## 功能特性

1. 宠物列表展示
2. 按分类和状态筛选宠物
3. 宠物详情查看
4. 图片轮播展示

## 开发环境搭建

### 前置条件

- Node.js (推荐版本 14+)
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run serve
```

默认情况下，应用将在 `http://localhost:3000` 上运行。

## 构建生产版本

```bash
npm run build
```

## 技术栈

- Vue 3
- Vue Router
- Axios
- CSS3

## 与后端交互

前端通过Axios与后端API进行交互：

- 获取宠物列表: `GET /api/pets`
- 获取宠物详情: `GET /api/pets/{id}`

开发环境下配置了代理，将 `/api` 请求转发到 `http://localhost:8080`。