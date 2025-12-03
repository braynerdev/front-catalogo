import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { categoryService } from '../services/category.service';
import { productService } from '../services/product.service';

export const DashboardStats: React.FC = () => {
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        categoryService.getAll(1, 100, undefined, true),
        productService.getAll(1, 100, undefined, true),
      ]);
      setCategoriesCount(categoriesData.totalItems);
      setProductsCount(productsData.totalItems);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card mode="outlined" style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <Text variant="headlineMedium" style={[styles.statNumber, { color: '#3B82F6' }]}>
            {categoriesCount}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Categoria{categoriesCount !== 1 ? 's' : ''}
          </Text>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <Text variant="headlineMedium" style={[styles.statNumber, { color: '#10B981' }]}>
            {productsCount}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Produto{productsCount !== 1 ? 's' : ''}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: '700',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
});
