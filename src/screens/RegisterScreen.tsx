import React, { useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/Toast';
import { FormInput } from '../components/FormInput';
import { styles } from '../styles/RegisterScreen.styles';
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
      console.log('Erro no registro:', error);
      console.log('Resposta do backend:', error?.response?.data);
      
      const backendErrors = parseBackendErrors(error);
      
      if (Object.keys(backendErrors).length > 0) {
        console.log('Erros mapeados para campos:', backendErrors);
        setMultipleErrors(backendErrors);
        touchAllFields(['name', 'username', 'email', 'password', 'confirmPassword']);
        const firstError = Object.values(backendErrors)[0];
        showToast(firstError, 'error');
      } else {
        const errorMsg = getErrorMessage(error);
        console.log('Mensagem de erro genérica:', errorMsg);
        showToast(errorMsg, 'error');
      }
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
      >
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />

        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para começar</Text>
        </View>

        <View style={styles.formContainer}>
          <FormInput
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            value={name}
            onChangeText={(value) => handleFieldChange('name', value)}
            onBlur={() => setFieldTouched('name')}
            error={errors.name}
            touched={touched.name}
            editable={!isLoading}
          />

          <FormInput
            label="Usuário"
            placeholder="Escolha um nome de usuário"
            value={username}
            onChangeText={(value) => handleFieldChange('username', value)}
            onBlur={() => setFieldTouched('username')}
            autoCapitalize="none"
            error={errors.username}
            touched={touched.username}
            editable={!isLoading}
          />

          <FormInput
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={(value) => handleFieldChange('email', value)}
            onBlur={() => setFieldTouched('email')}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
            touched={touched.email}
            editable={!isLoading}
          />

          <FormInput
            label="Senha"
            placeholder="Mínimo 6 caracteres (A-z, 0-9)"
            value={password}
            onChangeText={(value) => handleFieldChange('password', value)}
            onBlur={() => setFieldTouched('password')}
            secureTextEntry
            error={errors.password}
            touched={touched.password}
            editable={!isLoading}
          />

          <FormInput
            label="Confirmar Senha"
            placeholder="Digite a senha novamente"
            value={confirmPassword}
            onChangeText={(value) => handleFieldChange('confirmPassword', value)}
            onBlur={() => setFieldTouched('confirmPassword')}
            secureTextEntry
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          {onNavigateToLogin && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <TouchableOpacity
                onPress={onNavigateToLogin}
                disabled={isLoading}
              >
                <Text style={styles.linkText}>Fazer login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

