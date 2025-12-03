import React from 'react';
import { Card } from 'react-native-paper';
import { StyleProp, ViewStyle } from 'react-native';

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  mode?: 'elevated' | 'outlined' | 'contained';
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  style,
  mode = 'elevated',
}) => {
  return (
    <Card
      mode={mode}
      onPress={onPress}
      style={[{ marginVertical: 8 }, style]}
    >
      {children}
    </Card>
  );
};
