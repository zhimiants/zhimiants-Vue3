<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="快递公司" prop="deliveryCompany">
        <el-input
          v-model="queryParams.deliveryCompany"
          placeholder="请输入快递公司"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="快递单号" prop="deliveryNo">
        <el-input
          v-model="queryParams.deliveryNo"
          placeholder="请输入快递单号"
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
          v-hasPermi="['zngl:delivery:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['zngl:delivery:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['zngl:delivery:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['zngl:delivery:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="deliveryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键" align="center" prop="id" /> -->
      <el-table-column label="订单" align="center" prop="orderId" />
      <el-table-column label="快递公司" align="center" prop="deliveryCompany" />
      <el-table-column label="快递单号" align="center" prop="deliveryNo" />
      <el-table-column label="发货时间" align="center" prop="deliveryTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deliveryTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收货时间" align="center" prop="receiveTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.receiveTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配送状态" align="center" prop="deliveryStatus" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配送备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['zngl:delivery:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['zngl:delivery:remove']">删除</el-button>
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

    <!-- 添加或修改订单配送管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="deliveryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单" />
        </el-form-item>
        <el-form-item label="快递公司" prop="deliveryCompany">
          <el-input v-model="form.deliveryCompany" placeholder="请输入快递公司" />
        </el-form-item>
        <el-form-item label="快递单号" prop="deliveryNo">
          <el-input v-model="form.deliveryNo" placeholder="请输入快递单号" />
        </el-form-item>
        <el-form-item label="发货时间" prop="deliveryTime">
          <el-date-picker clearable
            v-model="form.deliveryTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择发货时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="收货时间" prop="receiveTime">
          <el-date-picker clearable
            v-model="form.receiveTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择收货时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="配送备注" prop="remark">
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

<script setup name="Delivery">
import { listDelivery, getDelivery, delDelivery, addDelivery, updateDelivery } from "@/api/zngl/delivery";

const { proxy } = getCurrentInstance();

const deliveryList = ref([]);
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
    orderId: null,
    deliveryCompany: null,
    deliveryNo: null,
    deliveryStatus: null,
  },
  rules: {
    orderId: [
      { required: true, message: "订单不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单配送管理列表 */
function getList() {
  loading.value = true;
  listDelivery(queryParams.value).then(response => {
    deliveryList.value = response.rows;
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
    orderId: null,
    deliveryCompany: null,
    deliveryNo: null,
    deliveryTime: null,
    receiveTime: null,
    deliveryStatus: null,
    createTime: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("deliveryRef");
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
  title.value = "添加订单配送管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getDelivery(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改订单配送管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deliveryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateDelivery(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDelivery(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除订单配送管理编号为"' + _ids + '"的数据项？').then(function() {
    return delDelivery(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('zngl/delivery/export', {
    ...queryParams.value
  }, `delivery_${new Date().getTime()}.xlsx`)
}

getList();
</script>
