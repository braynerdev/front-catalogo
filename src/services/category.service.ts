import { api } from './api.service';
import { Category, CategoryFormData, CategoryResponse } from '../types';

interface PaginatedResponse {
  items: Category[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export const categoryService = {
  async getAll(
    page: number = 1, 
    pageSize: number = 5,
    name?: string,
    active: boolean = true
  ): Promise<PaginatedResponse> {
    try {
      const params: any = {
        Active: active,
        NumberPage: page,
        PageSize: pageSize,
      };
      
      if (name && name.trim()) {
        params.Name = name.trim();
      }
      
      const response = await api.get<any>('/api/Categoria/paginator', { params });
      
      const mapCategories = (items: any[]): Category[] => {
        return items.map((item: any) => ({
          categoriaId: item.id || item.categoriaId,
          name: item.name,
          imagemUrl: item.imagemUrl,
        }));
      };
      
      if (response.data?.valid && response.data?.data?.items && Array.isArray(response.data.data.items)) {
        const backendData = response.data.data;
        const paginator = backendData.paginator || {};
        
        return {
          items: mapCategories(backendData.items),
          currentPage: paginator.currentPag || paginator.currentPage || page,
          totalPages: paginator.totalPages || 1,
          totalItems: paginator.totalCount || paginator.totalItems || backendData.items.length,
        };
      }
      
      if (response.data?.items && Array.isArray(response.data.items)) {
        return {
          items: mapCategories(response.data.items),
          currentPage: page,
          totalPages: 1,
          totalItems: response.data.items.length,
        };
      }
      
      if (Array.isArray(response.data)) {
        return {
          items: mapCategories(response.data),
          currentPage: page,
          totalPages: 1,
          totalItems: response.data.length,
        };
      }
      
      return { items: [], currentPage: 1, totalPages: 1, totalItems: 0 };
    } catch (error: any) {
      return { items: [], currentPage: 1, totalPages: 1, totalItems: 0 };
    }
  },

  async getById(id: number): Promise<Category> {
    const response = await api.get<Category>(`/api/Categoria/${id}`);
    return response.data;
  },

  async create(data: CategoryFormData): Promise<CategoryResponse> {
    const response = await api.post<any>('/api/Categoria', data);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao criar categoria');
    }
    return response.data;
  },

  async update(id: number, data: CategoryFormData): Promise<CategoryResponse> {
    const response = await api.put<any>(`/api/Categoria/${id}`, data);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao atualizar categoria');
    }
    return response.data;
  },

  async activate(id: number): Promise<void> {
    const response = await api.patch<any>(`/activate/${id}`);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao ativar categoria');
    }
  },

  async deactivate(id: number): Promise<void> {
    const response = await api.patch<any>(`/deactivate/${id}`);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao desativar categoria');
    }
  },
};
