export interface Product {
  produtoId: number;
  name: string;
  descricao?: string;
  preco: number;
  estoque: number;
  imagemUrl?: string;
  categoriaId: number;
}

export interface ProductFormData {
  Name: string;
  Descricao?: string;
  Preco: number;
  ImagemUrl?: string;
  CategoriaId: number;
}

export interface ProductResponse {
  produtoId: number;
  name: string;
  descricao?: string;
  preco: number;
  imagemUrl?: string;
  estoque: number;
  categoriaId: number;
}
