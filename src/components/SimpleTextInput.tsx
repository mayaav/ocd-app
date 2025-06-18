import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '../utils/cn';

interface SimpleTextInputProps extends TextInputProps {
  className?: string;
}

export const SimpleTextInput: React.FC<SimpleTextInputProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <TextInput
      {...props}
      className={cn("text-lg", className)}
    />
  );
};