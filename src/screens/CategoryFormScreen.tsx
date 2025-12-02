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
} from 'react-native';
import { FormInput } from '../components/FormInput';
import { ImagePickerComponent } from '../components/ImagePickerComponent';
import { Toast } from '../components/Toast';
import { categoryService } from '../services/category.service';
import { Category, CategoryFormData } from '../types';
import { useToast } from '../hooks';
import { styles } from '../styles/CategoryFormScreen.styles';

interface CategoryFormScreenProps {
  category?: Category;
  onNavigateBack?: () => void;
  onSuccess?: () => void;
}

export const CategoryFormScreen: React.FC<CategoryFormScreenProps> = ({
  category,
  onNavigateBack,
  onSuccess,
}) => {
  const [nome, setNome] = useState(category?.name || '');
  const [imagemUrl, setImagemUrl] = useState(category?.imagemUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [nomeError, setNomeError] = useState('');
  const { toast, showToast, hideToast } = useToast();

  const isEditing = !!category;

  const validateForm = (): boolean => {
    let isValid = true;

    if (!nome.trim()) {
      setNomeError('Nome da categoria é obrigatório');
      isValid = false;
    } else if (nome.trim().length < 3) {
      setNomeError('Nome deve ter no mínimo 3 caracteres');
      isValid = false;
    } else {
      setNomeError('');
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Corrija os erros do formulário', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const formData: CategoryFormData = {
        Name: nome.trim(),
        ImagemUrl: imagemUrl || undefined,
      };

      if (isEditing) {
        await categoryService.update(category.categoriaId, formData);
        showToast('Categoria atualizada com sucesso!', 'success');
      } else {
        await categoryService.create(formData);
        showToast('Categoria criada com sucesso!', 'success');
      }

      setTimeout(() => {
        onSuccess?.();
        onNavigateBack?.();
      }, 1500);
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar categoria', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
              {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.formContainer}>
            <ImagePickerComponent
              label="Imagem da Categoria"
              value={imagemUrl}
              onImageSelect={setImagemUrl}
            />

            <FormInput
              label="Nome da Categoria"
              placeholder="Ex: Eletrônicos, Alimentos..."
              value={nome}
              onChangeText={(value) => {
                setNome(value);
                if (nomeError) setNomeError('');
              }}
              error={nomeError}
              touched={!!nomeError}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {isEditing ? 'Atualizar' : 'Criar Categoria'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
