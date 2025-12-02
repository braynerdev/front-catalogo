import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { NavigationCard } from '../components/NavigationCard';
import { styles } from '../styles/HomeScreen.styles';

interface HomeScreenProps {
  onNavigateToCategories?: () => void;
  onNavigateToProducts?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNavigateToCategories,
  onNavigateToProducts 
}) => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>Olá, {user?.username}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutIcon}>⎋</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciar</Text>
          
          <NavigationCard
            title="Categorias"
            description="Criar e gerenciar categorias de produtos"
            icon="📂"
            color="#3B82F6"
            onPress={() => onNavigateToCategories?.()}
          />

          <NavigationCard
            title="Produtos"
            description="Adicionar e editar produtos do catálogo"
            icon="📦"
            color="#10B981"
            onPress={() => onNavigateToProducts?.()}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Usuário</Text>
              <Text style={styles.infoValue}>{user?.username}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID</Text>
              <Text style={styles.infoValue}>{user?.id}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

