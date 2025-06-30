import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ReminderItem } from '../state/reminderStore';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

interface CategoryHeaderProps {
  category: string;
  items: ReminderItem[];
  onLongPress: (category: string, items: ReminderItem[]) => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  items,
  onLongPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleLongPress = () => {
    // Feedback animation for long press
    scale.value = withSequence(
      withSpring(0.95, { duration: 150 }),
      withSpring(1.05, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );
    onLongPress(category, items);
  };

  const completedCount = items.filter(item => item.isChecked).length;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={400}
        className="bg-white/70 rounded-2xl p-4 mb-3 shadow-sm border-2 border-transparent active:border-blue-300"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-black text-gray-800 mb-1">
              {category}
            </Text>
            <Text className="text-gray-600 font-medium">
              {completedCount}/{items.length} completed
            </Text>
          </View>
          
         
        </View>
      </Pressable>
    </Animated.View>
  );
};