import request from '@/utils/request'

// 查询农民信息管理列表
export function listProfile(query) {
  return request({
    url: '/zngl/profile/list',
    method: 'get',
    params: query
  })
}

// 查询农民信息管理详细
export function getProfile(id) {
  return request({
    url: '/zngl/profile/' + id,
    method: 'get'
  })
}

// 新增农民信息管理
export function addProfile(data) {
  return request({
    url: '/zngl/profile',
    method: 'post',
    data: data
  })
}

// 修改农民信息管理
export function updateProfile(data) {
  return request({
    url: '/zngl/profile',
    method: 'put',
    data: data
  })
}

// 删除农民信息管理
export function delProfile(id) {
  return request({
    url: '/zngl/profile/' + id,
    method: 'delete'
  })
}
