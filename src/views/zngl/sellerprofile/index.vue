<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="店铺名称" prop="shopName">
        <el-input
          v-model="queryParams.shopName"
          placeholder="请输入店铺名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系人姓名" prop="contactName">
        <el-input
          v-model="queryParams.contactName"
          placeholder="请输入联系人姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="审核状态" prop="approvalStatus">
        <el-input
          v-model="queryParams.approvalStatus"
          placeholder="请输入审核状态"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['zngl:sellerprofile:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['zngl:sellerprofile:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['zngl:sellerprofile:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['zngl:sellerprofile:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sellerprofileList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键" align="center" prop="id" /> -->
      <el-table-column label="用户" align="center" prop="userId" />
      <el-table-column label="店铺名称" align="center" prop="shopName" />
      <el-table-column label="联系人姓名" align="center" prop="contactName" />
      <el-table-column label="营业执照" align="center" prop="businessLicenseUrl" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.businessLicenseUrl" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="店铺地址" align="center" prop="shopAddress" />
      <el-table-column label="店铺描述" align="center" prop="shopDescription" />
      <el-table-column label="审核状态" align="center" prop="approvalStatus" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['zngl:sellerprofile:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['zngl:sellerprofile:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改卖家信息管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="sellerprofileRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户" />
        </el-form-item>
        <el-form-item label="店铺名称" prop="shopName">
          <el-input v-model="form.shopName" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="联系人姓名" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="营业执照" prop="businessLicenseUrl">
          <image-upload v-model="form.businessLicenseUrl"/>
        </el-form-item>
        <el-form-item label="店铺地址" prop="shopAddress">
          <el-input v-model="form.shopAddress" placeholder="请输入店铺地址" />
        </el-form-item>
        <el-form-item label="店铺描述" prop="shopDescription">
          <el-input v-model="form.shopDescription" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="审核状态" prop="approvalStatus">
          <el-input v-model="form.approvalStatus" placeholder="请输入审核状态" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Sellerprofile">
import { listSellerprofile, getSellerprofile, delSellerprofile, addSellerprofile, updateSellerprofile } from "@/api/zngl/sellerprofile";

const { proxy } = getCurrentInstance();

const sellerprofileList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    shopName: null,
    contactName: null,
    approvalStatus: null,
  },
  rules: {
    userId: [
      { required: true, message: "用户不能为空", trigger: "blur" }
    ],
    shopName: [
      { required: true, message: "店铺名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询卖家信息管理列表 */
function getList() {
  loading.value = true;
  listSellerprofile(queryParams.value).then(response => {
    sellerprofileList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    userId: null,
    shopName: null,
    contactName: null,
    businessLicenseUrl: null,
    shopAddress: null,
    shopDescription: null,
    approvalStatus: null,
    createTime: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("sellerprofileRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加卖家信息管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getSellerprofile(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改卖家信息管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["sellerprofileRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSellerprofile(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSellerprofile(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除卖家信息管理编号为"' + _ids + '"的数据项？').then(function() {
    return delSellerprofile(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('zngl/sellerprofile/export', {
    ...queryParams.value
  }, `sellerprofile_${new Date().getTime()}.xlsx`)
}

getList();
</script>
