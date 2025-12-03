import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Dialog, Portal, Button, IconButton, Text, Searchbar, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryService } from '../services/category.service';
import { Category } from '../types';
import { useToast } from '../hooks';
import { AppBar, AppFAB, LoadingScreen, EmptyState } from '../components/common';
import { CategoryCard } from '../components/CategoryCard';
import { AppSnackbar } from '../components/AppSnackbar';

interface CategoriesScreenProps {
  onNavigateToForm?: (category?: Category) => void;
  onNavigateBack?: () => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onNavigateToForm,
  onNavigateBack,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categoryToToggle, setCategoryToToggle] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  const { toast, showToast, hideToast } = useToast();

  const pageSize = 5;

  useEffect(() => {
    loadCategories(1);
  }, [statusFilter]);

  const loadCategories = async (page: number, search?: string) => {
    try {
      setIsLoading(page === 1 && !isRefreshing);
      const isActive = statusFilter === 'active';
      const data = await categoryService.getAll(page, pageSize, search, isActive);
      setCategories(data.items);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error: any) {
      showToast(error.message || 'Erro ao carregar categorias', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCategories(1, searchQuery);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setSearchQuery('');
    loadCategories(1);
  };

  const handleToggleStatusConfirm = async () => {
    if (!categoryToToggle) return;

    try {
      const isActive = statusFilter === 'active';
      if (isActive) {
        await categoryService.deactivate(categoryToToggle.categoriaId);
        showToast('Categoria desativada com sucesso', 'success');
      } else {
        await categoryService.activate(categoryToToggle.categoriaId);
        showToast('Categoria ativada com sucesso', 'success');
      }
      loadCategories(currentPage, searchQuery);
    } catch (error: any) {
      showToast(error.message || 'Erro ao alterar status da categoria', 'error');
    } finally {
      setCategoryToToggle(null);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadCategories(nextPage, searchQuery);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      loadCategories(prevPage, searchQuery);
    }
  };

  const renderItem = ({ item }: { item: Category }) => {
    if (!item || !item.categoriaId) {
      return null;
    }
    return (
      <CategoryCard
        category={item}
        isActive={statusFilter === 'active'}
        onEdit={() => onNavigateToForm?.(item)}
        onToggleStatus={() => setCategoryToToggle(item)}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AppBar title="Categorias" onBack={onNavigateBack} />
        <LoadingScreen message="Carregando categorias..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar title="Categorias" onBack={onNavigateBack} />

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
              label: 'Ativas',
              icon: 'check-circle',
            },
            {
              value: 'inactive',
              label: 'Inativas',
              icon: 'close-circle',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.categoriaId?.toString() || `category-${index}`}
        contentContainerStyle={[
          styles.list,
          categories.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="📂"
            title={`Nenhuma categoria ${statusFilter === 'active' ? 'ativa' : 'inativa'}`}
            message={searchQuery ? `Nenhum resultado para "${searchQuery}"` : `Não há categorias ${statusFilter === 'active' ? 'ativas' : 'inativas'} no momento`}
            actionLabel="Criar Categoria"
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
              ({totalItems} {totalItems === 1 ? 'categoria' : 'categorias'})
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

      {categories.length > 0 && (
        <AppFAB
          icon="plus"
          onPress={() => onNavigateToForm?.()}
        />
      )}

      <Portal>
        <Dialog
          visible={!!categoryToToggle}
          onDismiss={() => setCategoryToToggle(null)}
        >
          <Dialog.Title>
            {statusFilter === 'active' ? 'Desativar' : 'Ativar'} categoria
          </Dialog.Title>
          <Dialog.Content>
            <Text>
              Deseja realmente {statusFilter === 'active' ? 'desativar' : 'ativar'} a categoria "{categoryToToggle?.name}"?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCategoryToToggle(null)}>
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
