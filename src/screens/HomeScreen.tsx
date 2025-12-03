import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, IconButton, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileCard } from '../components/UserProfileCard';
import { DashboardStats } from '../components/DashboardStats';

interface HomeScreenProps {
  onNavigateToCategories?: () => void;
  onNavigateToProducts?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onNavigateToCategories,
  onNavigateToProducts 
}) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Bem-vindo de volta! 👋
        </Text>
        <IconButton
          icon="logout"
          mode="contained-tonal"
          iconColor="#EF4444"
          size={24}
          onPress={logout}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <UserProfileCard user={user} />

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Gerenciamento
          </Text>
          
          <Card 
            mode="elevated" 
            style={styles.navCard}
            onPress={() => onNavigateToCategories?.()}
          >
            <Card.Content style={styles.cardContent}>
              <Surface style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]} elevation={0}>
                <Text style={styles.cardIcon}>📂</Text>
              </Surface>
              <View style={styles.cardInfo}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Categorias
                </Text>
                <Text variant="bodyMedium" style={styles.cardDescription}>
                  Criar e gerenciar categorias de produtos
                </Text>
              </View>
              <IconButton icon="chevron-right" size={20} />
            </Card.Content>
          </Card>

          <Card 
            mode="elevated" 
            style={styles.navCard}
            onPress={() => onNavigateToProducts?.()}
          >
            <Card.Content style={styles.cardContent}>
              <Surface style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]} elevation={0}>
                <Text style={styles.cardIcon}>📦</Text>
              </Surface>
              <View style={styles.cardInfo}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Produtos
                </Text>
                <Text variant="bodyMedium" style={styles.cardDescription}>
                  Adicionar e editar produtos do catálogo
                </Text>
              </View>
              <IconButton icon="chevron-right" size={20} />
            </Card.Content>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Estatísticas Rápidas
          </Text>
          <DashboardStats />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  navCard: {
    marginVertical: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    opacity: 0.7,
  },
});
