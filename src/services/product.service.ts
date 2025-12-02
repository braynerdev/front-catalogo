import { api } from './api.service';
import { Product, ProductFormData, ProductResponse } from '../types';

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get<Product[]>('/api/Produto/paginator');
    return response.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/api/Produto/${id}`);
    return response.data;
  },

  async getByCategory(categoryId: number): Promise<Product[]> {
    const response = await api.get<Product[]>(`/api/Produto/categoria/${categoryId}`);
    return response.data;
  },

  async create(data: ProductFormData): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>('/api/Produto', data);
    return response.data;
  },

  async update(id: number, data: ProductFormData): Promise<ProductResponse> {
    const response = await api.put<ProductResponse>(`/api/Produto/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/Produto/${id}`);
  },
};
