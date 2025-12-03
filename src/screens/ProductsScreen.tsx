import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Dialog, Portal, Button, IconButton, Text, Searchbar, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { Product, Category } from '../types';
import { useToast } from '../hooks';
import { AppBar, AppFAB, LoadingScreen, EmptyState } from '../components/common';
import { ProductCard } from '../components/ProductCard';
import { AppSnackbar } from '../components/AppSnackbar';

interface ProductsScreenProps {
  onNavigateToForm?: (product?: Product) => void;
  onNavigateBack?: () => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  onNavigateToForm,
  onNavigateBack,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productToToggle, setProductToToggle] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  const { toast, showToast, hideToast } = useToast();

  const pageSize = 5;


  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts(1);
  }, [statusFilter]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll(1, 100, undefined, true);
      setCategories(data.items);
    } catch (error) {
    }
  };


  const loadProducts = async (page: number, search?: string) => {
    try {
      setIsLoading(page === 1 && !isRefreshing);
      const isActive = statusFilter === 'active';
      const data = await productService.getAll(page, pageSize, search, isActive);
      setProducts(data.items);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error: any) {
      showToast(error.message || 'Erro ao carregar produtos', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadProducts(1, searchQuery);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setSearchQuery('');
    loadProducts(1);
  };

  const handleToggleStatusConfirm = async () => {
    if (!productToToggle) return;

    try {
      const isActive = statusFilter === 'active';
      if (isActive) {
        await productService.deactivate(productToToggle.produtoId);
        showToast('Produto desativado com sucesso', 'success');
      } else {
        await productService.activate(productToToggle.produtoId);
        showToast('Produto ativado com sucesso', 'success');
      }
      loadProducts(currentPage, searchQuery);
    } catch (error: any) {
      showToast(error.message || 'Erro ao alterar status do produto', 'error');
    } finally {
      setProductToToggle(null);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadProducts(nextPage, searchQuery);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      loadProducts(prevPage, searchQuery);
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    if (!item || !item.produtoId) {
      return null;
    }
    
    const category = categories.find(c => c.categoriaId === item.categoriaId);
    
    return (
      <ProductCard
        product={item}
        isActive={statusFilter === 'active'}
        categoryName={category?.name}
        onEdit={() => onNavigateToForm?.(item)}
        onToggleStatus={() => setProductToToggle(item)}
        onStockChange={() => loadProducts(currentPage, searchQuery)}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AppBar title="Produtos" onBack={onNavigateBack} />
        <LoadingScreen message="Carregando produtos..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar title="Produtos" onBack={onNavigateBack} />

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Buscar por nome..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          onIconPress={handleSearch}
          style={styles.searchbar}
        />
        
        <SegmentedButtons
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as 'active' | 'inactive')}
          buttons={[
            {
              value: 'active',
              label: 'Ativos',
              icon: 'check-circle',
            },
            {
              value: 'inactive',
              label: 'Inativos',
              icon: 'close-circle',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.produtoId?.toString() || `product-${index}`}
        contentContainerStyle={[
          styles.list,
          products.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title={`Nenhum produto ${statusFilter === 'active' ? 'ativo' : 'inativo'}`}
            message={searchQuery ? `Nenhum resultado para "${searchQuery}"` : `Não há produtos ${statusFilter === 'active' ? 'ativos' : 'inativos'} no momento`}
            actionLabel="Criar Produto"
            onAction={() => onNavigateToForm?.()}
          />
        }
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <IconButton
            icon="chevron-left"
            mode="contained-tonal"
            disabled={currentPage === 1}
            onPress={goToPreviousPage}
          />
          <View style={styles.pageInfo}>
            <Text variant="bodyMedium">
              Página {currentPage} de {totalPages}
            </Text>
            <Text variant="bodySmall" style={styles.totalItems}>
              ({totalItems} {totalItems === 1 ? 'produto' : 'produtos'})
            </Text>
          </View>
          <IconButton
            icon="chevron-right"
            mode="contained-tonal"
            disabled={currentPage === totalPages}
            onPress={goToNextPage}
          />
        </View>
      )}

      {products.length > 0 && (
        <AppFAB
          icon="plus"
          onPress={() => onNavigateToForm?.()}
        />
      )}

      <Portal>
        <Dialog
          visible={!!productToToggle}
          onDismiss={() => setProductToToggle(null)}
        >
          <Dialog.Title>
            {statusFilter === 'active' ? 'Desativar' : 'Ativar'} produto
          </Dialog.Title>
          <Dialog.Content>
            <Text>
              Deseja realmente {statusFilter === 'active' ? 'desativar' : 'ativar'} o produto "{productToToggle?.name}"?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setProductToToggle(null)}>
              Cancelar
            </Button>
            <Button
              onPress={handleToggleStatusConfirm}
              textColor={statusFilter === 'active' ? '#EF4444' : '#10B981'}
            >
              {statusFilter === 'active' ? 'Desativar' : 'Ativar'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <AppSnackbar
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  filtersContainer: {
    padding: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F3F4F6',
  },
  segmentedButtons: {
    backgroundColor: '#ffffff',
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  emptyList: {
    flexGrow: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pageInfo: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  totalItems: {
    marginTop: 2,
    opacity: 0.6,
  },
});
