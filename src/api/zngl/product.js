import request from '@/utils/request'

// 查询农资商品管理列表
export function listProduct(query) {
  return request({
    url: '/zngl/product/list',
    method: 'get',
    params: query
  })
}

// 查询农资商品管理详细
export function getProduct(id) {
  return request({
    url: '/zngl/product/' + id,
    method: 'get'
  })
}

// 新增农资商品管理
export function addProduct(data) {
  return request({
    url: '/zngl/product',
    method: 'post',
    data: data
  })
}

// 修改农资商品管理
export function updateProduct(data) {
  return request({
    url: '/zngl/product',
    method: 'put',
    data: data
  })
}

// 删除农资商品管理
export function delProduct(id) {
  return request({
    url: '/zngl/product/' + id,
    method: 'delete'
  })
}
