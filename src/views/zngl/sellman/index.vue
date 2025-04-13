<template>
  <div class="app-container">
    <el-form
      ref="sellerFormRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="seller-form"
    >
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>卖家店铺信息</span>
            <el-tag v-if="form.approvalStatus" :type="statusTypeMap[form.approvalStatus]">
              {{ form.approvalStatus }}
            </el-tag>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="店铺名称" prop="shopName">
              <el-input v-model="form.shopName" placeholder="请输入店铺名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人姓名" prop="contactName">
              <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="店铺地址" prop="shopAddress">
          <el-input v-model="form.shopAddress" placeholder="请输入店铺地址" />
        </el-form-item>
        
        <el-form-item label="营业执照" prop="businessLicenseUrl">
          <el-upload
            class="license-uploader"
            :action="uploadUrl"
            :headers="headers"
            :show-file-list="false"
            :on-success="handleLicenseSuccess"
            :before-upload="beforeLicenseUpload"
          >
            <img v-if="form.businessLicenseUrl" :src="form.businessLicenseUrl" class="license-image" />
            <el-icon v-else class="license-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="el-upload__tip">请上传营业执照图片，支持JPG/PNG格式，不超过2MB</div>
        </el-form-item>
        
        <el-form-item label="店铺描述" prop="shopDescription">
          <el-input
            v-model="form.shopDescription"
            type="textarea"
            :rows="4"
            placeholder="请输入店铺描述"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" />
        </el-form-item>
        
        <el-alert
          v-if="form.approvalStatus === '未通过'"
          title="您的店铺信息审核未通过，请根据反馈修改后重新提交"
          type="error"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />
        
        <el-alert
          v-if="form.approvalStatus === '待审核'"
          title="您的店铺信息正在审核中，请耐心等待"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :disabled="form.approvalStatus === '待审核'">
            {{ hasProfile ? '更新信息' : '提交申请' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getSellerprofile, addSellerprofile, updateSellerprofile, listSellerprofile } from '@/api/zngl/sellerprofile';
import { getInfo } from '@/api/login';
import { getToken } from '@/utils/auth';

const sellerFormRef = ref(null);
const userId = ref(null);
const hasProfile = ref(false);
const profileId = ref(null);

// 表单数据
const form = reactive({
  userId: null,
  shopName: '',
  contactName: '',
  businessLicenseUrl: '',
  shopAddress: '',
  shopDescription: '',
  approvalStatus: '',
  remark: ''
});

// 上传相关
const uploadUrl = import.meta.env.VITE_APP_BASE_API + '/common/upload';
const headers = computed(() => {
  return { Authorization: 'Bearer ' + getToken() };
});

// 审核状态对应的标签类型
const statusTypeMap = {
  '待审核': 'warning',
  '已通过': 'success',
  '未通过': 'danger'
};

// 表单校验规则
const rules = reactive({
  shopName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  businessLicenseUrl: [
    { required: true, message: '请上传营业执照', trigger: 'change' }
  ],
  shopAddress: [
    { required: true, message: '请输入店铺地址', trigger: 'blur' }
  ],
  shopDescription: [
    { required: true, message: '请输入店铺描述', trigger: 'blur' }
  ]
});

// 获取当前用户信息
const getUserInfo = async () => {
  try {
    const res = await getInfo();
    if (res.user && res.user.userId) {
      userId.value = res.user.userId;
      form.userId = res.user.userId;
      // 获取卖家个人资料
      getSellerProfileData();
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息出错:', error);
    ElMessage.error('获取用户信息出错');
  }
};

// 获取卖家个人资料
const getSellerProfileData = async () => {
  try {
    // 查询当前用户的卖家资料，修改请求方式
    const res = await listSellerprofile({ userId: userId.value });
    
    if (res.code === 200 && res.data && res.data.rows && res.data.rows.length > 0) {
      const profileData = res.data.rows[0];
      profileId.value = profileData.id;
      
      Object.assign(form, {
        userId: profileData.userId,
        shopName: profileData.shopName,
        contactName: profileData.contactName,
        businessLicenseUrl: profileData.businessLicenseUrl,
        shopAddress: profileData.shopAddress,
        shopDescription: profileData.shopDescription,
        approvalStatus: profileData.approvalStatus,
        remark: profileData.remark || ''
      });
      
      hasProfile.value = true;
    }
  } catch (error) {
    console.error('获取卖家资料出错:', error);
    // 如果没有找到数据，表示用户还没有创建资料，这是正常的
    hasProfile.value = false;
  }
};

// 营业执照上传前的检查
const beforeLicenseUpload = (file) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPGOrPNG) {
    ElMessage.error('营业执照图片只能是JPG或PNG格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('营业执照图片大小不能超过2MB!');
    return false;
  }
  return true;
};

// 营业执照上传成功的回调
const handleLicenseSuccess = (response, file) => {
  if (response.code === 200) {
    form.businessLicenseUrl = response.url;
    ElMessage.success('上传成功');
  } else {
    ElMessage.error(response.msg || '上传失败');
  }
};

// 提交表单
const submitForm = async () => {
  if (!sellerFormRef.value) return;
  
  await sellerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res;
        const submitData = { ...form };
        
        if (hasProfile.value) {
          // 更新时需要传入ID
          submitData.id = profileId.value;
          res = await updateSellerprofile(submitData);
        } else {
          res = await addSellerprofile(submitData);
        }
        
        if (res.code === 200) {
          ElMessage.success(hasProfile.value ? '更新成功' : '提交成功，请等待审核');
          hasProfile.value = true;
          // 重新获取最新数据
          getSellerProfileData();
        } else {
          ElMessage.error(res.msg || '保存失败');
        }
      } catch (error) {
        console.error('保存卖家资料出错:', error);
        ElMessage.error('保存卖家资料出错');
      }
    } else {
      ElMessage.warning('请正确填写表单内容');
    }
  });
};

// 重置表单
const resetForm = () => {
  sellerFormRef.value.resetFields();
};

onMounted(() => {
  getUserInfo();
});
</script>

<style scoped>
.seller-form {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.license-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.license-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.license-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.license-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
</style>
