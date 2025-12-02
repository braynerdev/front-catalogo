import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { FormInput } from '../components/FormInput';
import { ImagePickerComponent } from '../components/ImagePickerComponent';
import { Toast } from '../components/Toast';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { Product, ProductFormData, Category } from '../types';
import { useToast } from '../hooks';
import { styles } from '../styles/ProductFormScreen.styles';

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
  const [categoriaId, setCategoriaId] = useState(product?.categoriaId?.toString() || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  const isEditing = !!product;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await categoryService.getAll();
      setCategories(data);
      
      if (data.length === 0) {
        Alert.alert(
          'Atenção',
          'Você precisa criar pelo menos uma categoria antes de cadastrar produtos.',
          [{ text: 'OK', onPress: () => onNavigateBack?.() }]
        );
      }
    } catch (error) {
      showToast('Erro ao carregar categorias', 'error');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const selectCategory = () => {
    if (categories.length === 0) return;

    const options = categories.map((cat) => ({
      text: cat.name,
      onPress: () => setCategoriaId(cat.categoriaId.toString()),
    }));

    options.push({ text: 'Cancelar', onPress: () => {} });

    Alert.alert('Selecione uma Categoria', '', options);
  };

  const validateForm = (): boolean => {
    if (!nome.trim()) {
      showToast('Nome do produto é obrigatório', 'error');
      return false;
    }

    if (!preco.trim() || isNaN(parseFloat(preco))) {
      showToast('Preço inválido', 'error');
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
        Preco: parseFloat(preco),
        ImagemUrl: imagemUrl || undefined,
        CategoriaId: parseInt(categoriaId),
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

  const getSelectedCategoryName = () => {
    const category = categories.find((cat) => cat.categoriaId.toString() === categoriaId);
    return category?.name || 'Selecione uma categoria';
  };

  if (isLoadingCategories) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Toast
            visible={toast.visible}
            message={toast.message}
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
            <Text style={styles.title}>
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.formContainer}>
            <ImagePickerComponent
              label="Imagem do Produto"
              value={imagemUrl}
              onImageSelect={setImagemUrl}
            />

            <FormInput
              label="Nome do Produto"
              placeholder="Ex: Notebook Dell, Mouse Logitech..."
              value={nome}
              onChangeText={setNome}
              editable={!isLoading}
            />

            <FormInput
              label="Descrição"
              placeholder="Descrição detalhada do produto..."
              value={descricao}
              onChangeText={setDescricao}
              editable={!isLoading}
              multiline
              numberOfLines={3}
            />

            <FormInput
              label="Preço (R$)"
              placeholder="0,00"
              value={preco}
              onChangeText={setPreco}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Categoria</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={selectCategory}
                disabled={isLoading}
              >
                <Text style={[styles.selectButtonText, !categoriaId && styles.placeholderText]}>
                  {getSelectedCategoryName()}
                </Text>
                <Text style={styles.selectIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {isEditing ? 'Atualizar' : 'Criar Produto'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
