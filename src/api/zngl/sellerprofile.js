import request from '@/utils/request'

// 查询卖家信息管理列表
export function listSellerprofile(query) {
  return request({
    url: '/zngl/sellerprofile/list',
    method: 'get',
    params: query
  })
}

// 查询卖家信息管理详细
export function getSellerprofile(id) {
  return request({
    url: '/zngl/sellerprofile/' + id,
    method: 'get'
  })
}

// 新增卖家信息管理
export function addSellerprofile(data) {
  return request({
    url: '/zngl/sellerprofile',
    method: 'post',
    data: data
  })
}

// 修改卖家信息管理
export function updateSellerprofile(data) {
  return request({
    url: '/zngl/sellerprofile',
    method: 'put',
    data: data
  })
}

// 删除卖家信息管理
export function delSellerprofile(id) {
  return request({
    url: '/zngl/sellerprofile/' + id,
    method: 'delete'
  })
}
