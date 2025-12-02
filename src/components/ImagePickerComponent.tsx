import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { uploadService } from '../services/upload.service';

interface ImagePickerComponentProps {
  value?: string;
  onImageSelect: (url: string) => void;
  label?: string;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  value,
  onImageSelect,
  label = 'Imagem',
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== 'granted' || libraryPermission.status !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Precisamos de permissão para acessar a câmera e galeria de fotos.'
      );
      return false;
    }

    return true;
  };

  const pickImage = async (useCamera: boolean) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        
        const uploadResponse = await uploadService.uploadImage(result.assets[0].uri);
        onImageSelect(uploadResponse.url);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao processar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Selecionar imagem',
      'Escolha uma opção',
      [
        {
          text: 'Tirar foto',
          onPress: () => pickImage(true),
        },
        {
          text: 'Escolher da galeria',
          onPress: () => pickImage(false),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={showOptions}
        disabled={isUploading}
      >
        {isUploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Enviando imagem...</Text>
          </View>
        ) : value ? (
          <Image source={{ uri: value }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>Toque para adicionar foto</Text>
          </View>
        )}
      </TouchableOpacity>

      {value && !isUploading && (
        <TouchableOpacity
          style={styles.changeButton}
          onPress={showOptions}
        >
          <Text style={styles.changeButtonText}>Alterar imagem</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.gray[100],
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  changeButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
