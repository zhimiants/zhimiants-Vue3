import request from '@/utils/request'

// 查询订单配送管理列表
export function listDelivery(query) {
  return request({
    url: '/zngl/delivery/list',
    method: 'get',
    params: query
  })
}

// 查询订单配送管理详细
export function getDelivery(id) {
  return request({
    url: '/zngl/delivery/' + id,
    method: 'get'
  })
}

// 新增订单配送管理
export function addDelivery(data) {
  return request({
    url: '/zngl/delivery',
    method: 'post',
    data: data
  })
}

// 修改订单配送管理
export function updateDelivery(data) {
  return request({
    url: '/zngl/delivery',
    method: 'put',
    data: data
  })
}

// 删除订单配送管理
export function delDelivery(id) {
  return request({
    url: '/zngl/delivery/' + id,
    method: 'delete'
  })
}
