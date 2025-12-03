import React from 'react';
import { Appbar } from 'react-native-paper';

interface AppBarProps {
  title: string;
  onBack?: () => void;
  actions?: Array<{
    icon: string;
    onPress: () => void;
  }>;
}

export const AppBar: React.FC<AppBarProps> = ({
  title,
  onBack,
  actions = [],
}) => {
  return (
    <Appbar.Header>
      {onBack && <Appbar.BackAction onPress={onBack} />}
      <Appbar.Content title={title} />
      {actions.map((action, index) => (
        <Appbar.Action
          key={index}
          icon={action.icon}
          onPress={action.onPress}
        />
      ))}
    </Appbar.Header>
  );
};
