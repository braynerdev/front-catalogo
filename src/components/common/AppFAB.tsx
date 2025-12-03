import React from 'react';
import { FAB } from 'react-native-paper';
import { StyleProp, ViewStyle } from 'react-native';

interface AppFABProps {
  icon: string;
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const AppFAB: React.FC<AppFABProps> = ({
  icon,
  onPress,
  label,
  style,
}) => {
  return (
    <FAB
      icon={icon}
      onPress={onPress}
      label={label}
      style={[
        {
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        },
        style,
      ]}
    />
  );
};
