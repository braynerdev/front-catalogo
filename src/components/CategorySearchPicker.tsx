import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Searchbar, Menu, Card, Text, Chip } from 'react-native-paper';
import { categoryService } from '../services/category.service';
import { Category } from '../types';

interface CategorySearchPickerProps {
  selectedCategoryId?: number;
  onSelectCategory: (categoryId: number | undefined) => void;
  placeholder?: string;
}

export const CategorySearchPicker: React.FC<CategorySearchPickerProps> = ({
  selectedCategoryId,
  onSelectCategory,
  placeholder = 'Buscar categoria...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 0) {
        loadCategories(searchQuery);
      } else if (menuVisible) {
        loadCategories();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedCategoryId && !selectedCategory) {
      loadSelectedCategory();
    }
  }, [selectedCategoryId]);

  const loadSelectedCategory = async () => {
    if (!selectedCategoryId) return;
    try {
      const data = await categoryService.getAll(1, 100, undefined, true);
      const category = data.items.find(c => c.categoriaId === selectedCategoryId);
      if (category) {
        setSelectedCategory(category);
      }
    } catch (error) {
    }
  };

  const loadCategories = async (search?: string) => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAll(1, 20, search, true);
      setCategories(data.items);
      if (data.items.length > 0) {
        setMenuVisible(true);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    onSelectCategory(category.categoriaId);
    setSearchQuery('');
    setCategories([]);
    setMenuVisible(false);
  };

  const handleClearSelection = () => {
    setSelectedCategory(null);
    onSelectCategory(undefined);
    setSearchQuery('');
  };

  const handleFocus = () => {
    if (!selectedCategory && searchQuery.length === 0) {
      loadCategories();
      setMenuVisible(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setMenuVisible(false);
    }, 200);
  };

  return (
    <View style={styles.container}>
      {selectedCategory ? (
        <View style={styles.selectedContainer}>
          <Chip
            mode="outlined"
            onClose={handleClearSelection}
            style={styles.chip}
          >
            {selectedCategory.name}
          </Chip>
        </View>
      ) : (
        <>
          <Searchbar
            placeholder={placeholder}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.length > 0) {
                setMenuVisible(true);
              }
            }}
            value={searchQuery}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={styles.searchbar}
            loading={isLoading}
          />
          
          {menuVisible && categories.length > 0 && (
            <Card style={styles.dropdown} mode="outlined">
              <FlatList
                data={categories}
                keyExtractor={(item) => item.categoriaId.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectCategory(item)}>
                    <Card.Title
                      title={item.name}
                      titleVariant="bodyMedium"
                      style={styles.menuItem}
                    />
                  </TouchableOpacity>
                )}
                style={styles.list}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </Card>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    zIndex: 1000,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F3F4F6',
  },
  dropdown: {
    marginTop: 4,
    maxHeight: 200,
    elevation: 4,
  },
  list: {
    maxHeight: 200,
  },
  menuItem: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    alignSelf: 'flex-start',
  },
});
