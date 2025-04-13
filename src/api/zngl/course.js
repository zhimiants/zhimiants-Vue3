import request from '@/utils/request'

// 查询农业培训管理列表
export function listCourse(query) {
  return request({
    url: '/zngl/course/list',
    method: 'get',
    params: query
  })
}

// 查询农业培训管理详细
export function getCourse(id) {
  return request({
    url: '/zngl/course/' + id,
    method: 'get'
  })
}

// 新增农业培训管理
export function addCourse(data) {
  return request({
    url: '/zngl/course',
    method: 'post',
    data: data
  })
}

// 修改农业培训管理
export function updateCourse(data) {
  return request({
    url: '/zngl/course',
    method: 'put',
    data: data
  })
}

// 删除农业培训管理
export function delCourse(id) {
  return request({
    url: '/zngl/course/' + id,
    method: 'delete'
  })
}
