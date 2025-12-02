export interface Category {
  categoriaId: number;
  name: string;
  imagemUrl?: string;
}

export interface CategoryFormData {
  Name: string;
  ImagemUrl?: string;
}

export interface CategoryResponse {
  categoriaId: number;
  nome: string;
  imagemUrl?: string;
}
