import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Card, Button, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
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
  const [showDialog, setShowDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== 'granted' || libraryPermission.status !== 'granted') {
      setShowPermissionDialog(true);
      return false;
    }

    return true;
  };

  const pickImage = async (useCamera: boolean) => {
    setShowDialog(false);
    
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
      setShowPermissionDialog(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.label}>{label}</Text>
      
      <Card style={styles.imageCard} mode="outlined">
        <Card.Content style={styles.cardContent}>
          {isUploading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text variant="bodySmall" style={styles.loadingText}>
                Enviando imagem...
              </Text>
            </View>
          ) : value ? (
            <Image source={{ uri: value }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text variant="bodyMedium" style={styles.placeholderText}>
                Toque para adicionar foto
              </Text>
            </View>
          )}
        </Card.Content>
        {!isUploading && (
          <Card.Actions>
            <Button
              mode="contained-tonal"
              onPress={() => setShowDialog(true)}
              icon={value ? 'image-edit' : 'camera'}
            >
              {value ? 'Alterar' : 'Adicionar'}
            </Button>
          </Card.Actions>
        )}
      </Card>

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Selecionar imagem</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Escolha uma opção</Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => pickImage(true)} icon="camera">
              Tirar foto
            </Button>
            <Button onPress={() => pickImage(false)} icon="image">
              Galeria
            </Button>
            <Button onPress={() => setShowDialog(false)}>
              Cancelar
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={showPermissionDialog} 
          onDismiss={() => setShowPermissionDialog(false)}
        >
          <Dialog.Title>Permissões necessárias</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Precisamos de permissão para acessar a câmera e galeria de fotos.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPermissionDialog(false)}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  imageCard: {
    overflow: 'hidden',
  },
  cardContent: {
    padding: 0,
    minHeight: 200,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  placeholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    opacity: 0.6,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  dialogActions: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});
