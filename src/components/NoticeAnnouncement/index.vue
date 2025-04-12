<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      title="系统公告"
      width="600px"
      append-to-body
      :before-close="handleClose"
      :close-on-click-modal="false"
    >
      <!-- 公告内容区域 -->
      <div v-if="currentNotice" class="notice-wrapper">
        <div class="notice-header">
          <h3 class="notice-title">{{ currentNotice.noticeTitle }}</h3>
          <div class="notice-info">
            <el-tag :type="currentNotice.noticeType === '1' ? 'primary' : 'success'">
              {{ currentNotice.noticeType === '1' ? '通知' : '公告' }}
            </el-tag>
            <span class="notice-date">{{ formatDate(currentNotice.createTime) }}</span>
          </div>
        </div>
        <div v-html="currentNotice.noticeContent" class="notice-content"></div>
      </div>
      
      <!-- 公告导航区域 -->
      <div class="notice-pagination">
        <div v-if="unreadNotices.length > 0" class="notice-count">
          {{ currentIndex + 1 }}/{{ unreadNotices.length }}
        </div>
        <div class="notice-navigation" v-if="unreadNotices.length > 1">
          <el-button :disabled="currentIndex === 0" @click="prevNotice">
            <el-icon><arrow-left /></el-icon>上一条
          </el-button>
          <el-button :disabled="currentIndex >= unreadNotices.length - 1" @click="nextNotice">
            下一条<el-icon><arrow-right /></el-icon>
          </el-button>
        </div>
      </div>
      
      <!-- 底部按钮区域 -->
      <template #footer>
        <span class="dialog-footer">
          <div></div>
          <div>
            <el-button @click="handleClose">关闭</el-button>
            <el-button type="primary" @click="markAsRead">标记已读</el-button>
          </div>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { listNotice, getNotice } from '@/api/system/notice'
import useUserStore from '@/store/modules/user'

const dialogVisible = ref(false)
const unreadNotices = ref([])
const currentIndex = ref(0)
const readNoticeIds = ref([])

// 获取当前显示的公告
const currentNotice = computed(() => {
  if (unreadNotices.value.length > 0 && currentIndex.value < unreadNotices.value.length) {
    return unreadNotices.value[currentIndex.value]
  }
  return null
})

// 检查本地存储中已读公告记录
const getLocalNoticeRecord = () => {
  const userId = useUserStore().id
  const storageKey = `notice_read_${userId}`
  return JSON.parse(localStorage.getItem(storageKey) || '{}')
}

// 更新本地存储中的已读公告记录
const updateLocalNoticeRecord = (noticeId) => {
  const userId = useUserStore().id
  const storageKey = `notice_read_${userId}`
  const noticeRecord = getLocalNoticeRecord()
  noticeRecord[noticeId] = new Date().getTime()
  localStorage.setItem(storageKey, JSON.stringify(noticeRecord))
  
  // 添加到已读列表
  if (!readNoticeIds.value.includes(noticeId)) {
    readNoticeIds.value.push(noticeId)
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取未读公告列表
const fetchUnreadNotices = async () => {
  try {
    const response = await listNotice({
      pageNum: 1,
      pageSize: 50, // 获取更多公告
      status: '0' // 查询正常状态的公告
    })
    
    if (response.rows && response.rows.length > 0) {
      // 获取已读公告记录
      const noticeRecord = getLocalNoticeRecord()
      
      // 过滤出未读的公告
      const unreads = response.rows.filter(notice => !noticeRecord[notice.noticeId] && !readNoticeIds.value.includes(notice.noticeId))
      
      if (unreads.length > 0) {
        // 获取所有未读公告的详细内容
        const detailedNotices = await Promise.all(
          unreads.map(async notice => {
            try {
              const detailResponse = await getNotice(notice.noticeId)
              if (detailResponse.data) {
                return {
                  ...notice,
                  noticeContent: detailResponse.data.noticeContent
                }
              }
              return notice
            } catch (error) {
              console.error(`获取公告${notice.noticeId}详情失败:`, error)
              return notice
            }
          })
        )
        
        unreadNotices.value = detailedNotices
        currentIndex.value = 0
        dialogVisible.value = true
      } else {
        // 没有未读公告
        unreadNotices.value = []
        dialogVisible.value = false
      }
    } else {
      // 没有公告
      unreadNotices.value = []
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('获取公告失败:', error)
    ElMessage.error('获取公告失败，请稍后再试')
  }
}

// 上一条公告
const prevNotice = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 下一条公告
const nextNotice = () => {
  if (currentIndex.value < unreadNotices.value.length - 1) {
    currentIndex.value++
  }
}

// 标记当前公告为已读
const markAsRead = () => {
  if (currentNotice.value) {
    updateLocalNoticeRecord(currentNotice.value.noticeId)
    
    // 从未读列表中移除当前公告
    unreadNotices.value = unreadNotices.value.filter(notice => notice.noticeId !== currentNotice.value.noticeId)
    
    // 如果没有更多未读公告，关闭弹窗
    if (unreadNotices.value.length === 0) {
      dialogVisible.value = false
      ElMessage.success('所有公告已标记为已读')
    } else {
      // 调整当前索引，确保不会越界
      if (currentIndex.value >= unreadNotices.value.length) {
        currentIndex.value = unreadNotices.value.length - 1
      }
      ElMessage.success('已标记为已读')
    }
  }
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 暴露给父组件的方法
const showUnreadNotices = () => {
  fetchUnreadNotices()
}

defineExpose({
  showUnreadNotices
})
</script>

<style scoped>
.notice-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.notice-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.notice-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notice-date {
  color: #909399;
  font-size: 14px;
}

.notice-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.notice-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-count {
  font-size: 14px;
  color: #606266;
  background-color: #f2f6fc;
  padding: 2px 8px;
  border-radius: 12px;
}

.notice-navigation {
  display: flex;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style> 