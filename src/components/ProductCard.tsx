import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Text, IconButton, Portal, Dialog, TextInput, Button, Chip } from 'react-native-paper';
import { Product } from '../types';
import { productService } from '../services/product.service';

interface ProductCardProps {
  product: Product;
  isActive: boolean;
  categoryName?: string;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onStockChange?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isActive,
  categoryName,
  onEdit,
  onToggleStatus,
  onStockChange,
}) => {
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [stockAction, setStockAction] = useState<'add' | 'remove'>('add');
  const [stockQuantity, setStockQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStockAction = (action: 'add' | 'remove') => {
    setStockAction(action);
    setStockQuantity('');
    setError('');
    setShowStockDialog(true);
  };

  const handleCloseDialog = () => {
    setShowStockDialog(false);
    setStockQuantity('');
    setError('');
  };

  const confirmStockChange = async () => {
    const quantity = parseInt(stockQuantity);
    const currentStock = product.estoque || 0;
    
    if (!quantity || quantity <= 0) {
      setError('Quantidade deve ser maior que zero');
      return;
    }

    if (quantity > 1000) {
      setError('Quantidade máxima é 1000 por operação');
      return;
    }

    if (stockAction === 'remove') {
      if (quantity > currentStock) {
        setError(`Estoque insuficiente. Disponível: ${currentStock}`);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError('');
      
      if (stockAction === 'add') {
        await productService.adicionarEstoque(product.produtoId, quantity);
      } else {
        await productService.removerEstoque(product.produtoId, quantity);
      }
      
      setShowStockDialog(false);
      setStockQuantity('');
      onStockChange?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar estoque');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.content}>
          <View style={styles.imageContainer}>
            {product.imagemUrl ? (
              <Image
                source={{ uri: product.imagemUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderIcon}>📦</Text>
              </View>
            )}
          </View>
          
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
                {product.name}
              </Text>
              {categoryName && (
                <Chip
                  mode="outlined"
                  textStyle={styles.categoryChipText}
                  style={styles.categoryChip}
                  compact
                >
                  {categoryName}
                </Chip>
              )}
            </View>
            <Text variant="titleSmall" style={styles.price}>
              R$ {product.preco ? product.preco.toFixed(2).replace('.', ',') : '0,00'}
            </Text>
            
            <View style={styles.stockContainer}>
              <Text variant="bodySmall" style={styles.stockLabel}>
                Estoque: {product.estoque || 0}
              </Text>
              <View style={styles.stockButtons}>
                <IconButton
                  icon="minus-circle"
                  size={24}
                  iconColor="#EF4444"
                  onPress={() => handleStockAction('remove')}
                  style={styles.stockButton}
                />
                <IconButton
                  icon="plus-circle"
                  size={24}
                  iconColor="#10B981"
                  onPress={() => handleStockAction('add')}
                  style={styles.stockButton}
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              mode="contained-tonal"
              size={20}
              onPress={() => onEdit(product)}
            />
            <IconButton
              icon={isActive ? 'close-circle' : 'check-circle'}
              mode="contained-tonal"
              iconColor={isActive ? '#EF4444' : '#10B981'}
              size={20}
              onPress={() => onToggleStatus(product)}
            />
          </View>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog 
          visible={showStockDialog} 
          onDismiss={handleCloseDialog}
          style={{ marginTop: -100 }}
        >
            <Dialog.Title>
              {stockAction === 'add' ? 'Adicionar' : 'Remover'} Estoque
            </Dialog.Title>
            
            <Dialog.Content>
              <View style={{ backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                <Text variant="bodySmall" style={{ fontWeight: '600', marginBottom: 6 }}>
                  {product.name}
                </Text>
                <Text variant="bodySmall">
                  Estoque: {product.estoque || 0} {stockAction === 'remove' && `(Máx: ${product.estoque || 0})`}
                </Text>
              </View>
              
              <TextInput
                label="Digite a quantidade"
                value={stockQuantity}
                onChangeText={(text) => {
                  setStockQuantity(text);
                  setError('');
                }}
                keyboardType="numeric"
                mode="outlined"
                error={!!error}
                autoFocus
              />
              {error && (
                <Text variant="bodySmall" style={{ color: '#EF4444', marginTop: 4 }}>
                  {error}
                </Text>
              )}
            </Dialog.Content>
            
            <Dialog.Actions>
              <Button onPress={handleCloseDialog} disabled={isLoading}>
                Cancelar
              </Button>
              <Button 
                mode="contained"
                onPress={confirmStockChange} 
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Confirmar'}
              </Button>
            </Dialog.Actions>
          </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontWeight: '700',
    flex: 1,
  },
  categoryChip: {
    height: 24,
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  categoryChipText: {
    fontSize: 10,
    color: '#6366F1',
  },
  price: {
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
    fontSize: 16,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stockLabel: {
    opacity: 0.8,
    fontWeight: '600',
  },
  stockButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  stockButton: {
    margin: 0,
  },
  actions: {
    flexDirection: 'column',
    gap: 4,
  },
});
