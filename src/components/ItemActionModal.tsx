import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { ReminderItem } from '../state/reminderStore';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { cn } from '../utils/cn';

interface ItemActionModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  item: ReminderItem | null;
}

export const ItemActionModal: React.FC<ItemActionModalProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  item,
}) => {
  const editScale = useSharedValue(1);
  const deleteScale = useSharedValue(1);

  const editAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editScale.value }],
  }));

  const deleteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
  }));

  const handleEditPress = () => {
    editScale.value = withSpring(0.9, { duration: 100 }, () => {
      editScale.value = withSpring(1, { duration: 100 });
    });
    setTimeout(() => {
      onEdit();
      onClose();
    }, 100);
  };

  const handleDeletePress = () => {
    deleteScale.value = withSpring(0.9, { duration: 100 }, () => {
      deleteScale.value = withSpring(1, { duration: 100 });
    });
    setTimeout(() => {
      onDelete();
      onClose();
    }, 100);
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/60 justify-center items-center px-8"
        onPress={onClose}
      >
        <Animated.View 
          entering={FadeInUp}
          className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        >
          <View className="items-center mb-6">
            <Text className="text-2xl font-black text-gray-900 mb-2">
              ⚙️ Item Options
            </Text>
            <View className="bg-gray-50 px-4 py-2 rounded-2xl">
              <Text className="text-lg font-bold text-gray-700 text-center">
                "{item.title}"
              </Text>
            </View>
          </View>

          <View>
            {/* Edit Button */}
            <Animated.View style={editAnimatedStyle} className="mb-3">
              <Pressable
                onPress={handleEditPress}
                className="bg-blue-500 p-4 rounded-2xl flex-row items-center justify-center border-3 border-blue-600"
              >
                <Text className="text-2xl mr-3">✏️</Text>
                <Text className="text-white font-black text-lg">
                  Edit Name & Category
                </Text>
              </Pressable>
            </Animated.View>

            {/* Delete Button */}
            <Animated.View style={deleteAnimatedStyle} className="mb-3">
              <Pressable
                onPress={handleDeletePress}
                className="bg-red-500 p-4 rounded-2xl flex-row items-center justify-center border-3 border-red-600"
              >
                <Text className="text-2xl mr-3">🗑️</Text>
                <Text className="text-white font-black text-lg">
                  Delete Item
                </Text>
              </Pressable>
            </Animated.View>

            {/* Cancel Button */}
            <Pressable
              onPress={onClose}
              className="bg-gray-100 p-4 rounded-2xl flex-row items-center justify-center border-3 border-gray-200"
            >
              <Text className="text-2xl mr-3">❌</Text>
              <Text className="text-gray-700 font-black text-lg">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};