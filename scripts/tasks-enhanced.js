/*
  tasks-enhanced.js
  This script will handle the enhanced UI/UX and logic for the refined Remi tasks page, including:
  - User profile and stats display
  - Advanced task creation and management
  - Remi Insights (charts, productivity, suggestions, etc.)
  - Friendly, creative, and interactive features
*/

// Placeholder for user profile (to be fetched from settings in the future)
const userProfile = {
  name: "Remi User",
  avatar: "pfp/Remi-pfp.png",
  level: 5,
  xp: 1200,
  nextLevelXp: 1500,
  streak: 7,
  completedTasks: 42,
  badges: ["achievement1.png", "achievement2.png"]
};

function renderUserProfile() {
  const profileContainer = document.querySelector('.user-profile');
  if (!profileContainer) return;
  profileContainer.innerHTML = `
    <div class="profile-avatar"><img src="${userProfile.avatar}" alt="Profile"></div>
    <div class="profile-info">
      <div class="profile-name">${userProfile.name}</div>
      <div class="profile-stats">
        <span>Level ${userProfile.level}</span>
        <span>XP: ${userProfile.xp}/${userProfile.nextLevelXp}</span>
        <span>Streak: 🔥${userProfile.streak}</span>
        <span>Completed: ${userProfile.completedTasks}</span>
      </div>
      <div class="profile-badges">
        ${userProfile.badges.map(b => `<img src="badges/${b}" class="profile-badge">`).join('')}
      </div>
    </div>
  `;
}

// Enhanced Remi Insights logic
function renderRemiInsights() {
  // Example: show productivity chart, recent achievements, and tips
  const insightsBadges = document.querySelector('.insights-badges');
  if (insightsBadges) {
    insightsBadges.innerHTML = userProfile.badges.map(b => `<img src="badges/${b}" title="Achievement" />`).join('');
  }
  // Example: show a fun productivity stat
  const charts = document.querySelector('.insights-charts');
  if (charts) {
    charts.innerHTML = `
      <div style="text-align:center;">
        <span style="font-size:2.2rem; color:#00796b; font-weight:bold;">${userProfile.completedTasks}</span>
        <div style="color:#666; font-size:1rem;">Tasks Completed</div>
        <div style="margin-top:10px; font-size:0.98rem; color:#009688;">Keep up the great work, ${userProfile.name.split(' ')[0]}!</div>
      </div>
    `;
  }
}

// Enhanced task creation: show/hide advanced options, add subtasks, and friendly UI
function setupTaskCreation() {
  const advBtn = document.querySelector('.advanced-toggle-button');
  const advOptions = document.querySelector('.advanced-options');
  if (advBtn && advOptions) {
    advBtn.addEventListener('click', () => {
      advOptions.style.display = advOptions.style.display === 'block' ? 'none' : 'block';
      advBtn.textContent = advOptions.style.display === 'block' ? 'Hide Advanced' : 'Advanced Settings';
    });
    advOptions.style.display = 'none';
  }
  // Subtask logic (add, edit, delete)
  const subtaskContainer = document.querySelector('.subtask-container');
  const addSubtaskBtn = document.querySelector('.add-subtask-button');
  if (addSubtaskBtn && subtaskContainer) {
    addSubtaskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const subtaskCount = subtaskContainer.children.length + 1;
      const subtaskDiv = document.createElement('div');
      subtaskDiv.className = 'subtask';
      subtaskDiv.innerHTML = `
        <label>Subtask ${subtaskCount}</label>
        <button class="delete-subtask-button"><i class="fas fa-trash"></i></button>
        <button class="edit-subtask-button"><i class="fas fa-edit"></i></button>
      `;
      subtaskContainer.appendChild(subtaskDiv);
    });
    subtaskContainer.addEventListener('click', (e) => {
      if (e.target.closest('.delete-subtask-button')) {
        e.preventDefault();
        e.target.closest('.subtask').remove();
      }
      // Edit logic can be added here
    });
  }
}

// Enhanced tasks list: friendly empty state, dynamic rendering, and creative controls
const tasks = [
  // Example tasks (in real app, fetch from storage or backend)
  {
    name: "Finish Remi UI Mockup",
    description: "Design the new Remi tasks page with creative features.",
    priority: "High",
    effort: "💀Insane",
    deadline: "2025-07-01 18:00",
    duration: 120,
    completed: false
  },
  {
    name: "Read AI Research Paper",
    description: "Summarize the latest paper for tomorrow's meeting.",
    priority: "Medium",
    effort: "😐Moderate",
    deadline: "2025-06-29 20:00",
    duration: 60,
    completed: false
  }
];

function renderTasksList() {
  const list = document.querySelector('.tasks-list');
  if (!list) return;
  if (tasks.length === 0) {
    list.innerHTML = `<div class="empty-tasks">🎉 No tasks yet! Create your first task and let Remi help you shine.</div>`;
    return;
  }
  list.innerHTML = tasks.map((task, i) => `
    <div class="task-item${task.completed ? ' completed' : ''}">
      <div class="task-checkbox-container">
        <input type="checkbox" class="task-complete-checkbox" id="task-complete-${i}" ${task.completed ? 'checked' : ''}>
        <label for="task-complete-${i}"><i class="fas fa-check"></i></label>
      </div>
      <div class="task-infos">
        <div class="task-name">${task.name}</div>
        <div class="task-priority"><i class="fas fa-flag"></i> ${task.priority}</div>
        <div class="task-effort">${task.effort}</div>
      </div>
      <div class="task-description">${task.description}</div>
      <div class="task-settings">
        <div class="task-date">Deadline: ${task.deadline}</div>
        <div class="task-time">Duration: ${task.duration} min</div>
        <div class="remaining-time">${task.completed ? 'Completed!' : 'In Progress'}</div>
      </div>
      <div class="task-controlls">
        <button class="edit-task-button" data-index="${i}"><i class="fas fa-edit"></i></button>
        <button class="delete-task-button" data-index="${i}"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

// Handle task completion, deletion, and editing
function setupTaskListEvents() {
  const list = document.querySelector('.tasks-list');
  if (!list) return;
  list.addEventListener('click', (e) => {
    if (e.target.closest('.delete-task-button')) {
      const idx = e.target.closest('.delete-task-button').dataset.index;
      tasks.splice(idx, 1);
      renderTasksList();
      setupTaskListEvents();
    }
    if (e.target.closest('.edit-task-button')) {
      // For demo: just alert, but you can open a modal or inline edit
      const idx = e.target.closest('.edit-task-button').dataset.index;
      alert('Edit Task: ' + tasks[idx].name);
    }
    if (e.target.closest('.task-complete-checkbox')) {
      const idx = e.target.closest('.task-complete-checkbox').id.split('-').pop();
      tasks[idx].completed = !tasks[idx].completed;
      renderTasksList();
      setupTaskListEvents();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderUserProfile();
  renderRemiInsights();
  setupTaskCreation();
  renderTasksList();
  setupTaskListEvents();
});

// TODO: Add enhanced task creation, list, and Remi Insights logic here.
