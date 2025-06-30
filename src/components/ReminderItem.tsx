import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ReminderItem as ReminderItemType } from '../state/reminderStore';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, runOnJS } from 'react-native-reanimated';
import { cn } from '../utils/cn';

interface ReminderItemProps {
  item: ReminderItemType;
  onToggle: (id: string) => void;
  onLongPress: (item: ReminderItemType) => void;
}

const celebrationEmojis = ['🎉', '✨', '🌟', '💫', '🎊'];

export const ReminderItem: React.FC<ReminderItemProps> = ({
  item,
  onToggle,
  onLongPress,
}) => {
  const scale = useSharedValue(1);
  const celebrationScale = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    position: 'absolute',
    top: -10,
    right: 10,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const triggerCelebration = () => {
    celebrationScale.value = withSequence(
      withSpring(1.5, { duration: 300 }),
      withSpring(0, { duration: 200 })
    );
  };

  const handleToggle = () => {
    if (!item.isChecked) {
      // Celebration animation for completing an item
      runOnJS(triggerCelebration)();
    }
    
    onToggle(item.id);
    
    // Bounce animation
    scale.value = withSequence(
      withSpring(1.1, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );
  };

  const handleLongPress = () => {
    // Feedback animation for long press
    scale.value = withSequence(
      withSpring(0.95, { duration: 150 }),
      withSpring(1.05, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );
    onLongPress(item);
  };

  return (
    <Animated.View className="relative mb-4">
      <Animated.View style={animatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleToggle}
          onLongPress={handleLongPress}
          delayLongPress={400}
          className={cn(
            "flex-row items-center p-5 rounded-3xl shadow-sm border-3",
            item.isChecked 
              ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300" 
              : "bg-white border-gray-200"
          )}
        >
          <View className="flex-row items-center flex-1">
            <View
              className={cn(
                "w-8 h-8 rounded-full border-3 mr-4 items-center justify-center shadow-sm",
                item.isChecked
                  ? "bg-green-500 border-green-400"
                  : "border-gray-300 bg-white"
              )}
            >
              {item.isChecked && (
                <Text className="text-white text-lg font-black">✓</Text>
              )}
            </View>
            
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xl font-bold mb-1",
                  item.isChecked
                    ? "text-green-700 line-through"
                    : "text-gray-900"
                )}
              >
                {item.title}
              </Text>
              <View className={cn(
                "px-3 py-1 rounded-full self-start",
                item.isChecked 
                  ? "bg-green-200" 
                  : "bg-blue-100"
              )}>
                <Text className={cn(
                  "text-xs font-semibold",
                  item.isChecked ? "text-green-700" : "text-blue-700"
                )}>
                  {item.category}
                </Text>
              </View>
            </View>
          </View>

          
        </Pressable>
      </Animated.View>

      {/* Celebration Animation */}
      <Animated.View style={celebrationStyle}>
        <Text className="text-3xl">
          {celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)]}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};