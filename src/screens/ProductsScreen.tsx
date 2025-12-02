import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { productService } from '../services/product.service';
import { Product } from '../types';
import { useToast } from '../hooks';
import { Toast } from '../components/Toast';
import { styles } from '../styles/ProductsScreen.styles';

interface ProductsScreenProps {
  onNavigateToForm?: (product?: Product) => void;
  onNavigateBack?: () => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  onNavigateToForm,
  onNavigateBack,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error: any) {
      showToast(error.message || 'Erro ao carregar produtos', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProducts();
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir o produto "${product.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.delete(product.produtoId);
              showToast('Produto excluído com sucesso', 'success');
              loadProducts();
            } catch (error: any) {
              showToast(error.message || 'Erro ao excluir produto', 'error');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📦</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.productName}>{item.name}</Text>
          {item.descricao && (
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.descricao}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Preço</Text>
          <Text style={styles.detailValue}>{formatPrice(item.preco)}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Estoque</Text>
          <Text style={[
            styles.detailValue,
            item.estoque < 10 && styles.lowStock
          ]}>
            {item.estoque} un
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onNavigateToForm?.(item)}
        >
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>Nenhum produto</Text>
      <Text style={styles.emptyText}>
        Comece criando seu primeiro produto
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={hideToast}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigateBack?.()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Produtos</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.produtoId.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => onNavigateToForm?.()}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
