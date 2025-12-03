# Fluxos de Usuário - Sistema de Catálogo

## Fluxo de Autenticação

### Registro de Novo Usuário

1. Usuário acessa aplicação pela primeira vez
2. Sistema exibe `LoginScreen` automaticamente
3. Usuário seleciona opção "Criar conta"
4. Navegação para `RegisterScreen`
5. Preenchimento de formulário:
   - Nome completo
   - Nome de usuário
   - Email
   - Senha
   - Confirmação de senha
6. Validação client-side em tempo real:
   - Formato de email
   - Força da senha
   - Correspondência de senhas
7. Submissão do formulário
8. Requisição POST para `/api/Auth/register`
9. Tratamento de resposta:
   - **Sucesso:** Toast de confirmação + redirecionamento para login após 2s
   - **Erro:** Exibição de erros mapeados nos campos correspondentes
10. Usuário redirecionado para `LoginScreen`

### Login

1. Usuário insere credenciais (username/password)
2. Validação básica de campos preenchidos
3. Requisição POST para `/api/Auth/login`
4. Backend retorna:
   - User object
   - Access token (JWT)
   - Refresh token
   - Expiração do refresh token
5. `AuthService` persiste dados em `AsyncStorage`:
   - `@app:user`
   - `@app:access_token`
   - `@app:refresh_token`
6. `AuthContext` atualiza estado global:
   ```typescript
   setAuthState({
     user,
     token,
     refreshToken,
     isAuthenticated: true,
     isLoading: false,
   })
   ```
7. Aplicação renderiza `HomeScreen`

### Verificação de Sessão (App Mount)

1. App inicia
2. `AuthContext.useEffect` executado
3. Tentativa de recuperação de dados do `AsyncStorage`
4. Se dados encontrados:
   - Valida presença de user, token e refreshToken
   - Atualiza estado para autenticado
   - Renderiza `HomeScreen`
5. Se dados ausentes:
   - Estado permanece não autenticado
   - Renderiza `LoginScreen`

### Logout

1. Usuário aciona botão de logout em `HomeScreen`
2. Requisição POST para `/api/Auth/revoke-token/{username}`
3. Backend invalida refresh token
4. `AuthService.clearAuthData()` remove:
   - `@app:user`
   - `@app:access_token`
   - `@app:refresh_token`
5. `AuthContext` reseta estado:
   ```typescript
   setAuthState({
     user: null,
     token: null,
     refreshToken: null,
     isAuthenticated: false,
     isLoading: false,
   })
   ```
6. Navegação automática para `LoginScreen`

### Renovação Automática de Token

1. Requisição retorna status 401
2. Interceptor do Axios captura erro
3. Se `isRefreshing` é false:
   - Define `isRefreshing = true`
   - Obtém refreshToken do `AsyncStorage`
   - Requisição POST para `/api/Auth/refresh-token`
4. Backend valida refreshToken e retorna novo accessToken
5. `AsyncStorage` atualizado com novo token
6. Requisição original é repetida com novo token
7. Fila de requisições pendentes é processada
8. `isRefreshing = false`
9. Se renovação falha:
   - `clearAuthData()` executado
   - Usuário deslogado automaticamente

## Fluxo de Categorias

### Listagem de Categorias

1. Usuário navega para "Categorias" via `HomeScreen`
2. `CategoriesScreen` montado
3. `useEffect` dispara `loadCategories(1)`:
   ```typescript
   const data = await categoryService.getAll(1, 5, searchQuery, statusFilter === 'active')
   ```
4. Requisição GET para `/api/Categoria/paginator` com params:
   - `NumberPage: 1`
   - `PageSize: 5`
   - `Active: true`
   - `Name: ''` (se houver busca)
5. Backend retorna objeto paginado:
   ```json
   {
     "valid": true,
     "data": {
       "items": [...],
       "paginator": {
         "currentPag": 1,
         "totalPages": 3,
         "totalCount": 15,
         "pageSize": 5
       }
     }
   }
   ```
6. Service mapeia resposta:
   - Extrai items de `data.data.items`
   - Mapeia `id` para `categoriaId`
   - Extrai informações de paginação
7. Estado atualizado:
   ```typescript
   setCategories(data.items)
   setCurrentPage(data.currentPage)
   setTotalPages(data.totalPages)
   setTotalItems(data.totalItems)
   ```
8. `FlatList` renderiza `CategoryCard` para cada item
9. Controles de paginação exibidos se `totalPages > 1`

### Busca de Categorias

1. Usuário digita no `Searchbar`
2. Estado `searchQuery` atualizado a cada tecla
3. Usuário pressiona Enter ou ícone de busca
4. `handleSearch()` executado:
   ```typescript
   setCurrentPage(1)
   loadCategories(1, searchQuery)
   ```
5. Requisição com parâmetro `Name` preenchido
6. Resultados filtrados exibidos
7. Paginação recalculada baseada em resultados filtrados

### Filtro por Status (Ativo/Inativo)

1. Usuário clica em `SegmentedButtons` ("Ativos" ou "Inativos")
2. `statusFilter` atualizado ('active' ou 'inactive')
3. `useEffect` detecta mudança:
   ```typescript
   useEffect(() => {
     loadCategories(1)
   }, [statusFilter])
   ```
4. Requisição com `Active: true/false`
5. Lista recarregada com categorias filtradas
6. Página reseta para 1

### Criação de Categoria

1. Usuário clica no FAB (+)
2. Navegação para `CategoryFormScreen` sem categoria
3. Formulário vazio renderizado
4. Usuário preenche:
   - Nome da categoria
   - Imagem (opcional via `ImagePickerComponent`)
5. Validação em `validateForm()`:
   - Nome obrigatório
   - Mínimo 3 caracteres
6. Submissão do formulário
7. `ImagePickerComponent` (se imagem selecionada):
   - Upload para Cloudinary
   - Retorna URL pública
8. Requisição POST para `/api/Categoria`:
   ```json
   {
     "Name": "Eletrônicos",
     "ImagemUrl": "https://res.cloudinary.com/..."
   }
   ```
9. Backend processa e retorna categoria criada
10. Toast de sucesso exibido
11. Após 1.5s:
    - `onSuccess()` dispara reload na lista
    - `onNavigateBack()` retorna para `CategoriesScreen`
12. Lista recarregada com nova categoria

### Edição de Categoria

1. Usuário clica no ícone de lápis em `CategoryCard`
2. Navegação para `CategoryFormScreen` com categoria selecionada
3. Formulário pre-populado:
   ```typescript
   const [nome, setNome] = useState(category?.name || '')
   const [imagemUrl, setImagemUrl] = useState(category?.imagemUrl || '')
   ```
4. Usuário modifica campos desejados
5. Validação idêntica ao fluxo de criação
6. Requisição PUT para `/api/Categoria/{id}`:
   ```json
   {
     "Name": "Eletrônicos Atualizados",
     "ImagemUrl": "https://..."
   }
   ```
7. Backend atualiza registro
8. Toast de sucesso + navegação de volta
9. Lista recarregada

### Ativação/Desativação de Categoria

1. Usuário clica no ícone de status (✓ ou ✗)
2. Dialog de confirmação exibido:
   ```
   "Confirma desativação da categoria [Nome]?"
   ```
3. Usuário confirma
4. Requisição disparada baseada em status:
   - **Ativo → Inativo:** PATCH `/deactivate/{id}`
   - **Inativo → Ativo:** PATCH `/activate/{id}`
5. Backend atualiza campo `ativo`
6. Toast de confirmação
7. Lista recarregada para refletir mudança
8. Categoria removida da visualização atual se filtro não corresponder

### Paginação de Categorias

1. Lista inicial carrega página 1
2. Usuário clica em "Próxima ▶"
3. `goToNextPage()` executado:
   ```typescript
   if (currentPage < totalPages) {
     const nextPage = currentPage + 1
     setCurrentPage(nextPage)
     loadCategories(nextPage, searchQuery)
   }
   ```
4. Requisição com `NumberPage: 2`
5. Novos 5 itens carregados
6. Indicador de página atualizado: "Página 2 de 3"
7. Botão "◀ Anterior" habilitado
8. Botão "Próxima ▶" desabilitado se última página

## Fluxo de Produtos

### Listagem de Produtos

Fluxo similar ao de categorias, com adições:

1. `ProductsScreen` montado
2. Dois `useEffect` paralelos:
   ```typescript
   useEffect(() => {
     loadCategories() // Para exibir nome no card
   }, [])
   
   useEffect(() => {
     loadProducts(1)
   }, [statusFilter])
   ```
3. `loadCategories()` busca todas categorias ativas (até 100):
   ```typescript
   const data = await categoryService.getAll(1, 100, undefined, true)
   setCategories(data.items)
   ```
4. `loadProducts()` busca produtos paginados:
   ```typescript
   const data = await productService.getAll(page, 5, search, isActive)
   ```
5. Para cada produto, categoria é encontrada:
   ```typescript
   const category = categories.find(c => c.categoriaId === item.categoriaId)
   ```
6. `ProductCard` renderizado com:
   - Dados do produto
   - Nome da categoria
   - Callbacks de edição e alteração de status
   - Callback de mudança de estoque

### Criação de Produto

1. Validação inicial: verifica se existem categorias
2. Se `categories.length === 0`:
   - Dialog exibido: "Você precisa criar pelo menos uma categoria"
   - Navegação bloqueada
3. Usuário preenche formulário:
   - Nome do produto
   - Descrição (opcional)
   - Preço (aceita vírgula ou ponto)
   - Imagem (opcional)
   - Categoria (obrigatória via `CategoryPicker`)
4. Validação:
   ```typescript
   const precoNumerico = parseFloat(preco.replace(',', '.'))
   if (!preco || isNaN(precoNumerico) || precoNumerico <= 0) {
     showToast('Preço deve ser maior que zero', 'error')
     return false
   }
   ```
5. Conversão de preço:
   ```typescript
   Preco: parseFloat(preco.replace(',', '.'))
   // "199,99" → 199.99
   ```
6. Requisição POST para `/api/Produto/created`:
   ```json
   {
     "Name": "Notebook Dell",
     "Descricao": "Notebook i7 16GB RAM",
     "Preco": 3499.90,
     "ImagemUrl": "https://...",
     "CategoriaId": 3
   }
   ```
7. Backend cria produto com estoque inicial 0
8. Toast de sucesso + navegação

### Edição de Produto

1. Formulário pre-populado com dados existentes
2. Preço formatado com vírgula:
   ```typescript
   useEffect(() => {
     if (product) {
       setPreco(product.preco?.toFixed(2).replace('.', ',') || '')
       // 199.99 → "199,99"
     }
   }, [product])
   ```
3. Usuário edita campos
4. Conversão reversa no submit:
   ```typescript
   Preco: parseFloat(preco.replace(',', '.'))
   // "249,90" → 249.90
   ```
5. Requisição PUT para `/api/Produto/{id}`
6. Backend atualiza registro
7. Lista recarregada

### Gerenciamento de Estoque

#### Adicionar Estoque

1. Usuário clica no botão ➕ verde em `ProductCard`
2. Estado atualizado:
   ```typescript
   setStockAction('add')
   setShowStockDialog(true)
   ```
3. Dialog exibido com informações:
   - Nome do produto
   - Estoque atual
   - Máximo por operação: 1000
4. Campo de quantidade com `autoFocus`
5. Validações ao confirmar:
   ```typescript
   if (!quantity || quantity <= 0) {
     setError('Quantidade deve ser maior que zero')
     return
   }
   
   if (quantity > 1000) {
     setError('Quantidade máxima é 1000 por operação')
     return
   }
   ```
6. Se válido, requisição PATCH para `/api/Produto/{id}/estoque/add`:
   ```json
   [
     {
       "op": "replace",
       "path": "/Estoque",
       "value": 50
     }
   ]
   ```
7. Backend incrementa estoque
8. Dialog fecha
9. `onStockChange()` dispara reload:
   ```typescript
   loadProducts(currentPage, searchQuery)
   ```
10. Card atualizado com novo estoque

#### Remover Estoque

1. Usuário clica no botão ➖ vermelho
2. Dialog exibido com alerta adicional:
   - "Estoque atual: 30"
   - "Máximo para remover: 30" (em vermelho)
3. Validações adicionais:
   ```typescript
   if (stockAction === 'remove') {
     if (quantity > currentStock) {
       setError(`Estoque insuficiente. Disponível: ${currentStock}`)
       return
     }
   }
   ```
4. Exemplo de validação:
   - Estoque atual: 30
   - Tentativa de remover: 60
   - Erro: "Estoque insuficiente. Disponível: 30"
5. Se válido, PATCH para `/api/Produto/{id}/estoque/Remover`
6. Backend decrementa estoque
7. Lista recarregada

### Ativação/Desativação de Produto

Fluxo idêntico ao de categorias:

1. Usuário clica no ícone de status
2. Dialog de confirmação
3. Requisição PATCH:
   - `/api/Produto/activate/{id}`
   - `/api/Produto/deactivate/{id}`
4. Lista recarregada

## Fluxo de Imagens

### Upload via ImagePickerComponent

1. Usuário clica no componente de imagem
2. Dialog exibido com opções:
   - Câmera
   - Galeria
3. Verificação de permissões:
   ```typescript
   const hasPermission = await requestPermissions()
   if (!hasPermission) return
   ```
4. Abertura de câmera ou galeria (Expo Image Picker)
5. Usuário seleciona/tira foto
6. Imagem retornada em base64 ou URI
7. Conversão para blob
8. Upload para Cloudinary:
   ```typescript
   const formData = new FormData()
   formData.append('file', blob)
   formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
   
   fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
     method: 'POST',
     body: formData,
   })
   ```
9. Cloudinary retorna URL pública:
   ```json
   {
     "secure_url": "https://res.cloudinary.com/.../image.jpg",
     "public_id": "products/abc123"
   }
   ```
10. URL armazenada em estado do formulário
11. Preview exibido no componente

## Fluxo de Refresh

### Pull to Refresh

1. Usuário arrasta lista para baixo
2. `onRefresh` callback acionado
3. Estado `isRefreshing` = true
4. Indicador de loading exibido
5. Dados recarregados:
   ```typescript
   setCurrentPage(1)
   setSearchQuery('')
   loadProducts(1)
   ```
6. Filtros resetados
7. `isRefreshing` = false
8. Indicador removido
9. Lista atualizada

## Fluxo de Erros

### Erro de Rede

1. Requisição falha (sem conexão)
2. Axios lança erro `ERR_NETWORK`
3. `AuthContext.login` captura:
   ```typescript
   if (error.code === 'ERR_NETWORK') {
     errorMessage = 'Erro de conexão. Verifique se a API está rodando.'
   }
   ```
4. Toast exibido com mensagem amigável
5. Estado de loading resetado

### Erro 400 (Bad Request)

1. Backend valida dados e rejeita
2. Resposta contém campo `errors`:
   ```json
   {
     "valid": false,
     "errors": {
       "Name": ["O campo Name é obrigatório"],
       "Email": ["Email inválido"]
     }
   }
   ```
3. `parseBackendErrors()` mapeia erros:
   ```typescript
   {
     name: "O campo Name é obrigatório",
     email: "Email inválido"
   }
   ```
4. Campos de formulário marcados com erro
5. Primeira mensagem exibida em toast

### Erro 401 (Não Autorizado)

1. Token expirado ou inválido
2. Interceptor captura 401
3. Tentativa de renovação com refreshToken
4. Se renovação bem-sucedida:
   - Requisição original repetida
   - Fluxo continua normalmente
5. Se renovação falha:
   - Sessão encerrada
   - `clearAuthData()` executado
   - Redirecionamento para login
   - Toast: "Sessão expirada. Faça login novamente."

### Erro 404 (Não Encontrado)

1. Recurso não existe no backend
2. Service retorna array vazio
3. `EmptyState` component renderizado:
   ```
   Ícone grande
   "Nenhum resultado encontrado"
   Botão de ação (se aplicável)
   ```

### Erro 500 (Servidor)

1. Erro interno do backend
2. Toast genérico: "Erro no servidor. Tente novamente mais tarde."
3. Estado de loading resetado
4. Dados anteriores preservados (se existentes)

## Navegação Entre Telas

### Máquina de Estados de Navegação

```
Estado: screen
Valores: 'login' | 'register' | 'home' | 'categories' | 'categoryForm' | 'products' | 'productForm'
```

### Transições

```
login → register (botão "Criar conta")
register → login (botão "Voltar" ou após sucesso)
login → home (após autenticação)
home → categories (card "Categorias")
home → products (card "Produtos")
categories → categoryForm (FAB ou botão editar)
categoryForm → categories (voltar ou após salvar)
products → productForm (FAB ou botão editar)
productForm → products (voltar ou após salvar)
any → login (logout ou sessão expirada)
```

### Passagem de Dados

Dados passados via estado de componente:

```typescript
// Exemplo: Editar categoria
<CategoriesScreen
  onNavigateToForm={(category?: Category) => {
    setSelectedCategory(category)
    setCurrentScreen('categoryForm')
  }}
/>

// CategoryFormScreen recebe
<CategoryFormScreen
  category={selectedCategory}
  onNavigateBack={() => {
    setSelectedCategory(undefined)
    setCurrentScreen('categories')
  }}
  onSuccess={() => {
    setSelectedCategory(undefined)
  }}
/>
```

## Ciclo de Vida Completo - Exemplo Prático

### Cenário: Usuário adiciona novo produto

1. **Abertura do App**
   - `AuthContext` verifica `AsyncStorage`
   - Usuário já autenticado
   - Renderiza `HomeScreen`

2. **Navegação**
   - Usuário toca em "Produtos"
   - `setCurrentScreen('products')`
   - `ProductsScreen` montado

3. **Carregamento Inicial**
   - `useEffect` dispara `loadCategories()`
   - `useEffect` dispara `loadProducts(1)`
   - Categorias carregadas (para exibir nomes)
   - Produtos paginados carregados (página 1, 5 itens)
   - `FlatList` renderiza `ProductCard`s

4. **Iniciar Criação**
   - Usuário toca no FAB (+)
   - `onNavigateToForm()` sem argumento
   - `setCurrentScreen('productForm')`
   - `ProductFormScreen` montado sem produto

5. **Verificação de Categorias**
   - `loadCategories()` executado
   - Se `categories.length === 0`:
     - Dialog exibido
     - Navegação bloqueada
   - Caso contrário, formulário renderizado

6. **Preenchimento**
   - Nome: "Mouse Gamer RGB"
   - Descrição: "Mouse óptico 16000 DPI"
   - Preço: "89,90" (com vírgula)
   - Categoria: Selecionada via `CategoryPicker`
   - Imagem: Upload via Cloudinary

7. **Validação Client-Side**
   - `validateForm()` verifica:
     - Nome não vazio ✓
     - Preço > 0 ✓ (89.90)
     - Categoria selecionada ✓

8. **Submissão**
   - Preço convertido: "89,90" → 89.90
   - POST `/api/Produto/created`:
     ```json
     {
       "Name": "Mouse Gamer RGB",
       "Descricao": "Mouse óptico 16000 DPI",
       "Preco": 89.90,
       "ImagemUrl": "https://res.cloudinary.com/.../mouse.jpg",
       "CategoriaId": 2
     }
     ```

9. **Resposta do Backend**
   ```json
   {
     "valid": true,
     "message": "Produto criado com sucesso",
     "data": {
       "id": 15,
       "name": "Mouse Gamer RGB",
       "preco": 89.90,
       "estoque": 0,
       ...
     }
   }
   ```

10. **Feedback ao Usuário**
    - Toast verde: "Produto criado com sucesso!"
    - Aguarda 1.5s

11. **Navegação de Volta**
    - `onSuccess()` dispara
    - `onNavigateBack()` executado
    - `setCurrentScreen('products')`
    - `ProductsScreen` remontado

12. **Atualização da Lista**
    - `useEffect` detecta remontagem
    - `loadProducts(1)` executado
    - Novo produto aparece na lista
    - Estoque inicial: 0

13. **Adicionar Estoque**
    - Usuário clica ➕ no novo produto
    - Dialog aberto
    - Digita: 100
    - Confirma
    - PATCH `/api/Produto/15/estoque/add`
    - Lista recarregada
    - Estoque atualizado: 100

14. **Fluxo Completo**
    - Produto criado ✓
    - Estoque adicionado ✓
    - Disponível para venda ✓
