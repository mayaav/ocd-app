import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReminderStore, ReminderItem as ReminderItemType } from '../state/reminderStore';
import { ReminderItem } from '../components/ReminderItem';
import { CategoryHeader } from '../components/CategoryHeader';
import { AddEditModal } from '../components/AddEditModal';

import Animated, { FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence, runOnJS } from 'react-native-reanimated';
import { cn } from '../utils/cn';

interface ReminderListScreenProps {
  onBack: () => void;
}

const encouragingMessages = [
  "You're doing amazing! 🌟",
  "Keep it up, champion! 💪",
  "Almost there! You've got this! 🎯",
  "Fantastic progress! 🚀",
  "You're on fire! 🔥",
  "Way to stay organized! 📋",
];

const completionMessages = [
  "🎉 Perfect! You're all set!",
  "🌟 Amazing! Ready to conquer the day!",
  "🚀 Fantastic! Nothing forgotten!",
  "💪 Great job! You're fully prepared!",
  "🎊 Excellent! Mission accomplished!",
];

export const ReminderListScreen: React.FC<ReminderListScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { getCurrentList, addItem, toggleItem, deleteItem, updateItem, resetAllItems, getUncheckedCount } = useReminderStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ReminderItemType | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const currentList = getCurrentList();
  const items = currentList?.items || [];
  const uncheckedCount = getUncheckedCount();
  const completedCount = items.length - uncheckedCount;
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const celebrationScale = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationOpacity.value,
  }));

  useEffect(() => {
    if (progressPercentage === 100 && items.length > 0) {
      setShowCelebration(true);
      setEncouragementMessage(completionMessages[Math.floor(Math.random() * completionMessages.length)]);
      
      celebrationScale.value = withSequence(
        withSpring(1.2, { duration: 500 }),
        withSpring(1, { duration: 300 })
      );
      celebrationOpacity.value = withSpring(1, { duration: 300 });
      
      setTimeout(() => {
        celebrationOpacity.value = withSpring(0, { duration: 300 });
        setTimeout(() => setShowCelebration(false), 300);
      }, 3000);
    } else if (progressPercentage > 0 && progressPercentage < 100) {
      setEncouragementMessage(encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]);
    }
  }, [progressPercentage, items.length]);

  const handleAddItem = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleCategoryLongPress = (category: string, items: ReminderItemType[]) => {
    Alert.alert(
      "Category Options",
      `What would you like to do with the "${category}" category?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Add New Item", 
          onPress: () => {
            setEditingItem(null);
            setModalVisible(true);
          }
        },
        { 
          text: "Delete All Items", 
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Delete All Items",
              `Are you sure you want to delete all ${items.length} items in "${category}"?`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Delete All", 
                  style: "destructive", 
                  onPress: () => {
                    items.forEach(item => deleteItem(item.id));
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleItemLongPress = (item: ReminderItemType) => {
    Alert.alert(
      "Item Options",
      `What would you like to do with "${item.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Edit", 
          onPress: () => {
            setEditingItem(item);
            setModalVisible(true);
          }
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Delete Item",
              `Are you sure you want to delete "${item.title}"?`,
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteItem(item.id) }
              ]
            );
          }
        }
      ]
    );
  };



  const handleSaveItem = (title: string, category: string) => {
    if (editingItem) {
      updateItem(editingItem.id, title, category);
    } else {
      addItem(title, category);
    }
  };

  const handleResetAll = () => {
    Alert.alert(
      "Reset All Items",
      "This will uncheck all items. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetAllItems }
      ]
    );
  };

  if (!currentList) {
    return (
      <View className="flex-1 items-center justify-center bg-red-50">
        <Text className="text-xl text-red-600">No list selected</Text>
      </View>
    );
  }

  // Group items by category
  const groupedItems = items.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, ReminderItemType[]>);

  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(200)}
        className="bg-white/90 backdrop-blur-sm shadow-sm"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-6 py-6">
          <View className="flex-row items-center mb-4">
            <Pressable onPress={onBack} className="mr-4 p-2 rounded-full bg-gray-100">
              <Text className="text-2xl">←</Text>
            </Pressable>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-3xl mr-2">{currentList.emoji}</Text>
                <Text className="text-3xl font-black text-gray-900">
                  {currentList.name}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xl font-bold text-gray-700">
                {uncheckedCount > 0 
                  ? `${uncheckedCount} items left to check`
                  : "All set! Ready to go! 🎉"
                }
              </Text>
              <Text className="text-lg text-gray-600 mt-1">
                {completedCount}/{items.length} completed
              </Text>
            </View>
            {items.length > 0 && (
              <Pressable
                onPress={handleResetAll}
                className="bg-orange-100 px-4 py-3 rounded-2xl border-2 border-orange-200"
              >
                <Text className="text-orange-700 font-bold">🔄 Reset</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Encouragement Banner */}
      {encouragementMessage && progressPercentage > 0 && (
        <Animated.View 
          entering={FadeInUp.delay(300)}
          className="mx-6 mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-lg"
        >
          <Text className="text-white font-black text-lg text-center">
            {encouragementMessage}
          </Text>
        </Animated.View>
      )}

      {/* Progress Bar */}
      <Animated.View 
        entering={FadeInUp.delay(400)}
        className="px-6 py-4"
      >
        <View className="bg-white/70 p-4 rounded-2xl shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-gray-700">Progress</Text>
            <Text className="font-bold text-blue-600">{Math.round(progressPercentage)}%</Text>
          </View>
          <View className="bg-gray-200 h-4 rounded-full overflow-hidden">
            <View 
              className={cn(
                "h-full rounded-full",
                progressPercentage === 100 ? "bg-green-500" : "bg-blue-500"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>
      </Animated.View>

      {/* Items List */}
      <ScrollView className="flex-1 px-6">
        {Object.entries(groupedItems).map(([category, categoryItems], categoryIndex) => (
          <Animated.View 
            key={category}
            entering={FadeInUp.delay(500 + categoryIndex * 100)}
            className="mb-6"
          >
            <CategoryHeader
              category={category}
              items={categoryItems}
              onLongPress={handleCategoryLongPress}
            />
            {categoryItems.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(600 + categoryIndex * 100 + index * 50)}
              >
                <ReminderItem
                  item={item}
                  onToggle={toggleItem}
                  onLongPress={handleItemLongPress}
                />
              </Animated.View>
            ))}
          </Animated.View>
        ))}

        {items.length === 0 && (
          <Animated.View 
            entering={FadeInUp.delay(500)}
            className="items-center justify-center py-20 bg-white/70 rounded-3xl mt-8"
          >
            <Text className="text-8xl mb-4">📝</Text>
            <Text className="text-2xl font-bold text-gray-700 text-center mb-2">
              This list is empty!
            </Text>
            <Text className="text-lg text-gray-500 text-center mb-6">
              Add some items to get started
            </Text>
            <Pressable
              onPress={handleAddItem}
              className="bg-blue-500 px-8 py-4 rounded-2xl"
            >
              <Text className="text-white font-bold text-lg">Add First Item ✨</Text>
            </Pressable>
          </Animated.View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Add Button */}
      {items.length > 0 && (
        <Animated.View 
          entering={FadeInUp.delay(700)}
          className="absolute bottom-8 right-6"
          style={{ paddingBottom: insets.bottom }}
        >
          <Pressable
            onPress={handleAddItem}
            className="bg-blue-500 rounded-full items-center justify-center shadow-2xl border-4 border-white"
            style={{ width: 64, height: 64 }}
          >
            <Text className="text-white text-3xl font-light leading-none">+</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <Animated.View 
          style={[celebrationStyle, { 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)'
          }]}
        >
          <View className="bg-white rounded-3xl p-8 mx-8 items-center shadow-2xl">
            <Text className="text-6xl mb-4">🎉</Text>
            <Text className="text-2xl font-black text-center text-gray-900 mb-2">
              {encouragementMessage}
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              You completed everything on your list!
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Add/Edit Modal */}
      <AddEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveItem}
        editItem={editingItem}
      />
    </View>
  );
};