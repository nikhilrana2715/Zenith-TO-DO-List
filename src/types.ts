export type Priority = 'high' | 'medium' | 'low';
export type CategoryType = 'personal' | 'work' | 'studies' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: number; // timestamp
  dueDate: number; // timestamp
  priority: Priority;
  category: CategoryType;
  completed: boolean;
  alarmEnabled: boolean;
  alarmTriggered: boolean;
}

export type Theme = 'dark' | 'light';

export interface AppSettings {
  alarmVolume: number; // 0.0 to 1.0
  alarmSoundPattern: 'chime' | 'digital' | 'pulse';
  theme: Theme;
}

export type FilterType = 'all' | 'active' | 'completed' | 'high' | 'medium' | 'low';
export type SortType = 'dueDate' | 'priority' | 'createdAt' | 'completed';
