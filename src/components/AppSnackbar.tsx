import React from 'react';
import { Snackbar } from 'react-native-paper';

interface AppSnackbarProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
}

export const AppSnackbar: React.FC<AppSnackbarProps> = ({
  visible,
  message,
  type = 'info',
  onDismiss,
  duration = 3000,
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      style={{ backgroundColor: getBackgroundColor() }}
      action={{
        label: 'OK',
        onPress: onDismiss,
        textColor: '#FFFFFF',
      }}
    >
      {message}
    </Snackbar>
  );
};
