import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isActive,
  onEdit,
  onToggleStatus,
}) => {
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.imageContainer}>
          {category.imagemUrl ? (
            <Image
              source={{ uri: category.imagemUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderIcon}>📂</Text>
            </View>
          )}
        </View>
        
        <View style={styles.info}>
          <Text variant="titleLarge" style={styles.name} numberOfLines={2}>
            {category.name}
          </Text>
          <Text variant="bodySmall" style={styles.id}>
            ID: {category.categoriaId}
          </Text>
        </View>

        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            mode="contained-tonal"
            size={20}
            onPress={() => onEdit(category)}
          />
          <IconButton
            icon={isActive ? 'close-circle' : 'check-circle'}
            mode="contained-tonal"
            iconColor={isActive ? '#EF4444' : '#10B981'}
            size={20}
            onPress={() => onToggleStatus(category)}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    marginBottom: 4,
  },
  id: {
    opacity: 0.6,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'column',
    gap: 4,
  },
});
