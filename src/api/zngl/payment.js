import request from '@/utils/request'

// 查询订单支付管理列表
export function listPayment(query) {
  return request({
    url: '/zngl/payment/list',
    method: 'get',
    params: query
  })
}

// 查询订单支付管理详细
export function getPayment(id) {
  return request({
    url: '/zngl/payment/' + id,
    method: 'get'
  })
}

// 新增订单支付管理
export function addPayment(data) {
  return request({
    url: '/zngl/payment',
    method: 'post',
    data: data
  })
}

// 修改订单支付管理
export function updatePayment(data) {
  return request({
    url: '/zngl/payment',
    method: 'put',
    data: data
  })
}

// 删除订单支付管理
export function delPayment(id) {
  return request({
    url: '/zngl/payment/' + id,
    method: 'delete'
  })
}
