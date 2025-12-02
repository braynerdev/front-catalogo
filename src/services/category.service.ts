import { api } from './api.service';
import { Category, CategoryFormData, CategoryResponse } from '../types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>('/api/Categoria/paginator');
    return response.data;
  },

  async getById(id: number): Promise<Category> {
    const response = await api.get<Category>(`/api/Categoria/${id}`);
    return response.data;
  },

  async create(data: CategoryFormData): Promise<CategoryResponse> {
    const response = await api.post<CategoryResponse>('/api/Categoria', data);
    return response.data;
  },

  async update(id: number, data: CategoryFormData): Promise<CategoryResponse> {
    const response = await api.put<CategoryResponse>(`/api/Categoria/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/Categoria/${id}`);
  },
};
