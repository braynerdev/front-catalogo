import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImagePickerComponent } from '../components/ImagePickerComponent';
import { categoryService } from '../services/category.service';
import { Category, CategoryFormData } from '../types';
import { useToast } from '../hooks';
import { AppBar, AppButton, AppTextInput } from '../components/common';
import { AppSnackbar } from '../components/AppSnackbar';

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar 
        title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
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
              label="Imagem da Categoria"
              value={imagemUrl}
              onImageSelect={setImagemUrl}
            />

            <AppTextInput
              label="Nome da Categoria"
              placeholder="Ex: Eletrônicos, Alimentos..."
              value={nome}
              onChangeText={(value) => {
                setNome(value);
                if (nomeError) setNomeError('');
              }}
              error={nomeError}
              touched={!!nomeError}
              disabled={isLoading}
            />

            <AppButton
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              {isEditing ? 'Atualizar' : 'Criar Categoria'}
            </AppButton>
          </View>
        </ScrollView>

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
