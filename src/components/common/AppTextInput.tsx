import React from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { StyleProp, ViewStyle, KeyboardTypeOptions } from 'react-native';
import { View } from 'react-native';

interface AppTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  mode?: 'flat' | 'outlined';
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  touched,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  mode = 'outlined',
  left,
  right,
  style,
}) => {
  const hasError = !!(touched && error);

  return (
    <View style={[{ marginVertical: 8 }, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        error={hasError}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        disabled={disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        mode={mode}
        left={left}
        right={right}
      />
      {hasError && (
        <HelperText type="error" visible={hasError}>
          {error}
        </HelperText>
      )}
    </View>
  );
};
