# Detalhes Técnicos de Implementação

## Gerenciamento de Requisições HTTP

### Configuração do Cliente Axios

A instância centralizada do Axios é configurada em `api.service.ts` com timeout de 10 segundos e headers padrão:

```typescript
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### Interceptors

#### Request Interceptor
Adiciona o token JWT em todas as requisições autenticadas:

```typescript
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

#### Response Interceptor
Implementa mecanismo de renovação automática de token:

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      const refreshToken = await AsyncStorage.getItem(
        API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN
      )
      
      return api.post('/api/Auth/refresh-token', {
        accessToken: await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN),
        tokenRefresh: refreshToken,
      })
      .then(async (response) => {
        const { accessToken } = response.data.data
        await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken)
        
        processQueue(null, accessToken)
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      })
      .catch((err) => {
        processQueue(err, null)
        clearAuthData()
        return Promise.reject(err)
      })
      .finally(() => {
        isRefreshing = false
      })
    }
    
    return Promise.reject(error)
  }
)
```

### Fila de Requisições Pendentes

Durante renovação de token, requisições são enfileiradas:

```typescript
let failedQueue: any[] = []
let isRefreshing = false

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}
```

## Paginação e Filtros

### Interface de Resposta Paginada

```typescript
interface PaginatedResponse<T> {
  items: T[]
  currentPage: number
  totalPages: number
  totalItems: number
}
```

### Mapeamento de Resposta do Backend

O backend retorna estrutura aninhada que precisa ser extraída:

```typescript
const mapPaginatedResponse = (response: any): PaginatedResponse => {
  if (response.data?.valid && response.data?.data?.items) {
    const backendData = response.data.data
    const paginator = backendData.paginator || {}
    
    return {
      items: mapItems(backendData.items),
      currentPage: paginator.currentPag || paginator.currentPage || 1,
      totalPages: paginator.totalPages || 1,
      totalItems: paginator.totalCount || paginator.totalItems || 0,
    }
  }
  
  return { items: [], currentPage: 1, totalPages: 1, totalItems: 0 }
}
```

### Construção de Parâmetros de Filtro

```typescript
const params: any = {
  Active: active,
  NumberPage: page,
  PageSize: pageSize,
}

if (name && name.trim()) {
  params.Name = name.trim()
}

if (categoriaId) {
  params.CategoriaId = categoriaId
}
```

### Controle de Paginação em Componentes

```typescript
const [currentPage, setCurrentPage] = useState(1)
const [totalPages, setTotalPages] = useState(1)
const pageSize = 5

const goToNextPage = () => {
  if (currentPage < totalPages) {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    loadItems(nextPage, searchQuery)
  }
}

const goToPreviousPage = () => {
  if (currentPage > 1) {
    const prevPage = currentPage - 1
    setCurrentPage(prevPage)
    loadItems(prevPage, searchQuery)
  }
}
```

## Formatação de Dados

### Conversão de Preços

Tratamento bidirecional entre formato brasileiro e formato numérico:

```typescript
// Display → API
const precoNumerico = parseFloat(preco.replace(',', '.'))
// "199,99" → 199.99

// API → Display
const precoFormatado = product.preco?.toFixed(2).replace('.', ',')
// 199.99 → "199,99"
```

### Validação de Preço

```typescript
const validatePreco = (preco: string): boolean => {
  const precoNumerico = parseFloat(preco.replace(',', '.'))
  return !isNaN(precoNumerico) && precoNumerico > 0
}
```

### Mapeamento de IDs

Backend retorna `id`, frontend usa nomenclatura específica:

```typescript
// Categoria
categoriaId: item.id || item.categoriaId

// Produto
produtoId: item.id || item.produtoId
```

### Parsing de Números

Conversão robusta para garantir tipos numéricos:

```typescript
preco: parseFloat(item.preco || item.price || 0)
estoque: parseInt(item.estoque || item.stock || 0)
```

## Validações

### Validação de Estoque

Regras de negócio implementadas no frontend:

```typescript
const validateStockOperation = (
  action: 'add' | 'remove',
  quantity: number,
  currentStock: number
): string | null => {
  if (!quantity || quantity <= 0) {
    return 'Quantidade deve ser maior que zero'
  }
  
  if (quantity > 1000) {
    return 'Quantidade máxima é 1000 por operação'
  }
  
  if (action === 'remove' && quantity > currentStock) {
    return `Estoque insuficiente. Disponível: ${currentStock}`
  }
  
  return null
}
```

### Validação de Formulário

Pattern de validação replicado em formulários:

```typescript
const validateForm = (): boolean => {
  const errors: Record<string, string> = {}
  
  if (!nome.trim()) {
    errors.nome = 'Nome é obrigatório'
  }
  
  if (nome.trim().length < 3) {
    errors.nome = 'Nome deve ter no mínimo 3 caracteres'
  }
  
  if (!categoriaId) {
    errors.categoria = 'Selecione uma categoria'
  }
  
  if (Object.keys(errors).length > 0) {
    showToast(Object.values(errors)[0], 'error')
    return false
  }
  
  return true
}
```

## Upload de Imagens

### Fluxo Completo

1. Seleção de imagem via Expo Image Picker
2. Conversão para Blob
3. Construção de FormData
4. Upload para Cloudinary
5. Retorno de URL pública

```typescript
const uploadImage = async (imageUri: string): Promise<string> => {
  const response = await fetch(imageUri)
  const blob = await response.blob()
  
  const formData = new FormData()
  formData.append('file', blob)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME)
  
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )
  
  const data = await uploadResponse.json()
  return data.secure_url
}
```

### Permissões de Sistema

Verificação e solicitação de permissões:

```typescript
const requestPermissions = async (): Promise<boolean> => {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  
  if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
    Alert.alert(
      'Permissões necessárias',
      'Precisamos de acesso à câmera e galeria.'
    )
    return false
  }
  
  return true
}
```

## Otimizações

### Debounce em Buscas

Implementação de debounce para evitar sobrecarga de requisições:

```typescript
const [searchQuery, setSearchQuery] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery.length > 0) {
      performSearch(searchQuery)
    }
  }, 500)
  
  return () => clearTimeout(timer)
}, [searchQuery])
```

### Memoização de Callbacks

Estabilização de referências de funções:

```typescript
const handleEdit = useCallback((item: Product) => {
  onNavigateToForm?.(item)
}, [onNavigateToForm])

const handleToggleStatus = useCallback((item: Product) => {
  setItemToToggle(item)
}, [])
```

### FlatList Otimizado

Configurações para performance em listas:

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id.toString()}
  initialNumToRender={5}
  maxToRenderPerBatch={5}
  windowSize={5}
  removeClippedSubviews={true}
  onRefresh={handleRefresh}
  refreshing={isRefreshing}
/>
```

### Validação de Renderização

Prevenção de erros em items inválidos:

```typescript
const renderItem = ({ item }: { item: Product }) => {
  if (!item || !item.produtoId) {
    return null
  }
  
  return <ProductCard product={item} {...props} />
}
```

## Tratamento de Estados

### Estados de Carregamento

Hierarquia de loading states:

```typescript
const [isLoading, setIsLoading] = useState(false)       // Loading inicial
const [isRefreshing, setIsRefreshing] = useState(false) // Pull-to-refresh
const [isLoadingMore, setIsLoadingMore] = useState(false) // Paginação

const loadData = async (page: number) => {
  if (page === 1) {
    setIsLoading(true)
  } else {
    setIsLoadingMore(true)
  }
  
  try {
    const data = await fetchData(page)
    setItems(data)
  } finally {
    setIsLoading(false)
    setIsLoadingMore(false)
  }
}
```

### Estados de Erro

```typescript
const [error, setError] = useState<string | null>(null)

const handleError = (err: any) => {
  const message = err.response?.data?.message || err.message || 'Erro desconhecido'
  setError(message)
  showToast(message, 'error')
}
```

### Estados Vazios

Renderização condicional para listas vazias:

```typescript
{items.length === 0 && !isLoading && (
  <EmptyState
    icon="package-variant"
    message="Nenhum produto encontrado"
    action={{
      label: "Adicionar Produto",
      onPress: () => onNavigateToForm?.()
    }}
  />
)}
```

## Componentes Customizados

### AppTextInput

Wrapper sobre TextInput do Paper com validação integrada:

```typescript
interface AppTextInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  error?: string
  disabled?: boolean
  multiline?: boolean
  keyboardType?: KeyboardTypeOptions
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  ...props
}) => (
  <View style={styles.container}>
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      mode="outlined"
      error={!!error}
      {...props}
    />
    {error && (
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    )}
  </View>
)
```

### AppButton

Botão padronizado com estados:

```typescript
interface AppButtonProps {
  children: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  mode?: 'text' | 'outlined' | 'contained'
}

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  onPress,
  loading,
  disabled,
  mode = 'contained',
  ...props
}) => (
  <Button
    mode={mode}
    onPress={onPress}
    loading={loading}
    disabled={disabled || loading}
    contentStyle={styles.buttonContent}
    {...props}
  >
    {children}
  </Button>
)
```

### CategoryPicker

Dropdown de seleção de categoria:

```typescript
const [visible, setVisible] = useState(false)

<Menu
  visible={visible}
  onDismiss={() => setVisible(false)}
  anchor={
    <Button
      mode="outlined"
      onPress={() => setVisible(true)}
      disabled={disabled}
    >
      {selectedCategory?.name || placeholder}
    </Button>
  }
>
  {categories.map(category => (
    <Menu.Item
      key={category.categoriaId}
      title={category.name}
      onPress={() => {
        onSelectCategory(category.categoriaId)
        setVisible(false)
      }}
    />
  ))}
</Menu>
```

## Persistência de Dados

### AsyncStorage

Estrutura de chaves organizadas:

```typescript
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@app:access_token',
  REFRESH_TOKEN: '@app:refresh_token',
  USER: '@app:user',
}
```

### Operações de Leitura/Escrita

```typescript
// Salvar múltiplos valores
await AsyncStorage.multiSet([
  [STORAGE_KEYS.USER, JSON.stringify(user)],
  [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
  [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
])

// Ler múltiplos valores
const [[, userStr], [, token], [, refreshToken]] = await AsyncStorage.multiGet([
  STORAGE_KEYS.USER,
  STORAGE_KEYS.ACCESS_TOKEN,
  STORAGE_KEYS.REFRESH_TOKEN,
])

const user = userStr ? JSON.parse(userStr) : null
```

### Limpeza de Dados

```typescript
const clearAuthData = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.USER,
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
  ])
}
```

## Temas e Estilos

### Configuração de Tema

```typescript
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper'

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200EE',
    secondary: '#03DAC6',
    error: '#B00020',
    background: '#FFFFFF',
    surface: '#FFFFFF',
  },
}
```

### Padrões de Estilo

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  button: {
    marginTop: 16,
  },
})
```

### Estilização Inline para Estados Dinâmicos

```typescript
<IconButton
  icon={isActive ? 'close-circle' : 'check-circle'}
  iconColor={isActive ? '#EF4444' : '#10B981'}
  style={[
    styles.iconButton,
    isActive && styles.activeButton
  ]}
/>
```

## Tipagem TypeScript

### Interfaces de Domínio

```typescript
interface Product {
  produtoId: number
  name: string
  descricao?: string
  preco: number
  estoque: number
  imagemUrl?: string
  categoriaId: number
}

interface Category {
  categoriaId: number
  name: string
  imagemUrl?: string
}
```

### Interfaces de Formulário

```typescript
interface ProductFormData {
  Name: string
  Descricao?: string
  Preco: number
  ImagemUrl?: string
  CategoriaId: number
}
```

### Tipos de Resposta

```typescript
interface ApiResponse<T> {
  valid: boolean
  message: string
  data: T
}

interface ProductResponse {
  produtoId: number
  name: string
  descricao?: string
  preco: number
  imagemUrl?: string
  estoque: number
  categoriaId: number
}
```

### Tipos de Props

```typescript
interface ProductCardProps {
  product: Product
  isActive: boolean
  categoryName?: string
  onEdit: (product: Product) => void
  onToggleStatus: (product: Product) => void
  onStockChange?: () => void
}
```

## Patterns e Best Practices

### Container/Presenter Pattern

Separação de lógica e apresentação:

```typescript
// Container (Screen)
const ProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    loadProducts()
  }, [])
  
  const loadProducts = async () => {
    setLoading(true)
    const data = await productService.getAll()
    setProducts(data.items)
    setLoading(false)
  }
  
  return (
    <ProductList
      products={products}
      loading={loading}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}

// Presenter (Component)
const ProductList = ({ products, loading, onEdit, onDelete }) => {
  if (loading) return <LoadingScreen />
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      )}
    />
  )
}
```

### Custom Hooks para Lógica Reutilizável

```typescript
const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info' as 'info' | 'success' | 'error',
  })
  
  const showToast = (message: string, type = 'info') => {
    setToast({ visible: true, message, type })
  }
  
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }))
  }
  
  return { toast, showToast, hideToast }
}
```

### Service Layer

Centralização de lógica de API:

```typescript
export const productService = {
  async getAll(...params): Promise<PaginatedResponse<Product>> {
    // Lógica de requisição
  },
  
  async getById(id: number): Promise<Product> {
    // Lógica de requisição
  },
  
  async create(data: ProductFormData): Promise<ProductResponse> {
    // Lógica de requisição
  },
}
```

### Error Boundary Pattern (Recomendado)

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} />
    }
    
    return this.props.children
  }
}
```

## Performance Monitoring

### Estratégias de Medição

```typescript
const measureRenderTime = (componentName: string) => {
  const startTime = performance.now()
  
  useEffect(() => {
    const endTime = performance.now()
    console.log(`${componentName} rendered in ${endTime - startTime}ms`)
  })
}
```

### Bundle Size Analysis

```bash
npx expo-cli export --public-url https://example.com
# Analisar tamanho dos bundles gerados
```

## Segurança

### Sanitização de Entrada

```typescript
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 255)
}
```

### Proteção contra XSS

React Native não renderiza HTML por padrão, mas cuidado com:

```typescript
// EVITAR
<WebView source={{ html: userInput }} />

// PREFERIR
<Text>{userInput}</Text>
```

### Validação de URLs

```typescript
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return url.startsWith('https://')
  } catch {
    return false
  }
}
```

## Logging e Debugging

### Console Structured Logging

```typescript
const log = {
  info: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`ℹ️ [INFO] ${message}`, data || '')
    }
  },
  error: (message: string, error?: any) => {
    console.error(`❌ [ERROR] ${message}`, error || '')
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ [WARN] ${message}`, data || '')
  },
}
```

### React Native Debugger

Configuração para debugging:

1. Instalar React Native Debugger
2. Habilitar Remote JS Debugging
3. Usar Redux DevTools para inspeção de estado
4. Network inspector para requisições

## Testes

### Unit Tests

```typescript
import { render, fireEvent } from '@testing-library/react-native'

describe('ProductCard', () => {
  it('renders product information', () => {
    const product = {
      produtoId: 1,
      name: 'Test Product',
      preco: 99.90,
      estoque: 10,
    }
    
    const { getByText } = render(<ProductCard product={product} />)
    
    expect(getByText('Test Product')).toBeTruthy()
    expect(getByText('R$ 99,90')).toBeTruthy()
  })
  
  it('calls onEdit when edit button pressed', () => {
    const onEdit = jest.fn()
    const { getByTestId } = render(
      <ProductCard product={product} onEdit={onEdit} />
    )
    
    fireEvent.press(getByTestId('edit-button'))
    expect(onEdit).toHaveBeenCalledWith(product)
  })
})
```

### Integration Tests

```typescript
describe('Product Creation Flow', () => {
  it('creates product successfully', async () => {
    const { getByPlaceholderText, getByText } = render(<App />)
    
    // Navigate to product form
    fireEvent.press(getByText('Produtos'))
    fireEvent.press(getByTestId('fab'))
    
    // Fill form
    fireEvent.changeText(getByPlaceholderText('Nome'), 'New Product')
    fireEvent.changeText(getByPlaceholderText('Preço'), '99,90')
    
    // Submit
    fireEvent.press(getByText('Criar Produto'))
    
    // Verify toast
    await waitFor(() => {
      expect(getByText('Produto criado com sucesso!')).toBeTruthy()
    })
  })
})
```
