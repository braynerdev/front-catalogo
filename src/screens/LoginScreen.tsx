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
import { validateLoginForm } from '../utils/validation';
import { useToast } from '../hooks/useToast';

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { toast, showToast, hideToast } = useToast();

  const handleValidation = () => {
    const validation = validateLoginForm(username, password);
    
    setUsernameError(validation.errors.username);
    setPasswordError(validation.errors.password);

    if (!validation.isValid) {
      showToast('Preencha todos os campos corretamente', 'error');
    }

    return validation.isValid;
  };

  const handleLogin = async () => {
    if (!handleValidation()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({ username, password });
      
      if (!response.valid) {
        showToast(response.message, 'error');
      } else {
        showToast('Login realizado com sucesso!', 'success');
      }
    } catch (error) {
      showToast('Ocorreu um erro ao fazer login', 'error');
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
            <Text variant="headlineLarge" style={styles.title}>Bem-vindo</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>Faça login para continuar</Text>
          </View>

          <View style={styles.formContainer}>
            <AppTextInput
              label="Usuário"
              placeholder="Digite seu usuário"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError('');
              }}
              error={usernameError}
              touched={!!usernameError}
              autoCapitalize="none"
              disabled={isLoading}
              left={<PaperTextInput.Icon icon="account" />}
            />

            <AppTextInput
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              error={passwordError}
              touched={!!passwordError}
              secureTextEntry
              disabled={isLoading}
              left={<PaperTextInput.Icon icon="lock" />}
            />

            <AppButton
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              Entrar
            </AppButton>

            {onNavigateToRegister && (
              <View style={styles.footer}>
                <Text variant="bodyMedium">Não tem uma conta? </Text>
                <AppButton
                  mode="text"
                  onPress={onNavigateToRegister}
                  disabled={isLoading}
                  style={styles.linkButton}
                >
                  Cadastre-se
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
