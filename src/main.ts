import './style.css';
import type { Task, AppSettings, FilterType, SortType, Priority, CategoryType } from './types';
import { loadTasks, saveTasks, loadSettings, saveSettings } from './store';
import { startAlarm, stopAlarm, playTestSound, setAlarmVolume, setAlarmPattern } from './alarm';

// Application State
let tasks: Task[] = [];
let settings: AppSettings;
let currentFilter: FilterType = 'all';
let currentSort: SortType = 'dueDate';
let searchQuery = '';
let activeAlarmTaskId: string | null = null;


// DOM Elements
const taskListEl = document.getElementById('taskList') as HTMLDivElement;
const emptyStateEl = document.getElementById('emptyState') as HTMLDivElement;
const btnAddTask = document.getElementById('btnAddTask') as HTMLButtonElement;
const btnEmptyStateCreate = document.getElementById('btnEmptyStateCreate') as HTMLButtonElement;
const btnSettings = document.getElementById('btnSettings') as HTMLButtonElement;

// Task Modal Elements
const modalTask = document.getElementById('modalTask') as HTMLDivElement;
const taskForm = document.getElementById('taskForm') as HTMLFormElement;
const modalTitle = document.getElementById('modalTitle') as HTMLHeadingElement;
const editTaskId = document.getElementById('editTaskId') as HTMLInputElement;
const taskTitleInput = document.getElementById('taskTitleInput') as HTMLInputElement;
const taskDescInput = document.getElementById('taskDescInput') as HTMLTextAreaElement;
const taskPriorityInput = document.getElementById('taskPriorityInput') as HTMLSelectElement;
const taskCategoryInput = document.getElementById('taskCategoryInput') as HTMLSelectElement;
const taskDueInput = document.getElementById('taskDueInput') as HTMLInputElement;
const taskAlarmInput = document.getElementById('taskAlarmInput') as HTMLInputElement;
const btnCancelTaskModal = document.getElementById('btnCancelTaskModal') as HTMLButtonElement;
const btnCloseTaskModal = document.getElementById('btnCloseTaskModal') as HTMLButtonElement;

// Settings Modal Elements
const modalSettings = document.getElementById('modalSettings') as HTMLDivElement;
const btnCloseSettingsModal = document.getElementById('btnCloseSettingsModal') as HTMLButtonElement;
const btnSaveSettings = document.getElementById('btnSaveSettings') as HTMLButtonElement;
const settingsVolume = document.getElementById('settingsVolume') as HTMLInputElement;
const volumeValue = document.getElementById('volumeValue') as HTMLSpanElement;
const settingsSoundPattern = document.getElementById('settingsSoundPattern') as HTMLSelectElement;
const btnTestVolume = document.getElementById('btnTestVolume') as HTMLButtonElement;

// Active Alarm Banner Elements
const activeAlarmBanner = document.getElementById('activeAlarmBanner') as HTMLDivElement;
const activeAlarmTaskTitle = document.getElementById('activeAlarmTaskTitle') as HTMLDivElement;
const btnAlarmSnooze = document.getElementById('btnAlarmSnooze') as HTMLButtonElement;
const btnAlarmDismiss = document.getElementById('btnAlarmDismiss') as HTMLButtonElement;

// Missed Alarm Elements
const missedAlarmsContainer = document.getElementById('missedAlarmsContainer') as HTMLDivElement;
const missedAlarmsList = document.getElementById('missedAlarmsList') as HTMLUListElement;
const btnDismissAllMissed = document.getElementById('btnDismissAllMissed') as HTMLButtonElement;

// Audio Unlock Elements
const audioUnlockPanel = document.getElementById('audioUnlockPanel') as HTMLDivElement;
const btnUnlockAudio = document.getElementById('btnUnlockAudio') as HTMLButtonElement;

// Sidebar Badges
const badgeAll = document.getElementById('badgeAll') as HTMLSpanElement;
const badgeActive = document.getElementById('badgeActive') as HTMLSpanElement;
const badgeCompleted = document.getElementById('badgeCompleted') as HTMLSpanElement;
const badgeHigh = document.getElementById('badgeHigh') as HTMLSpanElement;
const badgeMedium = document.getElementById('badgeMedium') as HTMLSpanElement;
const badgeLow = document.getElementById('badgeLow') as HTMLSpanElement;

// Dashboard Stats
const completionRatio = document.getElementById('completionRatio') as HTMLSpanElement;
const statsCount = document.getElementById('statsCount') as HTMLDivElement;
const progressRingBar = document.querySelector('.progress-ring-bar') as SVGCircleElement;

// Helper: Escape HTML
function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

// Helper: Format Date for Inputs (YYYY-MM-DDTHH:MM)
function formatDatetimeLocal(timestamp: number): string {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Helper: Format Due Date for Card Display
function formatDueDate(timestamp: number): { text: string; overdue: boolean } {
  if (!timestamp) return { text: 'No due date', overdue: false };
  
  const now = new Date();
  const due = new Date(timestamp);
  const overdue = timestamp < now.getTime();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  
  const diffTime = dueDay.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const timeStr = due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let dayStr = '';
  if (diffDays === 0) {
    dayStr = 'Today';
  } else if (diffDays === 1) {
    dayStr = 'Tomorrow';
  } else if (diffDays === -1) {
    dayStr = 'Yesterday';
  } else {
    dayStr = due.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  return {
    text: `${dayStr} at ${timeStr}`,
    overdue
  };
}

// Initialise Application Settings
function initSettings() {
  settings = loadSettings();
  
  // Apply theme
  document.documentElement.setAttribute('data-theme', settings.theme);
  
  // Update Settings UI inputs
  settingsVolume.value = settings.alarmVolume.toString();
  volumeValue.innerText = `${Math.round(settings.alarmVolume * 100)}%`;
  settingsSoundPattern.value = settings.alarmSoundPattern;
  
  // Apply properties to audio engine
  setAlarmVolume(settings.alarmVolume);
  setAlarmPattern(settings.alarmSoundPattern);

  // Sync theme active buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    const theme = btn.getAttribute('data-theme');
    if (theme === settings.theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Render Stats & Badges
function renderStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  
  const high = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const medium = tasks.filter(t => !t.completed && t.priority === 'medium').length;
  const low = tasks.filter(t => !t.completed && t.priority === 'low').length;

  // Update badges
  badgeAll.innerText = total.toString();
  badgeActive.innerText = active.toString();
  badgeCompleted.innerText = completed.toString();
  badgeHigh.innerText = high.toString();
  badgeMedium.innerText = medium.toString();
  badgeLow.innerText = low.toString();

  // Progress Bar / Ring Calculation
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  completionRatio.innerText = `${percent}%`;
  statsCount.innerText = `${completed} / ${total} Tasks`;

  // Circumference = 2 * PI * r = 2 * 3.14159 * 22 = 138
  const strokeOffset = 138 - (percent / 100) * 138;
  progressRingBar.style.strokeDashoffset = strokeOffset.toString();
}

// Sorting logic helpers
const priorityWeights = {
  high: 3,
  medium: 2,
  low: 1
};

// Render Task List Grid
function renderTasks() {
  renderStats();

  // Filter Tasks
  let filtered = tasks;
  
  if (currentFilter === 'active') {
    filtered = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filtered = tasks.filter(t => t.completed);
  } else if (currentFilter === 'high' || currentFilter === 'medium' || currentFilter === 'low') {
    filtered = tasks.filter(t => !t.completed && t.priority === currentFilter);
  }

  // Search Filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q)
    );
  }

  // Sort Tasks
  filtered.sort((a, b) => {
    if (currentSort === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate - b.dueDate;
    } else if (currentSort === 'priority') {
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    } else if (currentSort === 'createdAt') {
      return b.createdAt - a.createdAt;
    } else if (currentSort === 'completed') {
      return (a.completed ? 1 : 0) - (b.completed ? 0 : 1);
    }
    return 0;
  });

  // Toggle empty state visibility
  if (filtered.length === 0) {
    emptyStateEl.classList.remove('hidden');
    taskListEl.classList.add('hidden');
    taskListEl.innerHTML = '';
    return;
  }

  emptyStateEl.classList.add('hidden');
  taskListEl.classList.remove('hidden');
  taskListEl.innerHTML = '';

  filtered.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.setAttribute('data-id', task.id);

    const { text: dueText, overdue } = formatDueDate(task.dueDate);
    const isOverdue = overdue && !task.completed;

    let priorityBadge = '';
    if (task.priority === 'high') priorityBadge = '<span class="priority-tag high">High</span>';
    else if (task.priority === 'medium') priorityBadge = '<span class="priority-tag medium">Medium</span>';
    else priorityBadge = '<span class="priority-tag low">Low</span>';

    const category = task.category || 'other';
    let categoryBadge = '';
    if (category === 'personal') categoryBadge = '<span class="category-tag personal">Personal</span>';
    else if (category === 'work') categoryBadge = '<span class="category-tag work">Work</span>';
    else if (category === 'studies') categoryBadge = '<span class="category-tag studies">Studies</span>';
    else categoryBadge = '<span class="category-tag other">Other</span>';

    const alarmIcon = task.alarmEnabled && !task.completed
      ? `<span class="alarm-tag" title="Alarm Enabled">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
         </span>`
      : '';

    const dateBadge = task.dueDate
      ? `<span class="date-tag ${isOverdue ? 'overdue' : ''}">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${dueText}</span>
         </span>`
      : '';

    card.innerHTML = `
      <div class="card-top">
        <label class="checkbox-container">
          <input type="checkbox" class="task-toggle" ${task.completed ? 'checked' : ''}>
          <span class="checkmark"></span>
          <span class="task-title-text">${escapeHTML(task.title)}</span>
        </label>
        <div class="card-actions">
          <button class="btn-card edit-action" title="Edit Task">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-card delete-action" title="Delete Task">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
      ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
      <div class="card-details">
        ${priorityBadge}
        ${categoryBadge}
        ${dateBadge}
        ${alarmIcon}
      </div>
    `;

    // Add Events for Task Elements
    const checkbox = card.querySelector('.task-toggle') as HTMLInputElement;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    const btnEdit = card.querySelector('.edit-action') as HTMLButtonElement;
    btnEdit.addEventListener('click', () => openEditTaskModal(task.id));

    const btnDelete = card.querySelector('.delete-action') as HTMLButtonElement;
    btnDelete.addEventListener('click', () => deleteTask(task.id));

    taskListEl.appendChild(card);
  });
}

// Task Handlers
function toggleTaskCompletion(id: string) {
  tasks = tasks.map(t => {
    if (t.id === id) {
      const completed = !t.completed;
      // If we complete the task and it is currently alarm-triggering, dismiss the alarm
      if (completed && activeAlarmTaskId === id) {
        dismissActiveAlarm();
      }
      return { ...t, completed };
    }
    return t;
  });
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id: string) {
  if (activeAlarmTaskId === id) {
    dismissActiveAlarm();
  }
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

// Create/Edit Modals Setup
function openCreateTaskModal() {
  modalTitle.innerText = 'Create New Task';
  editTaskId.value = '';
  taskTitleInput.value = '';
  taskDescInput.value = '';
  taskPriorityInput.value = 'medium';
  taskCategoryInput.value = 'other';
  
  // Set default due time to tomorrow same time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setMinutes(0);
  taskDueInput.value = formatDatetimeLocal(tomorrow.getTime());
  
  taskAlarmInput.checked = true;
  modalTask.classList.remove('hidden');
  taskTitleInput.focus();
}

function openEditTaskModal(id: string) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  modalTitle.innerText = 'Edit Task Details';
  editTaskId.value = task.id;
  taskTitleInput.value = task.title;
  taskDescInput.value = task.description;
  taskPriorityInput.value = task.priority;
  taskCategoryInput.value = task.category || 'other';
  taskDueInput.value = formatDatetimeLocal(task.dueDate);
  taskAlarmInput.checked = task.alarmEnabled;

  modalTask.classList.remove('hidden');
  taskTitleInput.focus();
}

function closeTaskModal() {
  modalTask.classList.add('hidden');
}

// Task Form Submit
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = editTaskId.value;
  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
  const priority = taskPriorityInput.value as Priority;
  const category = taskCategoryInput.value as CategoryType;
  const dueDate = taskDueInput.value ? new Date(taskDueInput.value).getTime() : 0;
  const alarmEnabled = taskAlarmInput.checked;

  if (!title) return;

  if (id) {
    // Edit
    tasks = tasks.map(t => {
      if (t.id === id) {
        // Reset alarmTriggered if due date changes
        const dueDateChanged = t.dueDate !== dueDate;
        return {
          ...t,
          title,
          description,
          priority,
          category,
          dueDate,
          alarmEnabled,
          alarmTriggered: dueDateChanged ? false : t.alarmTriggered
        };
      }
      return t;
    });
  } else {
    // Create
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      priority,
      category,
      dueDate,
      alarmEnabled,
      alarmTriggered: false,
      completed: false,
      createdAt: Date.now()
    };
    tasks.push(newTask);
  }

  saveTasks(tasks);
  renderTasks();
  closeTaskModal();
});

// Settings Handlers
function openSettingsModal() {
  modalSettings.classList.remove('hidden');
}

function closeSettingsModal() {
  modalSettings.classList.add('hidden');
}

// Volume slider action
settingsVolume.addEventListener('input', () => {
  const vol = parseFloat(settingsVolume.value);
  volumeValue.innerText = `${Math.round(vol * 100)}%`;
  settings.alarmVolume = vol;
  setAlarmVolume(vol);
});

// Sound tone pattern change
settingsSoundPattern.addEventListener('change', () => {
  const pattern = settingsSoundPattern.value as AppSettings['alarmSoundPattern'];
  settings.alarmSoundPattern = pattern;
  setAlarmPattern(pattern);
});

// Test volume tone trigger
btnTestVolume.addEventListener('click', () => {
  unlockAudioEngine();
  playTestSound();
});

// Theme selection toggles
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedTheme = btn.getAttribute('data-theme') as 'light' | 'dark';
    settings.theme = selectedTheme;
    document.documentElement.setAttribute('data-theme', selectedTheme);
    
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

btnSaveSettings.addEventListener('click', () => {
  saveSettings(settings);
  closeSettingsModal();
});

// Audio Unlock Action (For compliance with browser policies)
function checkAudioUnlockState() {
  // Browsers require interaction before playing audio
  const unlocked = localStorage.getItem('audio_unlocked') === 'true';
  if (!unlocked) {
    audioUnlockPanel.classList.remove('hidden');
  }
}

function unlockAudioEngine() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    localStorage.setItem('audio_unlocked', 'true');
    audioUnlockPanel.classList.add('hidden');
  } catch (e) {
    console.error('Failed to unlock Audio Context:', e);
  }
}

// Alarm Triggering checks
function checkAlarms() {
  const now = Date.now();
  
  // Find tasks that should trigger alarm
  const alarmTask = tasks.find(t => 
    !t.completed && 
    t.alarmEnabled && 
    !t.alarmTriggered && 
    t.dueDate > 0 && 
    t.dueDate <= now
  );

  if (alarmTask && !activeAlarmTaskId) {
    activeAlarmTaskId = alarmTask.id;
    alarmTask.alarmTriggered = true;
    saveTasks(tasks);
    renderTasks();
    
    // Display Alarm banner
    activeAlarmTaskTitle.innerText = alarmTask.title;
    activeAlarmBanner.classList.remove('hidden');

    // Trigger audible tone sequence
    startAlarm(() => {
      console.log(`Audible Alarm ringing for: ${alarmTask.title}`);
    });
  }
}

function snoozeActiveAlarm() {
  if (!activeAlarmTaskId) return;

  const id = activeAlarmTaskId;
  stopAlarm();
  activeAlarmBanner.classList.add('hidden');
  activeAlarmTaskId = null;

  // Snooze adds 5 minutes
  tasks = tasks.map(t => {
    if (t.id === id) {
      return {
        ...t,
        dueDate: Date.now() + 5 * 60 * 1000,
        alarmTriggered: false
      };
    }
    return t;
  });
  saveTasks(tasks);
  renderTasks();
}

function dismissActiveAlarm() {
  if (!activeAlarmTaskId) return;

  stopAlarm();
  activeAlarmBanner.classList.add('hidden');
  activeAlarmTaskId = null;
}

// Missed alarms calculation (Off-line/Closed tab recovery)
function checkMissedAlarms() {
  const now = Date.now();
  const missed = tasks.filter(t => 
    !t.completed && 
    t.alarmEnabled && 
    !t.alarmTriggered && 
    t.dueDate > 0 && 
    t.dueDate < now - 10000 // due in the past (more than 10 seconds ago)
  );

  if (missed.length > 0) {
    missedAlarmsList.innerHTML = '';
    
    missed.forEach(t => {
      // Mark it as triggered so it doesn't alarm again
      t.alarmTriggered = true;
      
      const li = document.createElement('li');
      const timeStr = new Date(t.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      li.innerHTML = `
        <span><strong>${escapeHTML(t.title)}</strong></span>
        <span class="time">Due: ${timeStr}</span>
      `;
      missedAlarmsList.appendChild(li);
    });

    saveTasks(tasks);
    missedAlarmsContainer.classList.remove('hidden');
    renderTasks();
  }
}

// Dismiss all missed alarms banner
btnDismissAllMissed.addEventListener('click', () => {
  missedAlarmsContainer.classList.add('hidden');
});

// Event Binding - Layout Actions
btnAddTask.addEventListener('click', openCreateTaskModal);
btnEmptyStateCreate.addEventListener('click', openCreateTaskModal);
btnSettings.addEventListener('click', openSettingsModal);
btnCloseTaskModal.addEventListener('click', closeTaskModal);
btnCancelTaskModal.addEventListener('click', closeTaskModal);
btnCloseSettingsModal.addEventListener('click', closeSettingsModal);
btnUnlockAudio.addEventListener('click', unlockAudioEngine);

btnAlarmSnooze.addEventListener('click', snoozeActiveAlarm);
btnAlarmDismiss.addEventListener('click', dismissActiveAlarm);

// Sidebar Filter navigation clicks
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentFilter = btn.getAttribute('data-filter') as FilterType;
    renderTasks();
  });
});

// Search bar input
const taskSearchInput = document.getElementById('taskSearch') as HTMLInputElement;
taskSearchInput.addEventListener('input', () => {
  searchQuery = taskSearchInput.value;
  renderTasks();
});

// Sort select list change
const taskSortSelect = document.getElementById('taskSort') as HTMLSelectElement;
taskSortSelect.addEventListener('change', () => {
  currentSort = taskSortSelect.value as SortType;
  renderTasks();
});

// Start checking alarms in background
window.setInterval(checkAlarms, 1000);

// App Entry Point
function main() {
  // 1. Initialise Settings
  initSettings();
  
  // 2. Load existing tasks
  tasks = loadTasks();
  
  // 3. Check for missed alarms
  checkMissedAlarms();
  
  // 4. Initial Task Render
  renderTasks();
  
  // 5. Check Audio context eligibility
  checkAudioUnlockState();
}

window.addEventListener('DOMContentLoaded', main);
