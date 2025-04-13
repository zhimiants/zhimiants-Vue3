import request from '@/utils/request'

// 查询订单管理列表
export function listBase(query) {
  return request({
    url: '/zngl/base/list',
    method: 'get',
    params: query
  })
}

// 查询订单管理详细
export function getBase(id) {
  return request({
    url: '/zngl/base/' + id,
    method: 'get'
  })
}

// 新增订单管理
export function addBase(data) {
  return request({
    url: '/zngl/base',
    method: 'post',
    data: data
  })
}

// 修改订单管理
export function updateBase(data) {
  return request({
    url: '/zngl/base',
    method: 'put',
    data: data
  })
}

// 删除订单管理
export function delBase(id) {
  return request({
    url: '/zngl/base/' + id,
    method: 'delete'
  })
}
