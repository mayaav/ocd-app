import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { ReminderItem } from '../state/reminderStore';
import { cn } from '../utils/cn';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface AddEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, category: string) => void;
  editItem?: ReminderItem | null;
}

const categories = [
  { name: 'Essential', emoji: '🔑', color: 'bg-red-500' },
  { name: 'Personal', emoji: '👤', color: 'bg-blue-500' },
  { name: 'Work', emoji: '💼', color: 'bg-purple-500' },
  { name: 'Travel', emoji: '✈️', color: 'bg-green-500' },
  { name: 'Exercise', emoji: '💪', color: 'bg-orange-500' },
  { name: 'Other', emoji: '📋', color: 'bg-gray-500' }
];

export const AddEditModal: React.FC<AddEditModalProps> = ({
  visible,
  onClose,
  onSave,
  editItem,
}) => {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Essential');

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setSelectedCategory(editItem.category);
    } else {
      setTitle('');
      setSelectedCategory('Essential');
    }
  }, [editItem, visible]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), selectedCategory);
      onClose();
    }
  };

  const CategoryButton: React.FC<{ category: typeof categories[0] }> = ({ category }) => {
    const scale = useSharedValue(1);
    const isSelected = selectedCategory === category.name;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      scale.value = withSpring(0.9, { duration: 100 }, () => {
        scale.value = withSpring(1, { duration: 100 });
      });
      setSelectedCategory(category.name);
    };

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          className={cn(
            "flex-row items-center px-4 py-3 rounded-2xl mr-3 mb-3 border-3",
            isSelected ? `${category.color} border-gray-800` : "bg-white border-gray-200"
          )}
        >
          <Text className="text-xl mr-2">{category.emoji}</Text>
          <Text
            className={cn(
              "font-bold",
              isSelected ? "text-white" : "text-gray-700"
            )}
          >
            {category.name}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <Animated.View 
          entering={FadeInUp}
          className="bg-white rounded-t-3xl p-6 min-h-[60%] shadow-2xl"
        >
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-3xl font-black text-gray-900 mb-1">
                {editItem ? '✏️ Edit Item' : '✨ Add New Item'}
              </Text>
              <Text className="text-gray-600 font-medium">
                {editItem ? 'Make your changes below' : 'Add something to remember!'}
              </Text>
            </View>
            <Pressable onPress={onClose} className="p-3 rounded-full bg-gray-100">
              <Text className="text-gray-600 text-2xl">✕</Text>
            </Pressable>
          </View>

          <View className="mb-8">
            <Text className="text-xl font-black text-gray-900 mb-4">
              📝 What do you need to remember?
            </Text>
            <View className="bg-gray-50 rounded-2xl border-3 border-gray-200 p-2">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Type item name here..."
                placeholderTextColor="#9CA3AF"
                className="text-xl font-medium p-3 text-gray-900"
                autoFocus
                multiline={false}
              />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-xl font-black text-gray-900 mb-4">
              🏷️ Pick a category
            </Text>
            <View className="flex-row flex-wrap">
              {categories.map((category) => (
                <CategoryButton key={category.name} category={category} />
              ))}
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={!title.trim()}
            className={cn(
              "py-5 rounded-2xl items-center shadow-lg border-3",
              title.trim()
                ? "bg-blue-500 border-blue-600"
                : "bg-gray-300 border-gray-400"
            )}
          >
            <Text
              className={cn(
                "text-xl font-black",
                title.trim() ? "text-white" : "text-gray-500"
              )}
            >
              {editItem ? '✅ Update Item' : '🚀 Add Item'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};