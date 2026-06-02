import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { style } from './styles';

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
}

export function FormField({ label, icon, editable = true, ...rest }: FormFieldProps) {
  return (
    <View style={style.group}>
      <Text style={style.label}>{label}</Text>
      <View style={[style.container, !editable && style.containerDisabled]}>
        {icon && <View style={style.icon}>{icon}</View>}
        <TextInput
          style={style.input}
          editable={editable}
          placeholderTextColor="#aaa"
          {...rest}
        />
      </View>
    </View>
  );
}
