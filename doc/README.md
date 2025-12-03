# Documentação Técnica - Sistema de Catálogo

## Visão Geral

Sistema mobile desenvolvido em React Native com Expo para gerenciamento de catálogo de produtos e categorias. A aplicação implementa autenticação JWT, operações CRUD completas e gerenciamento de estoque em tempo real.

## Stack Tecnológica

### Core
- **React Native** 0.81.5
- **Expo** ~52.0.11
- **TypeScript** 5.3.3
- **React** 19.1.0

### UI Framework
- **React Native Paper** 5.12.5
- **React Native Safe Area Context** 4.15.2
- **Expo Vector Icons** 14.0.4

### Networking & Storage
- **Axios** 1.7.9
- **Async Storage** 2.1.0

### Navegação & Estado
- Gerenciamento de estado via Context API
- Navegação imperativa baseada em estado

## Arquitetura

### Estrutura de Diretórios

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Componentes base (Button, Input, etc)
│   ├── CategoryCard.tsx
│   ├── ProductCard.tsx
│   ├── CategoryPicker.tsx
│   ├── CategorySearchPicker.tsx
│   └── ...
├── contexts/           # Context providers
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
│   ├── useToast.ts
│   ├── usePermissions.ts
│   └── useFormValidation.ts
├── screens/            # Telas da aplicação
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── HomeScreen.tsx
│   ├── CategoriesScreen.tsx
│   ├── ProductsScreen.tsx
│   ├── CategoryFormScreen.tsx
│   └── ProductFormScreen.tsx
├── services/           # Camada de API
│   ├── api.service.ts
│   ├── auth.service.ts
│   ├── category.service.ts
│   ├── product.service.ts
│   └── upload.service.ts
├── types/              # Definições TypeScript
│   ├── auth.types.ts
│   ├── category.types.ts
│   ├── product.types.ts
│   └── navigation.types.ts
├── utils/              # Utilitários
│   └── error.parser.ts
└── config/             # Configurações
    ├── api.config.ts
    └── theme.ts
```

### Padrões Arquiteturais

#### 1. Service Layer Pattern
Toda comunicação com API é centralizada em services:

```typescript
// Exemplo: product.service.ts
export const productService = {
  async getAll(page, pageSize, name?, active?, categoriaId?): Promise<PaginatedResponse>
  async getById(id): Promise<Product>
  async create(data): Promise<ProductResponse>
  async update(id, data): Promise<ProductResponse>
  async activate(id): Promise<void>
  async deactivate(id): Promise<void>
  async adicionarEstoque(id, quantidade): Promise<void>
  async removerEstoque(id, quantidade): Promise<void>
}
```

#### 2. Context API para Estado Global
AuthContext gerencia autenticação e sessão:

```typescript
interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

#### 3. Custom Hooks para Lógica Reutilizável
- `useToast`: Notificações toast
- `usePermissions`: Controle de acesso (simplificado)
- `useFormValidation`: Validação de formulários

## Componentes Principais

### CategoryCard
Exibe informações de categoria com ações de edição e ativação/desativação.

**Props:**
```typescript
{
  category: Category
  isActive: boolean
  onEdit: (category: Category) => void
  onToggleStatus: (category: Category) => void
}
```

### ProductCard
Card de produto com gerenciamento de estoque integrado.

**Props:**
```typescript
{
  product: Product
  isActive: boolean
  categoryName?: string
  onEdit: (product: Product) => void
  onToggleStatus: (product: Product) => void
  onStockChange?: () => void
}
```

**Funcionalidades:**
- Exibição de imagem, preço e estoque
- Botões de incremento/decremento de estoque
- Validação de quantidade (1-1000)
- Verificação de estoque disponível antes de remover

### CategorySearchPicker
Componente de busca e seleção de categoria com debounce.

**Características:**
- Debounce de 500ms para evitar sobrecarga de requisições
- Busca paginada (20 resultados)
- Exibição em chip da categoria selecionada

## Serviços

### api.service.ts
Configuração centralizada do Axios com interceptors.

**Interceptors:**
- Request: Adiciona token de autenticação
- Response: Gerencia renovação automática de token (401)
- Error: Trata erros de rede e autenticação

```typescript
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### auth.service.ts
Gerenciamento de autenticação e persistência de sessão.

**Métodos:**
- `login(credentials)`: Autenticação com credenciais
- `register(data)`: Registro de novo usuário
- `logout(username)`: Revogação de token e limpeza de sessão
- `saveAuthData()`: Persistência em AsyncStorage
- `clearAuthData()`: Limpeza de dados de autenticação

### category.service.ts & product.service.ts
Operações CRUD com suporte a paginação e filtros.

**Paginação:**
```typescript
interface PaginatedResponse {
  items: T[]
  currentPage: number
  totalPages: number
  totalItems: number
}
```

**Filtros:**
- Nome (busca textual)
- Status ativo/inativo
- Categoria (produtos)

## Gerenciamento de Estado

### AuthContext
Provider global de autenticação que encapsula:
- Estado de autenticação do usuário
- Métodos de login/logout/registro
- Verificação automática de sessão no mount
- Renovação automática de token

### Estado Local
Componentes utilizam `useState` para estado local:
- Estados de formulário
- Loading states
- Dados de paginação
- Filtros temporários

## Validações

### Formulários
Validação em múltiplos níveis:

1. **Client-side imediata:** Feedback visual instantâneo
2. **Pre-submit:** Validação completa antes de enviar
3. **Server-side:** Tratamento de erros do backend

**Exemplo - ProductFormScreen:**
```typescript
const validateForm = (): boolean => {
  if (!nome.trim()) {
    showToast('Nome do produto é obrigatório', 'error')
    return false
  }
  
  const precoNumerico = parseFloat(preco.replace(',', '.'))
  if (!preco || isNaN(precoNumerico) || precoNumerico <= 0) {
    showToast('Preço deve ser maior que zero', 'error')
    return false
  }
  
  if (!categoriaId) {
    showToast('Selecione uma categoria', 'error')
    return false
  }
  
  return true
}
```

### Estoque
Validações específicas para operações de estoque:

```typescript
// Validação de quantidade
if (!quantity || quantity <= 0) {
  setError('Quantidade deve ser maior que zero')
  return
}

// Limite máximo
if (quantity > 1000) {
  setError('Quantidade máxima é 1000 por operação')
  return
}

// Validação de remoção
if (stockAction === 'remove' && quantity > currentStock) {
  setError(`Estoque insuficiente. Disponível: ${currentStock}`)
  return
}
```

## Tratamento de Erros

### Hierarquia de Tratamento

1. **Try-Catch em Services:** Primeira linha de defesa
2. **Interceptors do Axios:** Erros HTTP globais
3. **Error Boundaries:** Erros de renderização (futuro)
4. **User Feedback:** Toast notifications

### Error Parser
Utilitário para mapear erros do backend para campos de formulário:

```typescript
export const parseBackendErrors = (error: any): ParsedErrors => {
  const parsedErrors: ParsedErrors = {}
  
  if (error?.response?.data?.errors) {
    Object.keys(error.response.data.errors).forEach((key) => {
      const fieldName = detectFieldFromMessage(key)
      parsedErrors[fieldName] = error.response.data.errors[key][0]
    })
  }
  
  return parsedErrors
}
```

## Otimizações de Performance

### Debounce em Buscas
CategorySearchPicker implementa debounce de 500ms:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery.length > 0) {
      loadCategories(searchQuery)
    }
  }, 500)
  
  return () => clearTimeout(timer)
}, [searchQuery])
```

### Paginação
Carregamento lazy com controle de página:

```typescript
const loadProducts = async (page: number, search?: string) => {
  const data = await productService.getAll(page, pageSize, search, isActive)
  setProducts(data.items)
  setCurrentPage(data.currentPage)
  setTotalPages(data.totalPages)
}
```

### Memoização
Callbacks estabilizados para evitar re-renders desnecessários em listas.

## Segurança

### Autenticação JWT
- Token armazenado em AsyncStorage
- Refresh token automático em requisições
- Interceptor para adicionar Authorization header
- Limpeza de sessão em logout/expiração

### Sanitização de Entrada
- Trim em campos de texto
- Validação de tipos numéricos
- Escape de caracteres especiais em URLs

### Permissões
Sistema simplificado: usuário autenticado possui acesso total.

```typescript
export const usePermissions = () => {
  const { user } = useAuth()
  
  const hasPermission = (): boolean => {
    return !!user
  }
  
  return { hasPermission, hasAnyPermission, hasAllPermissions }
}
```

## Configurações

### API Config
Centralização de endpoints e chaves:

```typescript
export const API_CONFIG: ApiConfig = {
  BASE_URL: 'http://192.168.0.102:5000',
  ENDPOINTS: {
    LOGIN: '/api/Auth/login',
    REGISTER: '/api/Auth/register',
    REFRESH_TOKEN: '/api/Auth/refresh-token',
    REVOKE: '/api/Auth/revoke-token',
  },
  STORAGE_KEYS: {
    ACCESS_TOKEN: '@app:access_token',
    REFRESH_TOKEN: '@app:refresh_token',
    USER: '@app:user',
  },
}
```

### Theme
Tema baseado em Material Design 3:

```typescript
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200EE',
    secondary: '#03DAC6',
    error: '#B00020',
  },
}
```

## Testes

### Estratégia de Testes (Recomendada)
1. **Unit Tests:** Services e utilities
2. **Integration Tests:** Fluxos de autenticação
3. **E2E Tests:** Fluxos críticos de usuário

### Ferramentas Sugeridas
- Jest para unit tests
- React Native Testing Library para component tests
- Detox para E2E tests

## Deployment

### Build de Produção
```bash
# Android
expo build:android

# iOS
expo build:ios
```

### Variáveis de Ambiente
Configurar `.env` com:
```
API_BASE_URL=https://api.production.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_preset
```

