import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { ReminderList } from '../state/reminderStore';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { cn } from '../utils/cn';

interface RenameListModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  list: ReminderList | null;
}

export const RenameListModal: React.FC<RenameListModalProps> = ({
  visible,
  onClose,
  onSave,
  list,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (list) {
      setName(list.name);
    }
  }, [list, visible]);

  const handleSave = () => {
    if (name.trim() && name.trim() !== list?.name) {
      onSave(name.trim());
      onClose();
    } else {
      onClose();
    }
  };

  if (!list) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-8">
        <Animated.View 
          entering={FadeInUp}
          className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        >
          <View className="items-center mb-6">
            <Text className="text-3xl mb-2">{list.emoji}</Text>
            <Text className="text-2xl font-black text-gray-900 mb-2">
              Rename List
            </Text>
            <Text className="text-gray-600 text-center">
              Change the name of your list
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              List Name
            </Text>
            <View className="bg-gray-50 rounded-2xl border-3 border-gray-200 p-2">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter list name..."
                placeholderTextColor="#9CA3AF"
                className="text-xl font-medium p-3 text-gray-900"
                autoFocus
                selectTextOnFocus
                multiline={false}
              />
            </View>
          </View>

          <View className="flex-row">
            <Pressable
              onPress={onClose}
              className="flex-1 py-4 rounded-2xl items-center bg-gray-100 border-3 border-gray-200 mr-3"
            >
              <Text className="text-gray-700 font-bold text-lg">
                Cancel
              </Text>
            </Pressable>
            
            <Pressable
              onPress={handleSave}
              disabled={!name.trim()}
              className={cn(
                "flex-1 py-4 rounded-2xl items-center border-3",
                name.trim()
                  ? "bg-blue-500 border-blue-600"
                  : "bg-gray-300 border-gray-400"
              )}
            >
              <Text
                className={cn(
                  "font-bold text-lg",
                  name.trim() ? "text-white" : "text-gray-500"
                )}
              >
                Save
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};