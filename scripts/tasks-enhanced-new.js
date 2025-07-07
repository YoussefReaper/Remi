/**
 * tasks-enhanced.js
 * Enhanced task management system for Remi - relationship-focused AI companion
 * Features: Creative UI, relationship tracking, dynamic insights, comprehensive task management
 */

// Enhanced user profile data (will be editable in settings)
const userProfile = {
  name: "Alex Johnson",
  avatar: "pfp/Remi-pfp.png",
  level: 5,
  xp: 1247,
  nextLevelXp: 1500,
  streak: 7,
  completedTasks: 42,
  relationshipLevel: 67,
  relationshipName: "Friend",
  badges: ["achievement1.png", "achievement2.png", "achievement3.png"]
};

// Remi's personality and messages based on relationship level
const remiPersonality = {
  moods: ["😊", "🤗", "😄", "🥰", "✨", "🌟", "💫", "🎉"],
  messages: {
    friend: [
      "Hey Alex! Ready to tackle some goals together? I'm here to cheer you on! 🌟",
      "You're doing amazing! Let's crush these tasks together! 💪",
      "I love seeing your progress! What should we work on today? 😊",
      "Your dedication inspires me! Let's make today awesome! ✨"
    ],
    encouragement: [
      "You're doing fantastic! Your consistency this week shows real dedication. I'm so proud of how you're growing! 🌟",
      "I believe in you completely! Every task you complete makes our bond stronger! 💖",
      "You're such an inspiration! Watching you grow and achieve your goals fills my heart with joy! 🥰",
      "Together we're unstoppable! I'm here cheering you on every step of the way! 🎉"
    ]
  }
};

// Sample tasks data
let tasks = [
  {
    id: 1,
    name: "Complete React.js Tutorial",
    description: "Finish the advanced React concepts and build a small project",
    date: "2025-06-29",
    time: "14:00",
    duration: 120,
    priority: "high",
    effort: 4,
    tags: ["programming", "react", "tutorial"],
    location: "Home Office",
    completed: false,
    completedAt: null,
    subtasks: [
      { id: 1, text: "Watch tutorial videos", completed: true },
      { id: 2, text: "Code along with examples", completed: false },
      { id: 3, text: "Build practice project", completed: false }
    ]
  },
  {
    id: 2,
    name: "Study for Math Exam",
    description: "Review calculus chapters 5-7 and practice problems",
    date: "2025-06-28",
    time: "16:30",
    duration: 90,
    priority: "urgent",
    effort: 3,
    tags: ["math", "calculus", "exam"],
    location: "Library",
    completed: true,
    completedAt: "2025-06-28T16:00:00",
    subtasks: []
  },
  {
    id: 3,
    name: "Write Blog Post",
    description: "Write about my learning journey with AI assistants",
    date: "2025-06-30",
    time: "10:00",
    duration: 60,
    priority: "medium",
    effort: 2,
    tags: ["writing", "blog", "ai"],
    location: "Café",
    completed: false,
    completedAt: null,
    subtasks: []
  }
];

// Current filter and sort settings
let currentFilter = 'all';
let currentSort = 'date';

// DOM elements
let taskForm, tasksContainer, emptyState, advancedOptions, subtasksList;

// Initialize the enhanced tasks page
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  setupEventListeners();
  updateRemiPersonality();
  renderTasks();
  setupProductivityChart();
  updateInsights();
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('task-date');
  if (dateInput) dateInput.value = today;
});

function initializeElements() {
  taskForm = document.getElementById('enhanced-task-form');
  tasksContainer = document.getElementById('tasks-container');
  emptyState = document.getElementById('empty-state');
  advancedOptions = document.getElementById('advanced-options');
  subtasksList = document.getElementById('subtasks-list');
}

function setupEventListeners() {
  // Task form submission
  if (taskForm) {
    taskForm.addEventListener('submit', handleTaskSubmission);
  }
  
  // Advanced options toggle
  const toggleAdvanced = document.getElementById('toggle-advanced');
  if (toggleAdvanced) {
    toggleAdvanced.addEventListener('click', toggleAdvancedOptions);
  }
  
  // Effort buttons
  document.querySelectorAll('.effort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.effort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      currentFilter = e.target.dataset.filter;
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      renderTasks();
    });
  });
  
  // Sort dropdown
  const sortTasks = document.getElementById('sort-tasks');
  if (sortTasks) {
    sortTasks.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderTasks();
    });
  }
  
  // Add subtask button
  const addSubtaskBtn = document.querySelector('.add-subtask-btn');
  if (addSubtaskBtn) {
    addSubtaskBtn.addEventListener('click', addSubtask);
  }
  
  // Save draft button
  const saveDraftBtn = document.getElementById('save-draft');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', saveDraft);
  }
}

function updateRemiPersonality() {
  // Update Remi's mood and message
  const moodEmoji = document.querySelector('[data-remi-mood]');
  const moodText = document.querySelector('[data-remi-mood-text]');
  const remiMessage = document.querySelector('[data-remi-message]');
  const encouragement = document.querySelector('[data-remi-encouragement]');
  
  if (moodEmoji) {
    moodEmoji.textContent = remiPersonality.moods[Math.floor(Math.random() * remiPersonality.moods.length)];
  }
  
  if (moodText) {
    moodText.textContent = "Excited to help!";
  }
  
  if (remiMessage) {
    const messages = remiPersonality.messages.friend;
    remiMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
  }
  
  if (encouragement) {
    const messages = remiPersonality.messages.encouragement;
    encouragement.textContent = messages[Math.floor(Math.random() * messages.length)];
  }
}

function handleTaskSubmission(e) {
  e.preventDefault();
  
  const formData = new FormData(taskForm);
  const activeEffortBtn = document.querySelector('.effort-btn.active');
  const selectedDays = Array.from(document.querySelectorAll('input[name="repeat-days"]:checked')).map(cb => cb.value);
  
  const taskName = document.getElementById('task-name');
  const taskDescription = document.getElementById('task-description');
  const taskDate = document.getElementById('task-date');
  const taskTime = document.getElementById('task-time');
  const taskDuration = document.getElementById('task-duration');
  const taskPriority = document.getElementById('task-priority');
  const taskTags = document.getElementById('task-tags');
  const taskLocation = document.getElementById('task-location');
  
  const newTask = {
    id: Date.now(),
    name: taskName ? taskName.value : '',
    description: taskDescription ? taskDescription.value : '',
    date: taskDate ? taskDate.value : '',
    time: taskTime ? taskTime.value : '',
    duration: taskDuration ? parseInt(taskDuration.value) || 60 : 60,
    priority: taskPriority ? taskPriority.value : 'medium',
    effort: activeEffortBtn ? parseInt(activeEffortBtn.dataset.effort) : 1,
    tags: taskTags ? taskTags.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    location: taskLocation ? taskLocation.value : '',
    completed: false,
    completedAt: null,
    repeatDays: selectedDays,
    subtasks: getSubtasks()
  };
  
  tasks.unshift(newTask);
  taskForm.reset();
  document.querySelectorAll('.effort-btn').forEach(btn => btn.classList.remove('active'));
  clearSubtasks();
  renderTasks();
  updateInsights();
  
  // Show success message
  showNotification('Task created successfully! 🎉', 'success');
  
  // Update relationship XP
  gainXP(10);
}

function getSubtasks() {
  const subtaskInputs = document.querySelectorAll('.subtask-input');
  return Array.from(subtaskInputs).map((input, index) => ({
    id: index + 1,
    text: input.value,
    completed: false
  })).filter(subtask => subtask.text.trim());
}

function addSubtask() {
  if (!subtasksList) return;
  
  const subtaskDiv = document.createElement('div');
  subtaskDiv.className = 'subtask-item';
  subtaskDiv.innerHTML = `
    <input type="text" class="subtask-input" placeholder="Enter subtask...">
    <button type="button" class="remove-subtask-btn" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  subtasksList.appendChild(subtaskDiv);
}

function clearSubtasks() {
  if (subtasksList) {
    subtasksList.innerHTML = '';
  }
}

function toggleAdvancedOptions() {
  if (!advancedOptions) return;
  
  const isShowing = advancedOptions.classList.contains('show');
  const toggleBtn = document.getElementById('toggle-advanced');
  
  if (isShowing) {
    advancedOptions.classList.remove('show');
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Advanced Options';
  } else {
    advancedOptions.classList.add('show');
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Advanced';
  }
}

function renderTasks() {
  if (!tasksContainer) return;
  
  const filteredTasks = filterTasks(tasks);
  const sortedTasks = sortTasks(filteredTasks);
  
  if (sortedTasks.length === 0) {
    tasksContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  tasksContainer.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';
  
  tasksContainer.innerHTML = sortedTasks.map(task => createTaskHTML(task)).join('');
  
  // Add event listeners to task items
  setupTaskEventListeners();
}

function createTaskHTML(task) {
  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
    urgent: '💥'
  };
  
  const effortEmojis = ['😌', '🙂', '😐', '😰', '💀'];
  const effortLabels = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Insane'];
  
  const taskDate = new Date(task.date + 'T' + task.time);
  const now = new Date();
  const isOverdue = taskDate < now && !task.completed;
  const isToday = task.date === new Date().toISOString().split('T')[0];
  
  return `
    <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
      <div class="task-header">
        <div class="task-checkbox">
          <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
          <label for="task-${task.id}">
            <i class="fas fa-check"></i>
          </label>
        </div>
        <div class="task-main-info">
          <h4 class="task-title">${task.name}</h4>
          <p class="task-description">${task.description}</p>
        </div>
        <div class="task-actions">
          <button class="task-action-btn edit-task" title="Edit Task">
            <i class="fas fa-edit"></i>
          </button>
          <button class="task-action-btn delete-task" title="Delete Task">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="task-details">
        <div class="task-meta">
          <span class="task-priority">
            ${priorityIcons[task.priority]} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span class="task-effort">
            ${effortEmojis[task.effort - 1]} ${effortLabels[task.effort - 1]}
          </span>
          <span class="task-duration">
            <i class="fas fa-clock"></i> ${task.duration} min
          </span>
          ${task.location ? `<span class="task-location"><i class="fas fa-map-marker-alt"></i> ${task.location}</span>` : ''}
        </div>
        
        <div class="task-timing">
          <span class="task-date ${isToday ? 'today' : ''} ${isOverdue ? 'overdue' : ''}">
            <i class="fas fa-calendar"></i>
            ${formatTaskDate(task.date, task.time)}
          </span>
        </div>
        
        ${task.tags.length > 0 ? `
          <div class="task-tags">
            ${task.tags.map(tag => `<span class="task-tag">#${tag}</span>`).join('')}
          </div>
        ` : ''}
        
        ${task.subtasks.length > 0 ? `
          <div class="task-subtasks">
            <div class="subtasks-progress">
              <span>Subtasks: ${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length}</span>
              <div class="subtasks-bar">
                <div class="subtasks-fill" style="width: ${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%"></div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function setupTaskEventListeners() {
  // Task completion checkboxes
  document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
      toggleTaskCompletion(taskId);
    });
  });
  
  // Delete buttons
  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
      deleteTask(taskId);
    });
  });
  
  // Edit buttons
  document.querySelectorAll('.edit-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
      editTask(taskId);
    });
  });
}

function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    
    if (task.completed) {
      gainXP(20);
      showNotification('Great job! Task completed! 🎉', 'success');
      updateStreak();
    }
    
    renderTasks();
    updateInsights();
  }
}

function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
    updateInsights();
    showNotification('Task deleted', 'info');
  }
}

function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    // Populate form with task data
    const taskName = document.getElementById('task-name');
    const taskDescription = document.getElementById('task-description');
    const taskDate = document.getElementById('task-date');
    const taskTime = document.getElementById('task-time');
    const taskDuration = document.getElementById('task-duration');
    const taskPriority = document.getElementById('task-priority');
    const taskTags = document.getElementById('task-tags');
    const taskLocation = document.getElementById('task-location');
    
    if (taskName) taskName.value = task.name;
    if (taskDescription) taskDescription.value = task.description;
    if (taskDate) taskDate.value = task.date;
    if (taskTime) taskTime.value = task.time;
    if (taskDuration) taskDuration.value = task.duration;
    if (taskPriority) taskPriority.value = task.priority;
    if (taskTags) taskTags.value = task.tags.join(', ');
    if (taskLocation) taskLocation.value = task.location || '';
    
    // Set effort level
    document.querySelectorAll('.effort-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.effort) === task.effort);
    });
    
    // Remove the task from the array (it will be re-added when form is submitted)
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
    
    // Scroll to form
    const createTaskSection = document.querySelector('.create-task-section');
    if (createTaskSection) {
      createTaskSection.scrollIntoView({ behavior: 'smooth' });
      if (taskName) taskName.focus();
    }
  }
}

function filterTasks(taskList) {
  const today = new Date().toISOString().split('T')[0];
  
  switch (currentFilter) {
    case 'today':
      return taskList.filter(task => task.date === today);
    case 'upcoming':
      return taskList.filter(task => task.date > today && !task.completed);
    case 'completed':
      return taskList.filter(task => task.completed);
    default:
      return taskList;
  }
}

function sortTasks(taskList) {
  return [...taskList].sort((a, b) => {
    switch (currentSort) {
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'effort':
        return b.effort - a.effort;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
      default:
        return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
    }
  });
}

function formatTaskDate(date, time) {
  const taskDate = new Date(date + 'T' + time);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date === today.toISOString().split('T')[0]) {
    return `Today at ${time}`;
  } else if (date === tomorrow.toISOString().split('T')[0]) {
    return `Tomorrow at ${time}`;
  } else {
    return taskDate.toLocaleDateString() + ' at ' + time;
  }
}

function setupProductivityChart() {
  const ctx = document.getElementById('productivity-chart');
  if (!ctx || typeof Chart === 'undefined') return;
  
  // Sample data for the chart
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Tasks Completed',
      data: [3, 5, 2, 7, 4, 6, 3],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };
  
  new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)'
          }
        }
      }
    }
  });
}

function updateInsights() {
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.date === today);
  const completedToday = todayTasks.filter(task => task.completed).length;
  const remainingToday = todayTasks.filter(task => !task.completed).length;
  
  // Update today's stats
  const todayCompleted = document.querySelector('[data-today-completed]');
  const todayRemaining = document.querySelector('[data-today-remaining]');
  const focusTime = document.querySelector('[data-focus-time]');
  
  if (todayCompleted) todayCompleted.textContent = completedToday;
  if (todayRemaining) todayRemaining.textContent = remainingToday;
  if (focusTime) focusTime.textContent = calculateFocusTime() + 'h';
}

function calculateFocusTime() {
  const today = new Date().toISOString().split('T')[0];
  const completedToday = tasks.filter(task => task.date === today && task.completed);
  const totalMinutes = completedToday.reduce((sum, task) => sum + task.duration, 0);
  return (totalMinutes / 60).toFixed(1);
}

function gainXP(amount) {
  userProfile.xp += amount;
  if (userProfile.xp >= userProfile.nextLevelXp) {
    levelUp();
  }
  updateXPDisplay();
}

function levelUp() {
  userProfile.level++;
  userProfile.xp = userProfile.xp - userProfile.nextLevelXp;
  userProfile.nextLevelXp = Math.floor(userProfile.nextLevelXp * 1.5);
  showNotification(`Level Up! You're now level ${userProfile.level}! 🎉`, 'success');
}

function updateXPDisplay() {
  const xpFill = document.querySelector('.xp-fill');
  const xpText = document.querySelector('.xp-text');
  
  if (xpFill) {
    const percentage = (userProfile.xp / userProfile.nextLevelXp) * 100;
    xpFill.style.width = percentage + '%';
  }
  
  if (xpText) {
    xpText.textContent = `${userProfile.xp} / ${userProfile.nextLevelXp} XP to Level ${userProfile.level + 1}`;
  }
}

function updateStreak() {
  // Simple streak logic - in a real app, this would be more sophisticated
  userProfile.streak++;
  const streakElement = document.querySelector('[data-user-streak]');
  if (streakElement) {
    streakElement.textContent = userProfile.streak;
  }
}

function saveDraft() {
  const taskName = document.getElementById('task-name');
  const taskDescription = document.getElementById('task-description');
  const taskDate = document.getElementById('task-date');
  const taskTime = document.getElementById('task-time');
  const taskDuration = document.getElementById('task-duration');
  const taskPriority = document.getElementById('task-priority');
  const taskTags = document.getElementById('task-tags');
  const taskLocation = document.getElementById('task-location');
  
  const draftData = {
    name: taskName ? taskName.value : '',
    description: taskDescription ? taskDescription.value : '',
    date: taskDate ? taskDate.value : '',
    time: taskTime ? taskTime.value : '',
    duration: taskDuration ? taskDuration.value : '',
    priority: taskPriority ? taskPriority.value : '',
    tags: taskTags ? taskTags.value : '',
    location: taskLocation ? taskLocation.value : ''
  };
  
  localStorage.setItem('taskDraft', JSON.stringify(draftData));
  showNotification('Draft saved! 💾', 'info');
}

function loadDraft() {
  const draft = localStorage.getItem('taskDraft');
  if (draft) {
    const draftData = JSON.parse(draft);
    Object.keys(draftData).forEach(key => {
      const element = document.getElementById('task-' + key);
      if (element && draftData[key]) {
        element.value = draftData[key];
      }
    });
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Load draft on page load
window.addEventListener('load', loadDraft);
