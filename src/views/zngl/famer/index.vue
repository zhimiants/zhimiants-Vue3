<template>
  <div class="app-container">
    <el-form
      ref="farmerFormRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="farmer-form"
    >
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>农民个人信息</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="主要农场地址" prop="farmAddress">
          <el-input v-model="form.farmAddress" placeholder="请输入主要农场地址" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="农场面积(亩)" prop="farmArea">
              <el-input-number v-model="form.farmArea" :min="0" :precision="2" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主要种植作物" prop="mainCrop">
              <el-input v-model="form.mainCrop" placeholder="请输入主要种植作物" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getProfile, addProfile, updateProfile, listProfile } from '@/api/zngl/profile';
import { getInfo } from '@/api/login';

const farmerFormRef = ref(null);
const userId = ref(null);
const hasProfile = ref(false);
const profileId = ref(null);

// 表单数据
const form = reactive({
  userId: null,
  realName: '',
  idCard: '',
  farmAddress: '',
  farmArea: 0,
  mainCrop: '',
  remark: ''
});

// 表单校验规则
const rules = reactive({
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码', trigger: 'blur' }
  ],
  farmAddress: [
    { required: true, message: '请输入主要农场地址', trigger: 'blur' }
  ],
  farmArea: [
    { required: true, message: '请输入农场面积', trigger: 'blur' }
  ],
  mainCrop: [
    { required: true, message: '请输入主要种植作物', trigger: 'blur' }
  ]
});

// 获取当前用户信息
const getUserInfo = async () => {
  try {
    const res = await getInfo();
    if (res.user && res.user.userId) {
      userId.value = res.user.userId;
      form.userId = res.user.userId;
      // 获取农民个人资料
      getFarmerProfileData();
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息出错:', error);
    ElMessage.error('获取用户信息出错');
  }
};

// 获取农民个人资料
const getFarmerProfileData = async () => {
  try {
    // 查询当前用户的资料，修改请求方式
    const res = await listProfile({ userId: userId.value });
    
    if (res.code === 200 && res.data && res.data.rows && res.data.rows.length > 0) {
      const profileData = res.data.rows[0];
      profileId.value = profileData.id;
      
      Object.assign(form, {
        userId: profileData.userId,
        realName: profileData.realName,
        idCard: profileData.idCard,
        farmAddress: profileData.farmAddress,
        farmArea: profileData.farmArea,
        mainCrop: profileData.mainCrop,
        remark: profileData.remark || ''
      });
      
      hasProfile.value = true;
    }
  } catch (error) {
    console.error('获取农民资料出错:', error);
    // 如果是404错误或没有找到数据，表示用户还没有创建资料，这是正常的
    hasProfile.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  if (!farmerFormRef.value) return;
  
  await farmerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res;
        const submitData = { ...form };
        
        if (hasProfile.value) {
          // 更新时需要传入ID
          submitData.id = profileId.value;
          res = await updateProfile(submitData);
        } else {
          res = await addProfile(submitData);
        }
        
        if (res.code === 200) {
          ElMessage.success('保存成功');
          hasProfile.value = true;
          // 重新获取最新数据
          getFarmerProfileData();
        } else {
          ElMessage.error(res.msg || '保存失败');
        }
      } catch (error) {
        console.error('保存农民资料出错:', error);
        ElMessage.error('保存农民资料出错');
      }
    } else {
      ElMessage.warning('请正确填写表单内容');
    }
  });
};

// 重置表单
const resetForm = () => {
  farmerFormRef.value.resetFields();
};

onMounted(() => {
  getUserInfo();
});
</script>

<style scoped>
.farmer-form {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
