<template>
  <div class="shop-container">
    <div class="shop-header">
      <h2>农资商城</h2>
      <div class="cart-icon" @click="showCart = true">
        <el-badge :value="cartItems.length" class="cart-badge">
          <el-icon :size="24"><ShoppingCart /></el-icon>
        </el-badge>
      </div>
    </div>

    <div class="products-grid">
      <el-card v-for="product in products" :key="product.id" class="product-card">
        <img :src="getImageUrl(product.imageUrl)" class="product-image" />
        <h3>{{ product.name }}</h3>
        <p class="price">¥{{ product.price }}</p>
        <p class="description">{{ product.description }}</p>
        <el-button type="primary" @click="addToCart(product)">
          加入购物车
        </el-button>
      </el-card>
    </div>

    <!-- 购物车抽屉 -->
    <el-drawer
      v-model="showCart"
      title="购物车"
      direction="rtl"
      size="30%"
    >
      <div class="cart-content">
        <div v-if="cartItems.length === 0" class="empty-cart">
          购物车是空的
        </div>
        <template v-else>
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <img :src="getImageUrl(item.imageUrl)" class="cart-item-image" />
            <div class="cart-item-info">
              <h4>{{ item.name }}</h4>
              <p>¥{{ item.price }}</p>
            </div>
            <div class="cart-item-actions">
              <el-input-number 
                v-model="item.quantity" 
                :min="1" 
                :max="item.stock || 99"
                @change="updateCart"
              />
              <el-button type="danger" @click="removeFromCart(item)" size="small">
                删除
              </el-button>
            </div>
          </div>
          <div class="cart-footer">
            <div class="total">
              总计: ¥{{ totalPrice }}
            </div>
            <el-button type="primary" @click="openCheckoutDialog">
              结算
            </el-button>
          </div>
        </template>
      </div>
    </el-drawer>

    <!-- 结算对话框 -->
    <el-dialog
      v-model="checkoutDialogVisible"
      title="确认订单"
      width="40%"
    >
      <el-form :model="checkoutForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="checkoutForm.receiverName" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="checkoutForm.receiverPhone" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="checkoutForm.receiverAddress" type="textarea" />
        </el-form-item>
      </el-form>
      <div class="order-items">
        <h4>订单商品</h4>
        <div v-for="item in cartItems" :key="item.id" class="order-item">
          <span>{{ item.name }} x {{ item.quantity }}</span>
          <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
        <div class="order-total">
          <span>总计</span>
          <span>¥{{ totalPrice }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="checkoutDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitOrder">
            提交订单
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { listProduct } from '@/api/zngl/product'
import { addBase } from '@/api/zngl/base'
import useUserStore from '@/store/modules/user'

// 默认图片
import defaultImage from '@/assets/images/profile.jpg'

const userStore = useUserStore()
const products = ref([])
const showCart = ref(false)
const cartItems = ref([])
const checkoutDialogVisible = ref(false)

// 处理图片路径
const getImageUrl = (url) => {
  if (!url) return defaultImage
  
  // 如果是完整的URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 如果是Windows本地路径（包含冒号），需要特殊处理
  if (url.includes(':')) {
    // 移除开头的斜杠，避免路径中出现多余的斜杠
    const cleanPath = url.startsWith('/') ? url.substring(1) : url
    return import.meta.env.VITE_APP_BASE_API + cleanPath
  }
  
  // 其他相对路径，直接拼接基础URL
  return import.meta.env.VITE_APP_BASE_API + '/' + url.replace(/\\/g, '/')
}

const checkoutForm = ref({
  receiverName: '',
  receiverPhone: '',
  receiverAddress: ''
})

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0).toFixed(2)
})

// 获取商品列表
const getProducts = async () => {
  try {
    const res = await listProduct({ status: '上架' })
    products.value = res.rows || []
    if (products.value.length === 0) {
      ElMessage.warning('暂无商品数据')
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  }
}

// 添加到购物车
const addToCart = (product) => {
  const existingItem = cartItems.value.find(item => item.id === product.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    cartItems.value.push({
      ...product,
      quantity: 1
    })
  }
  ElMessage.success('已添加到购物车')
}

// 从购物车移除
const removeFromCart = (item) => {
  const index = cartItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    cartItems.value.splice(index, 1)
  }
}

// 更新购物车
const updateCart = () => {
  // 这里可以添加更新购物车的逻辑
}

// 打开结算对话框
const openCheckoutDialog = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }
  
  checkoutForm.value = {
    receiverName: '',
    receiverPhone: '',
    receiverAddress: ''
  }
  
  checkoutDialogVisible.value = true
  showCart.value = false
}

// 提交订单
const submitOrder = async () => {
  if (!checkoutForm.value.receiverName || !checkoutForm.value.receiverPhone || !checkoutForm.value.receiverAddress) {
    ElMessage.warning('请填写完整的收货信息')
    return
  }

  try {
    // 生成订单编号 (格式: ORDyyyyMMdd + 随机数)
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(10000 + Math.random() * 90000)
    const orderNo = `ORD${year}${month}${day}${random}`
    
    // 格式化日期为"yyyy-MM-dd HH:mm:ss"
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    // 创建订单对象
    const orderData = {
      orderNo: orderNo,
      buyerUserId: userStore.id,
      sellerUserId: cartItems.value[0].sellerId,
      totalAmount: Number(totalPrice.value),
      status: '待付款',
      paymentMethod: '微信支付',
      itemsSnapshot: JSON.stringify(cartItems.value.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))),
      receiverName: checkoutForm.value.receiverName,
      receiverPhone: checkoutForm.value.receiverPhone,
      receiverAddress: checkoutForm.value.receiverAddress,
      createTime: formatDate(new Date())
    }
    
    // 创建订单
    const orderRes = await addBase(orderData)
    
    if (orderRes && orderRes.code === 200) {
      // 获取返回的订单id
      const orderId = orderRes.data
      console.log('创建订单成功，订单ID:', orderId)
      
      // 显示成功消息
      ElMessage({
        message: '订单创建成功！订单号：' + orderNo,
        type: 'success',
        duration: 5000
      })
      cartItems.value = [] // 清空购物车
      checkoutDialogVisible.value = false
    } else {
      ElMessage.error('订单创建失败：' + (orderRes?.msg || '未知错误'))
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('创建订单失败：' + (error.message || '未知错误'))
  }
}

onMounted(() => {
  getProducts()
})
</script>

<style scoped lang="scss">
.shop-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
  
  .shop-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background-color: #fff;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    h2 {
      margin: 0;
      color: #303133;
    }
    
    .cart-icon {
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    
    .product-card {
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .product-image {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 4px;
      }
      
      h3 {
        margin: 10px 0;
        font-size: 16px;
        color: #303133;
      }
      
      .price {
        color: #f56c6c;
        font-size: 20px;
        font-weight: bold;
        margin: 8px 0;
      }
      
      .description {
        color: #666;
        margin: 8px 0;
        font-size: 14px;
        height: 40px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .el-button {
        width: 100%;
        margin-top: 10px;
      }
    }
  }
}

.cart-content {
  padding: 20px;
  
  .empty-cart {
    text-align: center;
    color: #909399;
    margin-top: 40px;
  }
  
  .cart-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    
    .cart-item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      margin-right: 15px;
    }
    
    .cart-item-info {
      flex: 1;
      
      h4 {
        margin: 0 0 5px 0;
      }
      
      p {
        color: #f56c6c;
        margin: 0;
      }
    }
    
    .cart-item-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }
  
  .cart-footer {
    margin-top: 20px;
    text-align: right;
    
    .total {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
  }
}

.order-items {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 5px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #303133;
  }
  
  .order-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    color: #606266;
  }
  
  .order-total {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #dcdfe6;
    font-weight: bold;
    color: #f56c6c;
  }
}
</style> 