# Índice da Documentação - Sistema de Catálogo

## Estrutura da Documentação

Esta documentação está organizada em módulos especializados para facilitar a navegação e consulta por diferentes públicos.

### 📚 Documentos Disponíveis

1. **README.md** - Documentação Técnica Principal
   - Visão geral da arquitetura
   - Stack tecnológica
   - Estrutura de diretórios
   - Padrões arquiteturais
   - Componentes principais
   - Gerenciamento de estado
   - Validações
   - Tratamento de erros
   - Otimizações de performance
   - Segurança

2. **USER_FLOWS.md** - Fluxos de Usuário
   - Fluxo de autenticação completo
   - Fluxo de gerenciamento de categorias
   - Fluxo de gerenciamento de produtos
   - Fluxo de gerenciamento de estoque
   - Fluxo de upload de imagens
   - Navegação entre telas
   - Ciclo de vida completo de operações

3. **TECHNICAL_DETAILS.md** - Detalhes Técnicos de Implementação
   - Gerenciamento de requisições HTTP
   - Paginação e filtros avançados
   - Formatação de dados
   - Validações específicas
   - Upload de imagens
   - Otimizações
   - Tratamento de estados
   - Componentes customizados
   - Persistência de dados
   - Temas e estilos
   - Tipagem TypeScript
   - Patterns e best practices
   - Performance monitoring
   - Segurança
   - Logging e debugging
   - Testes

## Resumo Executivo

### Objetivo do Sistema

Sistema mobile de gerenciamento de catálogo desenvolvido para controle de produtos e categorias com funcionalidades de autenticação, CRUD completo e gerenciamento de estoque em tempo real.

### Tecnologias Core

- **Framework:** React Native 0.81.5 com Expo ~52.0.11
- **Linguagem:** TypeScript 5.3.3
- **UI:** React Native Paper 5.12.5 (Material Design 3)
- **HTTP Client:** Axios 1.7.9
- **Storage:** AsyncStorage 2.1.0

### Arquitetura

O sistema segue arquitetura em camadas com separação clara de responsabilidades:

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Screens & Components)           │
├─────────────────────────────────────┤
│         Business Logic Layer        │
│    (Contexts & Custom Hooks)        │
├─────────────────────────────────────┤
│         Service Layer               │
│    (API Services)                   │
├─────────────────────────────────────┤
│         Data Layer                  │
│    (AsyncStorage & HTTP Client)     │
└─────────────────────────────────────┘
```

### Principais Funcionalidades

#### Autenticação
- Login com credenciais
- Registro de novos usuários
- Renovação automática de token JWT
- Logout com revogação de token

#### Categorias
- Listagem paginada (5 items/página)
- Busca por nome
- Filtro por status (ativo/inativo)
- CRUD completo
- Upload de imagens
- Ativação/desativação

#### Produtos
- Listagem paginada (5 items/página)
- Busca por nome
- Filtro por status
- Exibição de categoria
- CRUD completo
- Gerenciamento de estoque (adicionar/remover)
- Upload de imagens
- Ativação/desativação
- Validação de preço (suporta vírgula e ponto decimal)

#### Estoque
- Adição de estoque (máx 1000 por operação)
- Remoção de estoque (limitado ao disponível)
- Validação de quantidade em tempo real
- Feedback visual imediato

### Fluxos Principais

#### Fluxo de Login
```
LoginScreen → Credenciais → API → Token → AsyncStorage → HomeScreen
```

#### Fluxo de Criação de Produto
```
ProductsScreen → FAB → ProductFormScreen → 
Formulário → Validação → Upload Imagem (opcional) → 
API → Sucesso → Reload → ProductsScreen
```

#### Fluxo de Gerenciamento de Estoque
```
ProductCard → Botão +/- → Dialog → Validação → 
API (PATCH) → Reload → Card Atualizado
```

### Padrões de Desenvolvimento

#### Service Layer Pattern
Toda comunicação com API centralizada em services independentes:
- `auth.service.ts`
- `category.service.ts`
- `product.service.ts`
- `upload.service.ts`

#### Context API para Estado Global
- `AuthContext` gerencia autenticação e sessão
- Persistência automática em `AsyncStorage`
- Renovação transparente de tokens

#### Custom Hooks
- `useToast` - Notificações
- `usePermissions` - Controle de acesso
- `useFormValidation` - Validação de formulários

#### Component Composition
- Componentes pequenos e reutilizáveis
- Props bem tipadas
- Separação de lógica e apresentação

### Estrutura de Dados

#### Produto
```typescript
{
  produtoId: number
  name: string
  descricao?: string
  preco: number
  estoque: number
  imagemUrl?: string
  categoriaId: number
}
```

#### Categoria
```typescript
{
  categoriaId: number
  name: string
  imagemUrl?: string
}
```

#### Paginação
```typescript
{
  items: T[]
  currentPage: number
  totalPages: number
  totalItems: number
}
```

### Segurança

#### Autenticação
- JWT Bearer token em todas requisições
- Refresh token armazenado de forma segura
- Renovação automática antes de expiração
- Revogação de token no logout

#### Validação
- Client-side validation antes de envio
- Server-side validation tratada
- Sanitização de inputs
- Prevenção de XSS

#### Permissões
- Sistema simplificado: autenticado = acesso total
- Fácil extensão para RBAC futuro

### Performance

#### Otimizações Implementadas
- Debounce em buscas (500ms)
- Paginação lazy loading
- FlatList otimizado
- Callbacks memoizados
- Validação de renderização

#### Métricas Alvo
- Tempo de carregamento inicial: < 2s
- Tempo de resposta de busca: < 300ms
- FPS constante: 60fps em listas
- Bundle size: < 5MB

### Tratamento de Erros

#### Hierarquia
1. Try-catch em services
2. Interceptors do Axios
3. Error boundaries (recomendado)
4. Toast notifications ao usuário

#### Tipos de Erro
- Erro de rede (timeout, sem conexão)
- Erro 400 (validação)
- Erro 401 (não autorizado)
- Erro 404 (não encontrado)
- Erro 500 (servidor)

### Deployment

#### Configurações Necessárias
```env
API_BASE_URL=https://api.production.com
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_UPLOAD_PRESET=your_preset
```

#### Build Commands
```bash
# Android
expo build:android

# iOS
expo build:ios

# Web (opcional)
expo build:web
```

### Roadmap Futuro

#### Features Planejadas
- [ ] Filtros avançados de produtos
- [ ] Exportação de relatórios
- [ ] Notificações push
- [ ] Modo offline
- [ ] Múltiplas imagens por produto
- [ ] Histórico de movimentação de estoque

#### Melhorias Técnicas
- [ ] Implementar React Query
- [ ] Adicionar Error Boundaries
- [ ] Offline-first com Redux Persist
- [ ] Loading skeletons
- [ ] Code splitting
- [ ] Virtualização de listas

#### Testes
- [ ] Cobertura de unit tests > 80%
- [ ] Integration tests para fluxos críticos
- [ ] E2E tests com Detox
- [ ] Performance testing

### Guia de Navegação

#### Para Desenvolvedores Frontend
Inicie por:
1. README.md - Visão geral da arquitetura
2. TECHNICAL_DETAILS.md - Implementação específica
3. USER_FLOWS.md - Entender comportamento esperado

#### Para Desenvolvedores Backend
Foco em:
1. USER_FLOWS.md - Entender requisições esperadas
2. TECHNICAL_DETAILS.md - Formato de dados e APIs
3. README.md - Contratos de serviço

#### Para QA/Testers
Consultar:
1. USER_FLOWS.md - Casos de uso completos
2. README.md - Validações e regras de negócio
3. TECHNICAL_DETAILS.md - Edge cases e erros

#### Para Product Owners
Revisar:
1. USER_FLOWS.md - Jornada do usuário
2. README.md - Funcionalidades implementadas
3. INDEX.md - Roadmap e melhorias

### Convenções de Código

#### Nomenclatura
- Components: PascalCase (`ProductCard.tsx`)
- Services: camelCase com sufixo `.service.ts`
- Hooks: camelCase com prefixo `use` (`useToast.ts`)
- Types: PascalCase com sufixo `.types.ts`

#### Estrutura de Arquivos
```
ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.styles.ts (se necessário)
  ├── ComponentName.test.tsx
  └── index.ts
```

#### Importações
Ordem de importação:
1. React e dependências externas
2. Services e contexts
3. Types e interfaces
4. Components
5. Styles e assets

```typescript
import React, { useState } from 'react'
import { View } from 'react-native'
import { Button } from 'react-native-paper'

import { productService } from '../services/product.service'
import { useAuth } from '../contexts/AuthContext'

import { Product } from '../types'

import { ProductCard } from '../components/ProductCard'

import { styles } from './styles'
```

### Glossário

- **JWT**: JSON Web Token - Token de autenticação
- **CRUD**: Create, Read, Update, Delete
- **API**: Application Programming Interface
- **UI**: User Interface
- **UX**: User Experience
- **RBAC**: Role-Based Access Control
- **XSS**: Cross-Site Scripting
- **AsyncStorage**: Solução de persistência local do React Native
- **FlatList**: Componente otimizado para listas no React Native
- **Portal**: Renderização de componentes fora da hierarquia normal

### Recursos Adicionais

#### Documentação Externa
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/)

#### Ferramentas de Desenvolvimento
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Reactotron](https://github.com/infinitered/reactotron)
- [Flipper](https://fbflipper.com/)

### Contato e Suporte

Para questões técnicas sobre a documentação ou implementação, consulte os arquivos específicos listados acima. Cada documento contém detalhes aprofundados sobre sua área de cobertura.

### Changelog da Documentação

**Versão 1.0** - 2024
- Documentação inicial completa
- Cobertura de todos os fluxos principais
- Detalhamento técnico de implementação
- Guias de navegação por perfil
