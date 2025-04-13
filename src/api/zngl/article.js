import request from '@/utils/request'

// 查询农业资讯管理列表
export function listArticle(query) {
  return request({
    url: '/zngl/article/list',
    method: 'get',
    params: query
  })
}

// 查询农业资讯管理详细
export function getArticle(id) {
  return request({
    url: '/zngl/article/' + id,
    method: 'get'
  })
}

// 新增农业资讯管理
export function addArticle(data) {
  return request({
    url: '/zngl/article',
    method: 'post',
    data: data
  })
}

// 修改农业资讯管理
export function updateArticle(data) {
  return request({
    url: '/zngl/article',
    method: 'put',
    data: data
  })
}

// 删除农业资讯管理
export function delArticle(id) {
  return request({
    url: '/zngl/article/' + id,
    method: 'delete'
  })
}
