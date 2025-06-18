import React, { useState } from 'react';
import { ListSelectionScreen } from '../screens/ListSelectionScreen';
import { ReminderListScreen } from '../screens/ReminderListScreen';
import { useReminderStore } from '../state/reminderStore';

export const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'lists' | 'reminder'>('lists');
  const { setCurrentList } = useReminderStore();

  const handleSelectList = (listId: string) => {
    setCurrentList(listId);
    setCurrentScreen('reminder');
  };

  const handleBackToLists = () => {
    setCurrentScreen('lists');
  };

  if (currentScreen === 'lists') {
    return <ListSelectionScreen onSelectList={handleSelectList} />;
  }

  return <ReminderListScreen onBack={handleBackToLists} />;
};