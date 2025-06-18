import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReminderItem {
  id: string;
  title: string;
  isChecked: boolean;
  category: string;
  createdAt: Date;
}

export interface ReminderList {
  id: string;
  name: string;
  emoji: string;
  color: string;
  items: ReminderItem[];
  createdAt: Date;
}

interface ReminderStore {
  lists: ReminderList[];
  currentListId: string | null;
  addList: (name: string, emoji: string, color: string) => void;
  deleteList: (listId: string) => void;
  updateList: (listId: string, name: string, emoji: string, color: string) => void;
  setCurrentList: (listId: string) => void;
  getCurrentList: () => ReminderList | null;
  addItem: (title: string, category: string) => void;
  toggleItem: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
  updateItem: (itemId: string, title: string, category: string) => void;
  resetAllItems: () => void;
  getUncheckedCount: () => number;
  getTotalProgress: () => { completed: number; total: number };
}

const defaultLists: ReminderList[] = [
  {
    id: 'leaving-home',
    name: 'Leaving Home',
    emoji: '🏠',
    color: 'bg-blue-500',
    createdAt: new Date(),
    items: [
      {
        id: '1',
        title: 'Keys',
        isChecked: false,
        category: 'Essential',
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Wallet',
        isChecked: false,
        category: 'Essential',
        createdAt: new Date(),
      },
      {
        id: '3',
        title: 'Phone',
        isChecked: false,
        category: 'Essential',
        createdAt: new Date(),
      },
      {
        id: '4',
        title: 'Sunglasses',
        isChecked: false,
        category: 'Personal',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: 'travel-prep',
    name: 'Travel Prep',
    emoji: '✈️',
    color: 'bg-purple-500',
    createdAt: new Date(),
    items: [
      {
        id: 'travel-1',
        title: 'Passport',
        isChecked: false,
        category: 'Documents',
        createdAt: new Date(),
      },
      {
        id: 'travel-2',
        title: 'Tickets',
        isChecked: false,
        category: 'Documents',
        createdAt: new Date(),
      },
      {
        id: 'travel-3',
        title: 'Chargers',
        isChecked: false,
        category: 'Electronics',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: 'gym-session',
    name: 'Gym Session',
    emoji: '💪',
    color: 'bg-green-500',
    createdAt: new Date(),
    items: [
      {
        id: 'gym-1',
        title: 'Water Bottle',
        isChecked: false,
        category: 'Essentials',
        createdAt: new Date(),
      },
      {
        id: 'gym-2',
        title: 'Towel',
        isChecked: false,
        category: 'Essentials',
        createdAt: new Date(),
      },
      {
        id: 'gym-3',
        title: 'Headphones',
        isChecked: false,
        category: 'Personal',
        createdAt: new Date(),
      },
    ],
  },
];

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      lists: defaultLists,
      currentListId: 'leaving-home',
      
      addList: (name: string, emoji: string, color: string) =>
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id: Date.now().toString(),
              name,
              emoji,
              color,
              items: [],
              createdAt: new Date(),
            },
          ],
        })),
      
      deleteList: (listId: string) =>
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== listId),
          currentListId: state.currentListId === listId 
            ? (state.lists.find(l => l.id !== listId)?.id || null)
            : state.currentListId,
        })),
      
      updateList: (listId: string, name: string, emoji: string, color: string) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId ? { ...list, name, emoji, color } : list
          ),
        })),
      
      setCurrentList: (listId: string) =>
        set(() => ({ currentListId: listId })),
      
      getCurrentList: () => {
        const state = get();
        return state.lists.find((list) => list.id === state.currentListId) || null;
      },
      
      addItem: (title: string, category: string) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.currentListId
              ? {
                  ...list,
                  items: [
                    ...list.items,
                    {
                      id: Date.now().toString(),
                      title,
                      isChecked: false,
                      category,
                      createdAt: new Date(),
                    },
                  ],
                }
              : list
          ),
        })),
      
      toggleItem: (itemId: string) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.currentListId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
                  ),
                }
              : list
          ),
        })),
      
      deleteItem: (itemId: string) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.currentListId
              ? {
                  ...list,
                  items: list.items.filter((item) => item.id !== itemId),
                }
              : list
          ),
        })),
      
      updateItem: (itemId: string, title: string, category: string) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.currentListId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.id === itemId ? { ...item, title, category } : item
                  ),
                }
              : list
          ),
        })),
      
      resetAllItems: () =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === state.currentListId
              ? {
                  ...list,
                  items: list.items.map((item) => ({ ...item, isChecked: false })),
                }
              : list
          ),
        })),
      
      getUncheckedCount: () => {
        const currentList = get().getCurrentList();
        return currentList ? currentList.items.filter((item) => !item.isChecked).length : 0;
      },
      
      getTotalProgress: () => {
        const currentList = get().getCurrentList();
        if (!currentList) return { completed: 0, total: 0 };
        const total = currentList.items.length;
        const completed = currentList.items.filter((item) => item.isChecked).length;
        return { completed, total };
      },
    }),
    {
      name: 'reminder-lists-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);