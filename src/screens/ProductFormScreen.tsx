import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Dialog, Portal, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImagePickerComponent } from '../components/ImagePickerComponent';
import { CategoryPicker } from '../components/CategoryPicker';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { Product, ProductFormData, Category } from '../types';
import { useToast } from '../hooks';
import { AppBar, AppButton, AppTextInput, LoadingScreen } from '../components/common';
import { AppSnackbar } from '../components/AppSnackbar';

interface ProductFormScreenProps {
  product?: Product;
  onNavigateBack?: () => void;
  onSuccess?: () => void;
}

export const ProductFormScreen: React.FC<ProductFormScreenProps> = ({
  product,
  onNavigateBack,
  onSuccess,
}) => {
  const [nome, setNome] = useState(product?.name || '');
  const [descricao, setDescricao] = useState(product?.descricao || '');
  const [preco, setPreco] = useState(product?.preco?.toString() || '');
  const [imagemUrl, setImagemUrl] = useState(product?.imagemUrl || '');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(product?.categoriaId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showNoCategoriesDialog, setShowNoCategoriesDialog] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const isEditing = !!product;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setNome(product.name);
      setDescricao(product.descricao || '');
      setPreco(product.preco?.toFixed(2).replace('.', ',') || '');
      setImagemUrl(product.imagemUrl || '');
      setCategoriaId(product.categoriaId);
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await categoryService.getAll(1, 100);
      setCategories(data.items);
      
      if (data.items.length === 0) {
        setShowNoCategoriesDialog(true);
      }
    } catch (error) {
      showToast('Erro ao carregar categorias', 'error');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    if (!nome.trim()) {
      showToast('Nome do produto é obrigatório', 'error');
      return false;
    }

    const precoNumerico = parseFloat(preco.replace(',', '.'));
    if (!preco || isNaN(precoNumerico) || precoNumerico <= 0) {
      showToast('Preço deve ser maior que zero', 'error');
      return false;
    }

    if (!categoriaId) {
      showToast('Selecione uma categoria', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formData: ProductFormData = {
        Name: nome.trim(),
        Descricao: descricao.trim() || undefined,
        Preco: parseFloat(preco.replace(',', '.')),
        ImagemUrl: imagemUrl || undefined,
        CategoriaId: categoriaId!,
      };

      if (isEditing) {
        await productService.update(product.produtoId, formData);
        showToast('Produto atualizado com sucesso!', 'success');
      } else {
        await productService.create(formData);
        showToast('Produto criado com sucesso!', 'success');
      }

      setTimeout(() => {
        onSuccess?.();
        onNavigateBack?.();
      }, 1500);
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar produto', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCategories) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AppBar 
          title={isEditing ? 'Editar Produto' : 'Novo Produto'}
          onBack={onNavigateBack}
        />
        <LoadingScreen message="Carregando..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar 
        title={isEditing ? 'Editar Produto' : 'Novo Produto'}
        onBack={onNavigateBack}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <ImagePickerComponent
              label="Imagem do Produto"
              value={imagemUrl}
              onImageSelect={setImagemUrl}
            />

            <AppTextInput
              label="Nome do Produto"
              placeholder="Ex: Notebook Dell, Mouse Logitech..."
              value={nome}
              onChangeText={setNome}
              disabled={isLoading}
            />

            <AppTextInput
              label="Descrição"
              placeholder="Descrição detalhada do produto..."
              value={descricao}
              onChangeText={setDescricao}
              disabled={isLoading}
              multiline
              numberOfLines={3}
            />

            <AppTextInput
              label="Preço (R$)"
              placeholder="0,00"
              value={preco}
              onChangeText={setPreco}
              keyboardType="decimal-pad"
              disabled={isLoading}
            />

            <CategoryPicker
              categories={categories}
              selectedCategoryId={categoriaId}
              onSelectCategory={setCategoriaId}
              disabled={isLoading}
            />

            <AppButton
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              {isEditing ? 'Atualizar' : 'Criar Produto'}
            </AppButton>
          </View>
        </ScrollView>

        <Portal>
          <Dialog
            visible={showNoCategoriesDialog}
            onDismiss={() => {
              setShowNoCategoriesDialog(false);
              onNavigateBack?.();
            }}
          >
            <Dialog.Title>Atenção</Dialog.Title>
            <Dialog.Content>
              <Dialog.Content>
                Você precisa criar pelo menos uma categoria antes de cadastrar produtos.
              </Dialog.Content>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => {
                  setShowNoCategoriesDialog(false);
                  onNavigateBack?.();
                }}
              >
                OK
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    flex: 1,
  },
  button: {
    marginTop: 16,
  },
});
