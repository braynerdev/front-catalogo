import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, Divider } from 'react-native-paper';
import { Category } from '../types';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId?: number;
  onSelectCategory: (categoryId: number | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  disabled = false,
  placeholder = 'Selecione uma categoria',
}) => {
  const [visible, setVisible] = useState(false);

  const selectedCategory = categories.find(
    (cat) => cat.categoriaId === selectedCategoryId
  );

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (categoryId: number | undefined) => {
    onSelectCategory(categoryId);
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            disabled={disabled}
            icon="chevron-down"
            contentStyle={styles.buttonContent}
            style={styles.button}
          >
            {selectedCategory?.name || placeholder}
          </Button>
        }
      >
        {selectedCategoryId && (
          <>
            <Menu.Item
              onPress={() => handleSelect(undefined)}
              title="Todas as categorias"
              leadingIcon="close"
            />
            <Divider />
          </>
        )}
        {categories.map((category, index) => (
          <React.Fragment key={category.categoriaId}>
            <Menu.Item
              onPress={() => handleSelect(category.categoriaId)}
              title={category.name}
              leadingIcon={
                selectedCategoryId === category.categoriaId
                  ? 'check'
                  : undefined
              }
            />
            {index < categories.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
});
