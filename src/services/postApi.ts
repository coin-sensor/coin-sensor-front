import { api } from './api'
import { ApiResponse } from '../types/ApiResponse'

export interface PostResponse {
  postId: number
  categoryId: number
  categoryName: string
  userId: number
  title: string
  content: string
  writer: string
  createdAt: string
  viewCount: number
}

export interface PostListResponse {
  postId: number
  title: string
  writer: string
  createdAt: string
  viewCount: number
}

export interface PostCreateRequest {
  categoryId: number
  title: string
  content: string
}

export interface PostUpdateRequest {
  title: string
  content: string
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export const postApi = {
  async createPost(request: PostCreateRequest): Promise<PostResponse> {
    const response = await api.post<ApiResponse<PostResponse>>('/posts', request)
    return response.data.result
  },

  async getPosts(categoryName: string, page: number = 0, size: number = 10): Promise<PageResponse<PostListResponse>> {
    const response = await api.get<ApiResponse<PageResponse<PostListResponse>>>('/posts', {
      params: { categoryName, page, size }
    })
    return response.data.result
  },

  async getPost(postId: number): Promise<PostResponse> {
    const response = await api.get<ApiResponse<PostResponse>>(`/posts/${postId}`)
    return response.data.result
  },

  async updatePost(postId: number, request: PostUpdateRequest): Promise<PostResponse> {
    const response = await api.put<ApiResponse<PostResponse>>(`/posts/${postId}`, request)
    return response.data.result
  },

  async deletePost(postId: number): Promise<void> {
    await api.delete(`/posts/${postId}`)
  }
}