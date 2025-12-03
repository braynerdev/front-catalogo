import { api } from './api.service';
import { Product, ProductFormData, ProductResponse } from '../types';

interface PaginatedResponse {
  items: Product[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export const productService = {
  async getAll(
    page: number = 1,
    pageSize: number = 5,
    name?: string,
    active: boolean = true,
    categoriaId?: number
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
      
      if (categoriaId) {
        params.CategoriaId = categoriaId;
      }
      
      const response = await api.get<any>('/api/Produto/paginator', { params });
      
      const mapProducts = (items: any[]): Product[] => {
        return items.map((item: any) => {
          return {
            produtoId: item.id || item.produtoId,
            name: item.name,
            descricao: item.descricao || item.description,
            preco: parseFloat(item.preco || item.price || 0),
            estoque: parseInt(item.estoque || item.stock || 0),
            imagemUrl: item.imagemUrl,
            categoriaId: item.categoriaId || item.categoryId,
          };
        });
      };
      
      if (response.data?.valid && response.data?.data?.items && Array.isArray(response.data.data.items)) {
        const backendData = response.data.data;
        const paginator = backendData.paginator || {};
        
        return {
          items: mapProducts(backendData.items),
          currentPage: paginator.currentPag || paginator.currentPage || page,
          totalPages: paginator.totalPages || 1,
          totalItems: paginator.totalCount || paginator.totalItems || backendData.items.length,
        };
      }
      
      if (response.data?.items && Array.isArray(response.data.items)) {
        return {
          items: mapProducts(response.data.items),
          currentPage: page,
          totalPages: 1,
          totalItems: response.data.items.length,
        };
      }
      
      if (Array.isArray(response.data)) {
        return {
          items: mapProducts(response.data),
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

  async getById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/api/Produto/${id}`);
    return response.data;
  },

  async getByCategory(categoryId: number): Promise<Product[]> {
    const response = await api.get<Product[]>(`/api/Produto/categoria/${categoryId}`);
    return response.data;
  },

  async create(data: ProductFormData): Promise<ProductResponse> {
    const response = await api.post<any>('/api/Produto/created', data);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao criar produto');
    }
    return response.data;
  },

  async update(id: number, data: ProductFormData): Promise<ProductResponse> {
    const response = await api.put<any>(`/api/Produto/${id}`, data);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao atualizar produto');
    }
    return response.data;
  },

  async activate(id: number): Promise<void> {
    const response = await api.patch<any>(`/api/Produto/activate/${id}`);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao ativar produto');
    }
  },

  async deactivate(id: number): Promise<void> {
    const response = await api.patch<any>(`/api/Produto/deactivate/${id}`);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao desativar produto');
    }
  },

  async adicionarEstoque(id: number, quantidade: number): Promise<void> {
    const response = await api.patch<any>(`/api/Produto/${id}/estoque/add`, [
      { op: 'replace', path: '/Estoque', value: quantidade }
    ]);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao adicionar estoque');
    }
  },

  async removerEstoque(id: number, quantidade: number): Promise<void> {
    const response = await api.patch<any>(`/api/Produto/${id}/estoque/Remover`, [
      { op: 'replace', path: '/Estoque', value: quantidade }
    ]);
    if (!response.data?.valid) {
      throw new Error(response.data?.message || 'Erro ao remover estoque');
    }
  },
};
