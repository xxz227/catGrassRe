<template>
  <div class="image-upload">
    <div class="upload-area" 
         :class="{ 'dragover': isDragging }"
         @drop.prevent="handleDrop"
         @dragover.prevent="isDragging = true"
         @dragleave="isDragging = false">
      
      <!-- 图片预览区 -->
      <div v-if="imageList.length > 0" class="image-preview-list">
        <div v-for="(image, index) in imageList" 
             :key="index" 
             class="image-preview-item">
          <img :src="getImageUrl(image)" :alt="`图片${index + 1}`">
          <div class="image-overlay">
            <button @click="removeImage(index)" class="btn-remove" type="button">
              <span class="icon-delete">🗑️</span>
            </button>
          </div>
        </div>
        
        <!-- 添加更多图片按钮 -->
        <div v-if="imageList.length < maxCount" 
             class="add-more-btn"
             @click="triggerFileInput">
          <span class="icon-add">+</span>
          <span class="add-text">添加图片</span>
        </div>
      </div>
      
      <!-- 空状态上传区 -->
      <div v-else class="upload-placeholder" @click="triggerFileInput">
        <div class="upload-icon">📷</div>
        <p class="upload-text">点击或拖拽图片到此处上传</p>
        <p class="upload-hint">
          支持 JPG、PNG 格式，单张最大 5MB
          <template v-if="maxCount > 1">，最多 {{ maxCount }} 张</template>
        </p>
      </div>
      
      <!-- 隐藏的文件输入框 -->
      <input 
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="maxCount > 1"
        @change="handleFileSelect"
        style="display: none;">
    </div>
    
    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <span class="progress-text">上传中... {{ uploadProgress }}%</span>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageUpload',
  props: {
    // 已有的图片列表（用于编辑时回显）
    value: {
      type: [String, Array],
      default: ''
    },
    // 最大上传数量
    maxCount: {
      type: Number,
      default: 3
    },
    // 上传类型（avatar 或 product）
    uploadType: {
      type: String,
      default: 'product'
    }
  },
  data() {
    return {
      imageList: [],
      isDragging: false,
      uploading: false,
      uploadProgress: 0,
      errorMessage: '',
      accept: 'image/jpeg,image/jpg,image/png,image/webp'
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          if (typeof newVal === 'string') {
            // 如果是字符串，按逗号分割
            this.imageList = newVal.split(',').filter(item => item.trim())
          } else if (Array.isArray(newVal)) {
            this.imageList = [...newVal]
          }
        } else {
          this.imageList = []
        }
      }
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      this.uploadFiles(files)
      // 清空input，允许重复选择同一文件
      event.target.value = ''
    },
    
    handleDrop(event) {
      this.isDragging = false
      const files = Array.from(event.dataTransfer.files)
      this.uploadFiles(files)
    },
    
    async uploadFiles(files) {
      // 验证文件数量
      if (this.imageList.length + files.length > this.maxCount) {
        this.showError(`最多只能上传${this.maxCount}张图片`)
        return
      }
      
      // 验证文件类型和大小
      for (const file of files) {
        if (!this.validateFile(file)) {
          return
        }
      }
      
      this.uploading = true
      this.uploadProgress = 0
      this.errorMessage = ''
      
      try {
        const formData = new FormData()
        
        if (files.length === 1) {
          // 单文件上传
          formData.append('file', files[0])
          formData.append('type', this.uploadType)
          
          const response = await this.$http.post('/upload/single', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              this.uploadProgress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
            }
          })
          
          if (response.data.code === 200) {
            this.imageList.push(response.data.data.url)
            this.emitChange()
          } else {
            this.showError(response.data.message || '上传失败')
          }
        } else {
          // 多文件上传
          files.forEach(file => {
            formData.append('files', file)
          })
          formData.append('type', this.uploadType)
          
          const response = await this.$http.post('/upload/multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              this.uploadProgress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
            }
          })
          
          if (response.data.code === 200) {
            this.imageList.push(...response.data.data.urls)
            this.emitChange()
          } else {
            this.showError(response.data.message || '上传失败')
          }
        }
      } catch (error) {
        console.error('上传失败:', error)
        this.showError('上传失败，请稍后重试')
      } finally {
        this.uploading = false
        this.uploadProgress = 0
      }
    },
    
    async removeImage(index) {
      const imagePath = this.imageList[index]
      
      // 如果是服务器上的图片，尝试删除
      if (imagePath.startsWith('/uploads/')) {
        try {
          await this.$http.delete('/upload', {
            params: { filePath: imagePath }
          })
        } catch (error) {
          console.error('删除文件失败:', error)
        }
      }
      
      this.imageList.splice(index, 1)
      this.emitChange()
    },
    
    validateFile(file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        this.showError('只支持 JPG、PNG 格式的图片')
        return false
      }
      
      // 验证文件大小（5MB）
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        this.showError('图片大小不能超过 5MB')
        return false
      }
      
      return true
    },
    
    showError(message) {
      this.errorMessage = message
      setTimeout(() => {
        this.errorMessage = ''
      }, 3000)
    },
    
    emitChange() {
      // 将图片列表转换为逗号分隔的字符串
      const value = this.imageList.join(',')
      this.$emit('input', value)
      this.$emit('change', value)
    },
    
    getImageUrl(url) {
      if (!url) {
        // 返回占位图
        return 'https://via.placeholder.com/300x200?text=商品图片'
      }
      // 如果是完整URL，直接返回
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      // 否则使用后端服务器地址
      return `http://localhost:8080${url}`
    }
  }
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fafafa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area.dragover {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.upload-placeholder {
  text-align: center;
  padding: 40px 20px;
  cursor: pointer;
  width: 100%;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.upload-text {
  font-size: 1rem;
  color: #666;
  margin: 0.5rem 0;
  font-weight: 600;
}

.upload-hint {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.image-preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  width: 100%;
}

.image-preview-item {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview-item img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-item:hover .image-overlay {
  opacity: 1;
}

.btn-remove {
  background: #ff4d4f;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background: #ff7875;
  transform: scale(1.1);
}

.add-more-btn {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  padding: 2rem 1rem;
}

.add-more-btn:hover {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.icon-add {
  font-size: 2rem;
  color: #999;
  margin-bottom: 0.5rem;
}

.add-text {
  font-size: 0.9rem;
  color: #666;
}

.upload-progress {
  margin-top: 1rem;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #ff6b6b, #ffd54f);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.85rem;
  color: #666;
}

.error-message {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  font-size: 0.9rem;
}
</style>
