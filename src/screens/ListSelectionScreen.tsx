import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReminderStore, ReminderList } from '../state/reminderStore';
import { RenameListModal } from '../components/RenameListModal';
import Animated, { FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { cn } from '../utils/cn';

interface ListSelectionScreenProps {
  onSelectList: (listId: string) => void;
}



const colors = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 
  'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
];

const emojis = ['🏠', '✈️', '💪', '🎒', '🍳', '🛒', '💼', '🎉', '📚', '🚗'];

export const ListSelectionScreen: React.FC<ListSelectionScreenProps> = ({ onSelectList }) => {
  const insets = useSafeAreaInsets();
  const { lists, addList, deleteList, updateList } = useReminderStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏠');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [listToRename, setListToRename] = useState<ReminderList | null>(null);

  const handleSelectList = (listId: string) => {
    onSelectList(listId);
  };

  const handleAddList = () => {
    if (newListName.trim()) {
      addList(newListName.trim(), selectedEmoji, selectedColor);
      setNewListName('');
      setShowAddForm(false);
    }
  };

  const handleListLongPress = (list: ReminderList) => {
    Alert.alert(
      "List Options",
      `What would you like to do with "${list.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Rename", 
          onPress: () => {
            setListToRename(list);
            setShowRenameModal(true);
          }
        },
        ...(lists.length > 1 ? [{ 
          text: "Delete", 
          style: "destructive" as const,
          onPress: () => handleDeleteList(list)
        }] : [])
      ]
    );
  };

  const handleRenameList = (newName: string) => {
    if (listToRename) {
      updateList(listToRename.id, newName, listToRename.emoji, listToRename.color);
      setListToRename(null);
    }
  };

  const handleDeleteList = (list: ReminderList) => {
    // Prevent deleting if it's the last list
    if (lists.length <= 1) {
      Alert.alert(
        "Cannot Delete",
        "You need at least one list! Create another list first before deleting this one.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    Alert.alert(
      `Delete "${list.name}"?`,
      `This will permanently delete the list and all ${list.items.length} items in it. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deleteList(list.id)
        }
      ]
    );
  };

  const ListCard: React.FC<{ list: ReminderList; index: number }> = ({ list, index }) => {
    const scale = useSharedValue(1);
    const progress = list.items.length > 0 
      ? list.items.filter(item => item.isChecked).length / list.items.length 
      : 0;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    const handlePress = () => {
      scale.value = withSequence(
        withSpring(0.9, { duration: 100 }),
        withSpring(1, { duration: 100 })
      );
      setTimeout(() => handleSelectList(list.id), 150);
    };

    return (
      <Animated.View
        entering={FadeInUp.delay(200 + index * 100)}
        className="mb-4"
      >
        <Animated.View style={animatedStyle}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            onLongPress={() => handleListLongPress(list)}
            delayLongPress={400}
          >
            <View className={cn("rounded-3xl p-6 shadow-lg relative", list.color)}>
              {/* Long Press Hint - Top Right */}
              <View className="absolute top-4 right-4 px-2 py-1 bg-black/20 rounded-full">
                <Text className="text-white text-xs font-bold">📱 Hold</Text>
              </View>

              <View className="flex-row items-center justify-between mb-4 pr-16">
                <View className="flex-row items-center flex-1">
                  <Text className="text-4xl mr-3">{list.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-xl">{list.name}</Text>
                    <Text className="text-white/80 text-sm">
                      {list.items.filter(item => item.isChecked).length}/{list.items.length} completed
                    </Text>
                  </View>
                </View>
                {progress === 1 && list.items.length > 0 && (
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white font-bold text-sm">🎉 Done!</Text>
                  </View>
                )}
              </View>
              
              {/* Progress Bar */}
              <View className="bg-white/20 h-3 rounded-full overflow-hidden">
                <View 
                  className="bg-white h-full rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100)}
        className="bg-white/80 backdrop-blur-sm shadow-sm"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-6 py-6">
          <Text className="text-4xl font-black text-gray-900 mb-2">
            Your Lists 📋
          </Text>
          <Text className="text-lg text-gray-600 mb-1">
            Choose a list to get organized! 
          </Text>
          <Text className="text-sm text-gray-500">
            Tap to open • {lists.length > 1 ? 'Long press or ✕ to delete' : '🔒 Last list cannot be deleted'}
          </Text>
        </View>
      </Animated.View>

      {/* Motivational Banner */}
      <Animated.View 
        entering={FadeInUp.delay(300)}
        className="mx-6 mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4"
      >
        <Text className="text-white font-bold text-lg text-center">
          🌟 You've got this! Stay organized! 🌟
        </Text>
      </Animated.View>

      {/* Lists */}
      <ScrollView className="flex-1 px-6 mt-6">
        {lists.map((list, index) => (
          <ListCard key={list.id} list={list} index={index} />
        ))}

        {/* Add New List Button */}
        <Animated.View
          entering={FadeInUp.delay(200 + lists.length * 100)}
          className="mb-4"
        >
          <Pressable
            onPress={() => setShowAddForm(true)}
            className="border-3 border-dashed border-gray-300 rounded-3xl p-8 items-center justify-center bg-white/50"
          >
            <Text className="text-6xl mb-2">➕</Text>
            <Text className="text-gray-600 font-semibold text-lg">Add New List</Text>
            <Text className="text-gray-500 text-sm text-center mt-1">
              Create a custom checklist for any occasion
            </Text>
          </Pressable>
        </Animated.View>

        <View className="h-20" />
      </ScrollView>

      {/* Add List Form Modal */}
      {showAddForm && (
        <Animated.View 
          entering={FadeInUp}
          className="absolute inset-0 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl p-6 min-h-[60%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">Create New List</Text>
              <Pressable onPress={() => setShowAddForm(false)} className="p-2">
                <Text className="text-gray-500 text-2xl">✕</Text>
              </Pressable>
            </View>

            {/* List Name Input */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">List Name</Text>
              <View className="border-2 border-gray-200 rounded-2xl p-4">
                <TextInput
                  value={newListName}
                  onChangeText={setNewListName}
                  placeholder="Enter list name..."
                  className="text-lg"
                  autoFocus
                />
              </View>
            </View>

            {/* Emoji Selection */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Choose Emoji</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {emojis.map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => setSelectedEmoji(emoji)}
                      className={cn(
                        "w-12 h-12 rounded-full items-center justify-center mr-3 border-2",
                        selectedEmoji === emoji ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      )}
                    >
                      <Text className="text-2xl">{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Color Selection */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Choose Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {colors.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      className={cn(
                        "w-10 h-10 rounded-full mr-3 border-4",
                        color,
                        selectedColor === color ? "border-gray-800" : "border-gray-200"
                      )}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            <Pressable
              onPress={handleAddList}
              disabled={!newListName.trim()}
              className={cn(
                "py-4 rounded-2xl items-center",
                newListName.trim() ? "bg-blue-500" : "bg-gray-300"
              )}
            >
              <Text
                className={cn(
                  "text-lg font-bold",
                  newListName.trim() ? "text-white" : "text-gray-500"
                )}
              >
                Create List 🎉
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Rename Modal */}
      <RenameListModal
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSave={handleRenameList}
        list={listToRename}
      />
    </View>
  );
};