<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-input
          v-model="queryParams.status"
          placeholder="请输入订单状态"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收货人" prop="receiverName">
        <el-input
          v-model="queryParams.receiverName"
          placeholder="请输入收货人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="电话" prop="receiverPhone">
        <el-input
          v-model="queryParams.receiverPhone"
          placeholder="请输入电话"
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
          v-hasPermi="['zngl:base:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['zngl:base:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['zngl:base:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['zngl:base:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="baseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="订单号" align="center" prop="orderNo" />
      <el-table-column label="购买用户" align="center" prop="buyerUserId" />
      <el-table-column label="卖家用户" align="center" prop="sellerUserId" />
      <el-table-column label="金额(元)" align="center" prop="totalAmount" />
      <el-table-column label="订单状态" align="center" prop="status" />
      <el-table-column label="支付方式" align="center" prop="paymentMethod" />
      <el-table-column label="订单快照" align="center" prop="itemsSnapshot" />
      <el-table-column label="收货人" align="center" prop="receiverName" />
      <el-table-column label="电话" align="center" prop="receiverPhone" />
      <el-table-column label="地址" align="center" prop="receiverAddress" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['zngl:base:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['zngl:base:remove']">删除</el-button>
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

    <!-- 添加或修改订单管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="baseRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="购买用户" prop="buyerUserId">
          <el-input v-model="form.buyerUserId" placeholder="请输入购买用户" />
        </el-form-item>
        <el-form-item label="卖家用户" prop="sellerUserId">
          <el-input v-model="form.sellerUserId" placeholder="请输入卖家用户" />
        </el-form-item>
        <el-form-item label="金额(元)" prop="totalAmount">
          <el-input v-model="form.totalAmount" placeholder="请输入金额(元)" />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-input v-model="form.status" placeholder="请输入订单状态" />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-input v-model="form.paymentMethod" placeholder="请输入支付方式" />
        </el-form-item>
        <el-form-item label="订单快照" prop="itemsSnapshot">
          <el-input v-model="form.itemsSnapshot" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="form.receiverName" placeholder="请输入收货人" />
        </el-form-item>
        <el-form-item label="电话" prop="receiverPhone">
          <el-input v-model="form.receiverPhone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="地址" prop="receiverAddress">
          <el-input v-model="form.receiverAddress" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="订单备注" prop="remark">
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

<script setup name="Base">
import { listBase, getBase, delBase, addBase, updateBase } from "@/api/zngl/base";

const { proxy } = getCurrentInstance();

const baseList = ref([]);
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
    orderNo: null,
    status: null,
    receiverName: null,
    receiverPhone: null,
  },
  rules: {
    orderNo: [
      { required: true, message: "订单号不能为空", trigger: "blur" }
    ],
    buyerUserId: [
      { required: true, message: "购买用户不能为空", trigger: "blur" }
    ],
    sellerUserId: [
      { required: true, message: "卖家用户不能为空", trigger: "blur" }
    ],
    totalAmount: [
      { required: true, message: "金额(元)不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单管理列表 */
function getList() {
  loading.value = true;
  listBase(queryParams.value).then(response => {
    baseList.value = response.rows;
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
    orderNo: null,
    buyerUserId: null,
    sellerUserId: null,
    totalAmount: null,
    status: null,
    paymentMethod: null,
    itemsSnapshot: null,
    receiverName: null,
    receiverPhone: null,
    receiverAddress: null,
    createTime: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("baseRef");
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
  title.value = "添加订单管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getBase(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改订单管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["baseRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateBase(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBase(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除订单管理编号为"' + _ids + '"的数据项？').then(function() {
    return delBase(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('zngl/base/export', {
    ...queryParams.value
  }, `base_${new Date().getTime()}.xlsx`)
}

getList();
</script>
