import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { lightTheme } from './src/config/theme';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { CategoryFormScreen } from './src/screens/CategoryFormScreen';
import { ProductFormScreen } from './src/screens/ProductFormScreen';
import { Category, Product } from './src/types';

type Screen = 'login' | 'register' | 'home' | 'categories' | 'products' | 'categoryForm' | 'productForm';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#ffffff' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (isAuthenticated) {
    switch (currentScreen) {
      case 'categories':
        return (
          <CategoriesScreen
            onNavigateBack={() => setCurrentScreen('home')}
            onNavigateToForm={(category?: Category) => {
              setSelectedCategory(category);
              setCurrentScreen('categoryForm');
            }}
          />
        );
      
      case 'categoryForm':
        return (
          <CategoryFormScreen
            category={selectedCategory}
            onNavigateBack={() => {
              setSelectedCategory(undefined);
              setCurrentScreen('categories');
            }}
            onSuccess={() => {
              setSelectedCategory(undefined);
            }}
          />
        );
      
      case 'products':
        return (
          <ProductsScreen
            onNavigateBack={() => setCurrentScreen('home')}
            onNavigateToForm={(product?: Product) => {
              setSelectedProduct(product);
              setCurrentScreen('productForm');
            }}
          />
        );
      
      case 'productForm':
        return (
          <ProductFormScreen
            product={selectedProduct}
            onNavigateBack={() => {
              setSelectedProduct(undefined);
              setCurrentScreen('products');
            }}
            onSuccess={() => {
              setSelectedProduct(undefined);
            }}
          />
        );
      
      default:
        return (
          <HomeScreen
            onNavigateToCategories={() => setCurrentScreen('categories')}
            onNavigateToProducts={() => setCurrentScreen('products')}
          />
        );
    }
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen 
        onNavigateToLogin={() => setCurrentScreen('login')} 
      />
    );
  }

  return (
    <LoginScreen 
      onNavigateToRegister={() => setCurrentScreen('register')} 
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: '#ffffff' }}>
      <PaperProvider theme={lightTheme}>
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <AuthProvider>
            <StatusBar style="dark" backgroundColor="#ffffff" />
            <AppContent />
          </AuthProvider>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
