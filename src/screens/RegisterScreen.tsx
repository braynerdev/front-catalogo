import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Text, TextInput as PaperTextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { AppButton, AppTextInput } from '../components/common';
import { AppSnackbar } from '../components/AppSnackbar';
import { validateRegisterForm } from '../utils/validation';
import { parseBackendErrors, getErrorMessage } from '../utils/error.parser';
import { useToast } from '../hooks/useToast';
import { useFormValidation } from '../hooks/useFormValidation';

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const { errors, touched, setFieldError, setFieldTouched, clearFieldError, setMultipleErrors, touchAllFields } = useFormValidation();

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    
    if (touched[field]) {
      clearFieldError(field);
    }
  };

  const handleRegister = async () => {
    touchAllFields(['name', 'username', 'email', 'password', 'confirmPassword']);
    
    const validation = validateRegisterForm(name, username, email, password, confirmPassword);
    
    if (!validation.isValid) {
      setMultipleErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      showToast(firstError || 'Corrija os erros do formulário', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await register({ name, username, email, password });
      
      if (response.valid) {
        showToast('Cadastro realizado! Faça login', 'success');
        setTimeout(() => {
          onNavigateToLogin?.();
        }, 2000);
      } else {
        showToast(response.message, 'error');
      }
    } catch (error: any) {
      const backendErrors = parseBackendErrors(error);
      
      if (Object.keys(backendErrors).length > 0) {
        setMultipleErrors(backendErrors);
        touchAllFields(['name', 'username', 'email', 'password', 'confirmPassword']);
        const firstError = Object.values(backendErrors)[0];
        showToast(firstError, 'error');
      } else {
        const errorMsg = getErrorMessage(error);
        showToast(errorMsg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.title}>Criar Conta</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>Preencha os dados para começar</Text>
          </View>

          <View style={styles.formContainer}>
            <AppTextInput
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              value={name}
              onChangeText={(value) => handleFieldChange('name', value)}
              onBlur={() => setFieldTouched('name')}
              error={errors.name}
              touched={touched.name}
              disabled={isLoading}
              left={<PaperTextInput.Icon icon="account" />}
            />

            <AppTextInput
              label="Usuário"
              placeholder="Escolha um nome de usuário"
              value={username}
              onChangeText={(value) => handleFieldChange('username', value)}
              onBlur={() => setFieldTouched('username')}
              autoCapitalize="none"
              error={errors.username}
              touched={touched.username}
              disabled={isLoading}
              left={<PaperTextInput.Icon icon="account-circle" />}
            />

            <AppTextInput
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChangeText={(value) => handleFieldChange('email', value)}
              onBlur={() => setFieldTouched('email')}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
              touched={touched.email}
              disabled={isLoading}
              left={<PaperTextInput.Icon icon="email" />}
            />

            <AppTextInput
              label="Senha"
              placeholder="Mínimo 6 caracteres (A-z, 0-9)"
              value={password}
              onChangeText={(value) => handleFieldChange('password', value)}
              onBlur={() => setFieldTouched('password')}
              secureTextEntry
              error={errors.password}
              touched={touched.password}
              disabled={isLoading}
              left={<PaperTextInput.Icon icon="lock" />}
            />

            <AppTextInput
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChangeText={(value) => handleFieldChange('confirmPassword', value)}
              onBlur={() => setFieldTouched('confirmPassword')}
              secureTextEntry
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              disabled={isLoading}
              left={<PaperTextInput.Icon icon="lock-check" />}
            />

            <AppButton
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              Cadastrar
            </AppButton>

            {onNavigateToLogin && (
              <View style={styles.footer}>
                <Text variant="bodyMedium">Já tem uma conta? </Text>
                <AppButton
                  mode="text"
                  onPress={onNavigateToLogin}
                  disabled={isLoading}
                  style={styles.linkButton}
                >
                  Fazer login
                </AppButton>
              </View>
            )}
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
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  linkButton: {
    marginVertical: 0,
  },
});
