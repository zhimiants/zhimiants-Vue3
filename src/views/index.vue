<template>
  <div class="app-container home" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
    <div class="welcome-text">欢迎来到助农管理系统</div>
  </div>
</template>

<script setup name="Index">
import backgroundImage from '@/assets/images/background.jpg';  // 导入背景图

const version = ref('3.8.7')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  background-repeat: no-repeat;
  background-position: center center;
  background-attachment: fixed;
  background-size: cover;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.welcome-text {
  font-size: 36px;
  color: white;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);  /* 文字加阴影，增强可读性 */
}
</style>
