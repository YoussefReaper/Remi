// Global variables
let tasksList;
let tasks = [];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTaskManager);

function initializeTaskManager() {
    // Get DOM elements
    const advancedToggleButton = document.querySelector('.advanced-toggle-button');
    const advancedOptions = document.querySelector('.advanced-options');
    const taskForm = document.getElementById('task-form');
    const repeatableCheckbox = document.getElementById('task-repeatable-days');
    const dayChoices = document.querySelectorAll('.day-choice');
    
    tasksList = document.querySelector('.tasks-list');
    
    if (!tasksList) {
        console.error('Tasks list element not found! Make sure the HTML has an element with class "tasks-list"');
        return;
    }

    // Initialize enhanced date/time features
    initializeDateTimeEnhancements();

    // Load existing tasks on page load with validation
    loadTasksWithValidation();
    
    // Validate task persistence every 30 seconds
    setInterval(validateTaskPersistence, 30000);

    // Listen for task updates from chat
    window.addEventListener('taskUpdated', (event) => {
        const { action, task } = event.detail;
        
        switch (action) {
            case 'created':
                // Add the task to local tasks array if not already present
                if (!tasks.find(t => t.id === task.id)) {
                    tasks.push(task);
                    createTaskFromStorage(task);
                }
                break;
            case 'updated':
                // Update the task in the DOM
                const taskIndex = tasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) {
                    tasks[taskIndex] = task;
                    updateTaskInDOM(task);
                }
                break;
            case 'deleted':
                // Remove the task from DOM
                const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
                if (taskElement) {
                    taskElement.remove();
                    tasks = tasks.filter(t => t.id !== task.id);
                    updateEmptyState();
                    updateTaskStatistics();
                }
                break;
        }
    });

    // Setup event listeners
    setupEventListeners(advancedToggleButton, advancedOptions, taskForm, repeatableCheckbox, dayChoices);
    
    // Initialize modern features
    initializeModernFeatures();
    
    // Initialize statistics
    setTimeout(updateTaskStatistics, 100);
}

function setupEventListeners(advancedToggleButton, advancedOptions, taskForm, repeatableCheckbox, dayChoices) {
    // Advanced options toggle
    if (advancedToggleButton && advancedOptions) {
        advancedToggleButton.addEventListener('click', () => {
            advancedOptions.classList.toggle('visible');
            advancedToggleButton.innerHTML = advancedOptions.classList.contains('visible') 
                ? '<i class="fas fa-chevron-up"></i> Hide Advanced' 
                : '<i class="fas fa-chevron-down"></i> Advanced Settings';
        });
    }

    // Task form submission
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmission);
    }

    // Repeatable days toggle
    if (repeatableCheckbox) {
        repeatableCheckbox.addEventListener('change', function() {
            dayChoices.forEach(choice => {
                if (this.checked) {
                    choice.classList.add('active');
                } else {
                    choice.classList.remove('active');
                    choice.querySelector('input').checked = false;
                }
            });
        });
    }

    // Sample task event listeners
    const sampleCheckboxes = document.querySelectorAll('.sample-task .task-complete-checkbox');
    sampleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            taskItem.classList.toggle('completed', this.checked);
        });
    });
}

function handleTaskSubmission(e) {
    e.preventDefault();
    
    if (!validateTaskForm()) {
        return;
    }
    
    const task = collectTaskFormData();
    
    if (task && task.name) {
        renderTask(task);
        saveTaskToStorage(task);
        clearFormDraft(); // Clear the auto-saved draft
        showEnhancedNotification('Task created successfully! 🎉', 'success');
        e.target.reset();
        
        // Reset advanced options visibility
        const advancedOptions = document.querySelector('.advanced-options');
        const advancedToggleButton = document.querySelector('.advanced-toggle-button');
        if (advancedOptions && advancedToggleButton) {
            advancedOptions.classList.remove('visible');
            advancedToggleButton.innerHTML = '<i class="fas fa-chevron-down"></i><span>Show Advanced</span>';
        }
    } else {
        showEnhancedNotification('Failed to create task. Please check all required fields.', 'error');
    }
}

function collectTaskFormData() {
    const taskId = generateTaskId();
    
    // Helper function to safely get element value
    const getElementValue = (id, defaultValue = '') => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : defaultValue;
    };
    
    const getElementChecked = (id, defaultValue = false) => {
        const element = document.getElementById(id);
        return element ? element.checked : defaultValue;
    };
    
    // Collect repeat days with validation
    const repeatDaysElements = document.querySelectorAll('.repeat-days input[type="checkbox"]:checked');
    const repeatDays = repeatDaysElements ? Array.from(repeatDaysElements).map(day => day.value) : [];
    
    const taskData = {
        id: taskId,
        name: getElementValue('task-name'),
        description: getElementValue('task-description'),
        date: getElementValue('task-date') || new Date().toISOString().split('T')[0],
        time: getElementValue('task-time') || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        duration: getElementValue('task-duration') || '30',
        priority: formatPriority(getElementValue('task-priority')) || '2',
        location: getElementValue('task-location'),
        notes: getElementValue('task-notes'),
        tags: getElementValue('task-tags'),
        color: getElementValue('task-color', '#4299e1'),
        deadline: getElementValue('task-deadline'),
        effort: getElementValue('task-effort', '2'),
        repeatable: getElementChecked('task-repeatable-days'),
        repeatDays: repeatDays,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    console.log('Collected task data:', taskData);
    return taskData;
}

function renderTask(task) {
    if (!tasksList) {
        console.error('Cannot render task: tasks list not found');
        return;
    }
    
    if (!task || !task.name) {
        console.error('Cannot render task: invalid task data');
        return;
    }
    
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item new-task';
    taskItem.dataset.taskId = task.id;

    const priorityText = getPriorityText(task.priority);
    const effortText = formatEffort(task.effort);
    const priorityColor = getPriorityColor(task.priority);

    taskItem.innerHTML = `
        <div class="task-checkbox-container">
            <input type="checkbox" class="task-complete-checkbox" ${task.completed ? 'checked' : ''}>
            <label><i class="fas fa-check"></i></label>
        </div>
        <div class="task-content">
            <div class="task-header">
                <h3 class="task-name">${task.name}</h3>
                <div class="task-badges">
                    <span class="priority-badge ${task.priority.toLowerCase()}" style="background-color: ${priorityColor}">
                        ${priorityText}
                    </span>
                    <span class="effort-badge">${effortText}</span>
                </div>
            </div>
            <p class="task-description">${task.description || 'No description'}</p>
            <div class="task-meta">
                <div class="task-timing">
                    <i class="fas fa-calendar"></i>
                    <span class="task-date">${formatTaskDateTime(task.date, task.time)}</span>
                    <i class="fas fa-clock"></i>
                    <span class="task-duration">${task.duration} min</span>
                    <span class="remaining-time">${calculateRemainingTime(task.date, task.time, task.duration)}</span>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-task-button" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-task-button" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add completed class if task is completed
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    // Apply task status classes (late, due today, etc.)
    applyTaskStatusClasses(taskItem, task);

    // Remove new-task class after animation
    setTimeout(() => {
        taskItem.classList.remove('new-task');
    }, 600);

    // Add event listeners
    const checkbox = taskItem.querySelector('.task-complete-checkbox');
    checkbox.addEventListener('change', function () {
        task.completed = this.checked;
        taskItem.classList.toggle('completed', this.checked);
        
        // Add completion timestamp
        if (this.checked) {
            task.completedAt = new Date().toISOString();
        } else {
            delete task.completedAt;
        }
        
        // Update the task in the global tasks array
        const taskIndex = tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...task };
        }
        
        updateTaskInStorage(task);
        
        if (this.checked) {
            animateTaskCompletion(taskItem);
            showEnhancedNotification('Task completed! Great job! 🎉', 'success');
        }
        
        // Update stats immediately
        updateTaskStatistics();
        
        // Force refresh global stats if available
        if (window.globalStatsManager) {
            window.globalStatsManager.forceRefresh();
        }
    });

    const deleteButton = taskItem.querySelector('.delete-task-button');
    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTaskFromStorage(task.id);
            taskItem.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                taskItem.remove();
                updateEmptyState();
                updateTaskStatistics();
            }, 300);
            showEnhancedNotification('Task deleted', 'info');
        }
    });

    const editButton = taskItem.querySelector('.edit-task-button');
    editButton.addEventListener('click', () => {
        openEditModal(task);
    });

    tasksList.appendChild(taskItem);
    updateEmptyState();
    updateTaskStatistics();
}

// Storage functions
function saveTaskToStorage(task) {
    console.log('Saving task to storage:', task);
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    console.log(`Task saved. Total tasks in storage: ${tasks.length}`);
    updateTaskStatistics();
    
    // Dispatch event for cross-page synchronization
    dispatchTaskEvent('created', task);
    
    // Force refresh global stats if available
    if (window.globalStatsManager) {
        window.globalStatsManager.forceRefresh();
    }
}

function updateTaskInStorage(updatedTask) {
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedTask };
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Dispatch event for cross-page synchronization
        dispatchTaskEvent('updated', tasks[index]);
    }
    updateTaskStatistics();
    
    // Force refresh global stats if available
    if (window.globalStatsManager) {
        window.globalStatsManager.forceRefresh();
    }
}

function deleteTaskFromStorage(taskId) {
    const taskToDelete = tasks.find(task => task.id === taskId);
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskStatistics();
    
    // Dispatch event for cross-page synchronization
    if (taskToDelete) {
        dispatchTaskEvent('deleted', taskToDelete);
    }
    
    // Force refresh global stats if available
    if (window.globalStatsManager) {
        window.globalStatsManager.forceRefresh();
    }
}

// Event dispatcher for cross-page task synchronization
function dispatchTaskEvent(action, taskData) {
    const event = new CustomEvent('taskUpdated', {
        detail: {
            action: action, // 'created', 'updated', 'deleted'
            task: taskData
        }
    });
    window.dispatchEvent(event);
}

function loadTasks() {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    // Clear existing tasks (except sample tasks)
    const existingTasks = tasksList.querySelectorAll('.task-item:not(.sample-task)');
    existingTasks.forEach(task => task.remove());
    
    tasks.forEach(task => {
        createTaskFromStorage(task);
    });
    updateTaskStatistics();
}

// Enhanced task persistence validation
function validateTaskPersistence() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const currentTasks = tasks || [];
    
    console.log('Task persistence validation:', {
        storedCount: storedTasks.length,
        currentCount: currentTasks.length,
        storedTasks: storedTasks.map(t => ({ id: t.id, name: t.name, completed: t.completed })),
        currentTasks: currentTasks.map(t => ({ id: t.id, name: t.name, completed: t.completed }))
    });
    
    // Sync if there's a mismatch
    if (storedTasks.length !== currentTasks.length) {
        console.log('Syncing tasks from localStorage...');
        tasks = storedTasks;
        loadTasks();
        return false;
    }
    
    return true;
}

// Enhanced loadTasks function with better error handling
function loadTasksWithValidation() {
    try {
        const storedTasks = localStorage.getItem('tasks');
        
        if (!storedTasks) {
            console.log('No stored tasks found. Initializing empty array.');
            tasks = [];
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return;
        }
        
        tasks = JSON.parse(storedTasks);
        console.log(`Loaded ${tasks.length} tasks from localStorage`);
        
        // Clear existing tasks (except sample tasks)
        const existingTasks = tasksList.querySelectorAll('.task-item:not(.sample-task)');
        existingTasks.forEach(task => task.remove());
        
        // Render each task
        tasks.forEach((task, index) => {
            try {
                createTaskFromStorage(task);
            } catch (error) {
                console.error(`Error creating task ${index}:`, error, task);
            }
        });
        
        updateTaskStatistics();
        updateEmptyState();
        
        console.log('Tasks loaded successfully');
        
    } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
        tasks = [];
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function createTaskFromStorage(taskObj) {
    if (!tasksList) {
        tasksList = document.querySelector('.tasks-list');
    }
    
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.taskId = taskObj.id || generateTaskId();

    const priorityText = getPriorityText(taskObj.priority);
    const effortText = typeof taskObj.effort === 'string' && taskObj.effort.includes('😌') ? 
                       taskObj.effort : formatEffort(taskObj.effort);
    const priorityColor = getPriorityColor(taskObj.priority);

    taskItem.innerHTML = `
        <div class="task-checkbox-container">
            <input type="checkbox" class="task-complete-checkbox" ${taskObj.completed ? 'checked' : ''}>
            <label><i class="fas fa-check"></i></label>
        </div>
        <div class="task-content">
            <div class="task-header">
                <h3 class="task-name">${taskObj.name}</h3>
                <div class="task-badges">
                    <span class="priority-badge ${taskObj.priority}" style="background-color: ${priorityColor}">
                        ${priorityText}
                    </span>
                    <span class="effort-badge">${effortText}</span>
                </div>
            </div>
            <p class="task-description">${taskObj.description || 'No description'}</p>
            <div class="task-meta">
                <div class="task-timing">
                    <i class="fas fa-calendar"></i>
                    <span class="task-date">${formatTaskDateTime(taskObj.date, taskObj.time)}</span>
                    <i class="fas fa-clock"></i>
                    <span class="task-duration">${taskObj.duration} min</span>
                    <span class="remaining-time">${calculateRemainingTime(taskObj.date, taskObj.time, taskObj.duration)}</span>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-task-button" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-task-button" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add completed class if task is completed
    if (taskObj.completed) {
        taskItem.classList.add('completed');
    }
    
    // Apply task status classes (late, due today, etc.)
    applyTaskStatusClasses(taskItem, taskObj);

    // Add event listeners
    const checkbox = taskItem.querySelector('.task-complete-checkbox');
    checkbox.addEventListener('change', function () {
        taskObj.completed = this.checked;
        taskItem.classList.toggle('completed', this.checked);
        
        // Add completion timestamp
        if (this.checked) {
            taskObj.completedAt = new Date().toISOString();
        } else {
            delete taskObj.completedAt;
        }
        
        // Update the task in the global tasks array
        const taskIndex = tasks.findIndex(t => t.id === taskObj.id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...taskObj };
        }
        
        updateTaskInStorage(taskObj);
        
        if (this.checked) {
            animateTaskCompletion(taskItem);
            showEnhancedNotification('Task completed! Great job! 🎉', 'success');
        }
        
        // Update stats immediately
        updateTaskStatistics();
        
        // Force refresh global stats if available
        if (window.globalStatsManager) {
            window.globalStatsManager.forceRefresh();
        }
    });

    const deleteButton = taskItem.querySelector('.delete-task-button');
    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTaskFromStorage(taskObj.id);
            taskItem.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                taskItem.remove();
                updateEmptyState();
                updateTaskStatistics();
            }, 300);
            showNotification('Task deleted', 'info');
        }
    });

    const editButton = taskItem.querySelector('.edit-task-button');
    editButton.addEventListener('click', () => {
        openEditModal(taskObj);
    });

    tasksList.appendChild(taskItem);
    updateEmptyState();
}

// Function to check if task is late, due today, or due tomorrow
function getTaskStatus(task) {
    if (task.completed) return 'completed';
    
    if (!task.date || !task.time) return 'pending';
    
    const now = new Date();
    const taskDate = new Date(`${task.date} ${task.time}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDateOnly = new Date(task.date);
    taskDateOnly.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if task is late
    if (taskDate < now) {
        return 'late';
    }
    
    // Check if due today
    if (taskDateOnly.getTime() === today.getTime()) {
        return 'due-today';
    }
    
    // Check if due tomorrow
    if (taskDateOnly.getTime() === tomorrow.getTime()) {
        return 'due-tomorrow';
    }
    
    return 'pending';
}

// Function to apply task status classes
function applyTaskStatusClasses(taskElement, task) {
    const status = getTaskStatus(task);
    
    // Remove existing status classes
    taskElement.classList.remove('late', 'due-today', 'due-tomorrow', 'completed');
    
    // Add appropriate status class
    taskElement.classList.add(status);
}

// Function to update task in DOM when modified externally (like from chat)
function updateTaskInDOM(updatedTask) {
    const taskElement = document.querySelector(`[data-task-id="${updatedTask.id}"]`);
    if (taskElement) {
        // Update checkbox state
        const checkbox = taskElement.querySelector('.task-complete-checkbox');
        if (checkbox) {
            checkbox.checked = updatedTask.completed;
            taskElement.classList.toggle('completed', updatedTask.completed);
        }
        
        // Update task name if changed
        const taskNameElement = taskElement.querySelector('.task-name');
        if (taskNameElement && updatedTask.name) {
            taskNameElement.textContent = updatedTask.name;
        }
        
        // Update task description if changed
        const taskDescElement = taskElement.querySelector('.task-description');
        if (taskDescElement && updatedTask.description !== undefined) {
            taskDescElement.textContent = updatedTask.description || 'No description';
        }
        
        // Update priority badge if changed
        if (updatedTask.priority) {
            const priorityBadge = taskElement.querySelector('.priority-badge');
            if (priorityBadge) {
                const priorityText = getPriorityText(updatedTask.priority);
                const priorityColor = getPriorityColor(updatedTask.priority);
                priorityBadge.textContent = priorityText;
                priorityBadge.style.backgroundColor = priorityColor;
                priorityBadge.className = `priority-badge ${updatedTask.priority.toLowerCase()}`;
            }
        }
        
        // Update task timing if changed
        if (updatedTask.date && updatedTask.time) {
            const taskDateElement = taskElement.querySelector('.task-date');
            if (taskDateElement) {
                taskDateElement.textContent = formatTaskDateTime(updatedTask.date, updatedTask.time);
            }
        }
        
        // Update duration if changed
        if (updatedTask.duration) {
            const taskDurationElement = taskElement.querySelector('.task-duration');
            if (taskDurationElement) {
                taskDurationElement.textContent = `${updatedTask.duration} min`;
            }
        }
        
        // Update remaining time
        const remainingTimeElement = taskElement.querySelector('.remaining-time');
        if (remainingTimeElement && updatedTask.date && updatedTask.time && updatedTask.duration) {
            remainingTimeElement.textContent = calculateRemainingTime(updatedTask.date, updatedTask.time, updatedTask.duration);
        }
        
        // Apply task status classes
        applyTaskStatusClasses(taskElement, updatedTask);
        
        updateTaskStatistics();
    }
}

// Modern features initialization
function initializeModernFeatures() {
    // Panel toggle functionality
    initializePanelToggles();
    
    // Task filtering and sorting
    initializeTaskFiltering();
    
    // Modal functionality
    initializeModal();
    
    // Reset form button
    initializeResetForm();
    
    // Advanced options toggle enhancement
    enhanceAdvancedToggle();
    
    // Keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Auto-save draft
    initializeAutoSave();
    
    // Task templates
    initializeTaskTemplates();
    
    // Task templates
    initializeTaskTemplates();
}

function initializePanelToggles() {
    const toggleButton = document.getElementById('toggleCreatePanel');
    const createContent = document.getElementById('createTaskContent');
    
    if (toggleButton && createContent) {
        toggleButton.addEventListener('click', () => {
            const isCollapsed = createContent.style.display === 'none';
            createContent.style.display = isCollapsed ? 'block' : 'none';
            toggleButton.innerHTML = isCollapsed ? 
                '<i class="fas fa-chevron-up"></i>' : 
                '<i class="fas fa-chevron-down"></i>';
        });
    }
}

function initializeTaskFiltering() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            applyTaskFilter(filter);
        });
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sortTasks');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            sortTasks(sortSelect.value);
        });
    }
}

function applyTaskFilter(filter) {
    const taskItems = document.querySelectorAll('.task-item:not(.sample-task)');
    const today = new Date().toDateString();
    let visibleCount = 0;
    
    taskItems.forEach(item => {
        const taskId = item.dataset.taskId;
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
            item.style.display = 'none';
            return;
        }
        
        let shouldShow = true;
        
        switch (filter) {
            case 'all':
                shouldShow = true;
                break;
            case 'pending':
                shouldShow = !task.completed;
                break;
            case 'completed':
                shouldShow = task.completed === true;
                break;
            case 'today':
                const taskDate = new Date(task.date).toDateString();
                shouldShow = taskDate === today;
                break;
        }
        
        if (shouldShow) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update empty state based on visible tasks
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        if (visibleCount === 0) {
            emptyState.style.display = 'block';
            // Update empty state message based on filter
            const emptyMessage = emptyState.querySelector('p');
            if (emptyMessage) {
                switch (filter) {
                    case 'completed':
                        emptyMessage.textContent = 'No completed tasks yet! Complete some tasks to see them here.';
                        break;
                    case 'pending':
                        emptyMessage.textContent = 'No pending tasks! All your tasks are completed.';
                        break;
                    case 'today':
                        emptyMessage.textContent = 'No tasks scheduled for today.';
                        break;
                    default:
                        emptyMessage.textContent = 'No tasks yet! Create your first task to get started.';
                }
            }
        } else {
            emptyState.style.display = 'none';
        }
    }
}

function sortTasks(sortBy) {
    const taskItems = Array.from(document.querySelectorAll('.task-item:not(.sample-task)'));
    
    taskItems.sort((a, b) => {
        const taskA = tasks.find(t => t.id === a.dataset.taskId);
        const taskB = tasks.find(t => t.id === b.dataset.taskId);
        
        if (!taskA || !taskB) return 0;
        
        switch (sortBy) {
            case 'date':
                return new Date(taskA.date + ' ' + taskA.time) - new Date(taskB.date + ' ' + taskB.time);
            case 'priority':
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[taskB.priority] - priorityOrder[taskA.priority];
            case 'name':
                return taskA.name.localeCompare(taskB.name);
            case 'duration':
                return parseInt(taskB.duration) - parseInt(taskA.duration);
            default:
                return 0;
        }
    });
    
    // Reorder DOM elements
    taskItems.forEach(item => {
        tasksList.appendChild(item);
    });
}

function initializeModal() {
    const modal = document.getElementById('editTaskModal');
    const closeBtn = document.getElementById('closeEditModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeEditModal();
        }
    });
}

function openEditModal(task) {
    const modal = document.getElementById('editTaskModal');
    const form = document.getElementById('edit-task-form');
    
    if (!modal || !form) return;
    
    // Populate form with task data
    form.innerHTML = `
        <div class="form-section">
            <h3 class="section-title">Basic Information</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="edit-task-name">Task Name</label>
                    <input type="text" id="edit-task-name" value="${task.name}" required maxlength="50">
                </div>
                <div class="form-group">
                    <label for="edit-task-priority">Priority</label>
                    <select id="edit-task-priority" required>
                        <option value="3" ${task.priority === 'High' ? 'selected' : ''}>🔴 High Priority</option>
                        <option value="2" ${task.priority === 'Medium' ? 'selected' : ''}>🟡 Medium Priority</option>
                        <option value="1" ${task.priority === 'Low' ? 'selected' : ''}>🟢 Low Priority</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="edit-task-description">Description</label>
                <textarea id="edit-task-description" maxlength="200">${task.description}</textarea>
            </div>
        </div>
        
        <div class="form-section">
            <h3 class="section-title">Schedule</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="edit-task-date">Date</label>
                    <input type="date" id="edit-task-date" value="${task.date}" required>
                </div>
                <div class="form-group">
                    <label for="edit-task-time">Time</label>
                    <input type="time" id="edit-task-time" value="${task.time}" required>
                </div>
                <div class="form-group">
                    <label for="edit-task-duration">Duration (minutes)</label>
                    <input type="number" id="edit-task-duration" value="${task.duration}" min="1" max="480" required>
                </div>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="create-task-button">
                <i class="fas fa-save"></i>
                Save Changes
            </button>
            <button type="button" class="cancel-edit-button" onclick="closeEditModal()">
                <i class="fas fa-times"></i>
                Cancel
            </button>
        </div>
    `;
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTaskEdit(task.id);
    });
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeEditModal() {
    const modal = document.getElementById('editTaskModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function saveTaskEdit(taskId) {
    const updatedTask = {
        id: taskId,
        name: document.getElementById('edit-task-name').value.trim(),
        description: document.getElementById('edit-task-description').value.trim(),
        date: document.getElementById('edit-task-date').value,
        time: document.getElementById('edit-task-time').value,
        duration: document.getElementById('edit-task-duration').value,
        priority: formatPriority(document.getElementById('edit-task-priority').value),
        completed: tasks.find(t => t.id === taskId)?.completed || false
    };
    
    // Update in storage
    updateTaskInStorage(updatedTask);
    
    // Refresh the task display
    loadTasks();
    
    closeEditModal();
    showNotification('Task updated successfully! ✅', 'success');
}

function initializeResetForm() {
    const resetBtn = document.getElementById('resetForm');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const form = document.getElementById('task-form');
            if (form) {
                form.reset();
                
                // Reset advanced options
                const advancedOptions = document.querySelector('.advanced-options');
                const advancedToggleButton = document.querySelector('.advanced-toggle-button');
                if (advancedOptions && advancedToggleButton) {
                    advancedOptions.classList.remove('visible');
                    advancedToggleButton.innerHTML = '<i class="fas fa-chevron-down"></i><span>Show Advanced</span>';
                }
                
                showNotification('Form reset', 'info');
            }
        });
    }
}

function enhanceAdvancedToggle() {
    const advancedToggleButton = document.querySelector('.advanced-toggle-button');
    const advancedOptions = document.querySelector('.advanced-options');
    
    if (advancedToggleButton && advancedOptions) {
        // Ensure proper initial state
        advancedToggleButton.innerHTML = '<i class="fas fa-chevron-down"></i><span>Show Advanced</span>';
        
        // Remove any existing listeners to prevent duplicates
        const newButton = advancedToggleButton.cloneNode(true);
        advancedToggleButton.parentNode.replaceChild(newButton, advancedToggleButton);
        
        newButton.addEventListener('click', () => {
            const isVisible = advancedOptions.classList.contains('visible');
            advancedOptions.classList.toggle('visible');
            
            newButton.innerHTML = isVisible ? 
                '<i class="fas fa-chevron-down"></i><span>Show Advanced</span>' : 
                '<i class="fas fa-chevron-up"></i><span>Hide Advanced</span>';
        });
    }
}

// Enhanced user experience features
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N for new task
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            document.getElementById('task-name').focus();
        }
        
        // Ctrl/Cmd + F for filter focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            document.querySelector('.filter-btn[data-filter="all"]').focus();
        }
        
        // Enter to submit form when in form fields
        if (e.key === 'Enter' && e.target.matches('#task-name, #task-description')) {
            if (e.target.id === 'task-name') {
                document.getElementById('task-description').focus();
            } else if (e.target.id === 'task-description' && !e.shiftKey) {
                e.preventDefault();
                const form = document.getElementById('task-form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        }
    });
}

// Auto-save draft functionality
function initializeAutoSave() {
    const formFields = ['task-name', 'task-description', 'task-date', 'task-time', 'task-duration', 'task-priority'];
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', debounce(() => {
                saveFormDraft();
            }, 1000));
        }
    });
    
    // Load draft on page load
    loadFormDraft();
}

function saveFormDraft() {
    const draft = {
        name: document.getElementById('task-name')?.value || '',
        description: document.getElementById('task-description')?.value || '',
        date: document.getElementById('task-date')?.value || '',
        time: document.getElementById('task-time')?.value || '',
        duration: document.getElementById('task-duration')?.value || '',
        priority: document.getElementById('task-priority')?.value || ''
    };
    
    // Only save if there's some content
    if (Object.values(draft).some(value => value.trim() !== '')) {
        localStorage.setItem('taskDraft', JSON.stringify(draft));
    } else {
        localStorage.removeItem('taskDraft');
    }
}

function loadFormDraft() {
    const draft = localStorage.getItem('taskDraft');
    if (draft) {
        try {
            const draftData = JSON.parse(draft);
            Object.entries(draftData).forEach(([key, value]) => {
                const field = document.getElementById(`task-${key}`);
                if (field && value) {
                    field.value = value;
                }
            });
        } catch (e) {
            console.warn('Could not load form draft:', e);
        }
    }
}

function clearFormDraft() {
    localStorage.removeItem('taskDraft');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Task completion animations
function animateTaskCompletion(taskItem) {
    if (!taskItem) return;
    
    taskItem.style.animation = 'taskComplete 0.6s ease-in-out';
    
    // Create celebration particles
    createCelebrationParticles(taskItem);
}

function createCelebrationParticles(element) {
    if (!element) return;
    
    try {
        const rect = element.getBoundingClientRect();
        const particles = ['🎉', '✨', '🌟', '💫'];
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.cssText = `
                position: fixed;
                top: ${rect.top + rect.height / 2}px;
                left: ${rect.left + rect.width / 2}px;
                font-size: 1.2rem;
                pointer-events: none;
                z-index: 1000;
                animation: particleFloat 1.5s ease-out forwards;
                animation-delay: ${i * 0.1}s;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentElement) {
                    particle.remove();
                }
            }, 1500);
        }
    } catch (error) {
        console.warn('Error creating celebration particles:', error);
    }
}

// Enhanced notifications
function showEnhancedNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to notification container or body
    const container = document.getElementById('notificationContainer') || document.body;
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Task templates for quick creation
const taskTemplates = {
    study: {
        name: 'Study Session',
        description: 'Focused study time',
        duration: '60',
        priority: '2'
    },
    homework: {
        name: 'Complete Homework',
        description: 'Work on assignments',
        duration: '90',
        priority: '3'
    },
    reading: {
        name: 'Reading Assignment',
        description: 'Read course materials',
        duration: '45',
        priority: '2'
    },
    review: {
        name: 'Review Notes',
        description: 'Go over class notes',
        duration: '30',
        priority: '1'
    }
};

function initializeTaskTemplates() {
    // Add template buttons to the form
    const formSection = document.querySelector('.form-section');
    if (formSection) {
        const templateSection = document.createElement('div');
        templateSection.className = 'template-section';
        templateSection.innerHTML = `
            <h4 style="color: var(--ai-text-color); margin-bottom: 10px;">Quick Templates:</h4>
            <div class="template-buttons">
                ${Object.entries(taskTemplates).map(([key, template]) => `
                    <button type="button" class="template-btn" data-template="${key}">
                        ${template.name}
                    </button>
                `).join('')}
            </div>
        `;
        
        formSection.appendChild(templateSection);
        
        // Add event listeners
        templateSection.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateKey = btn.dataset.template;
                const template = taskTemplates[templateKey];
                
                document.getElementById('task-name').value = template.name;
                document.getElementById('task-description').value = template.description;
                document.getElementById('task-duration').value = template.duration;
                document.getElementById('task-priority').value = template.priority;
                
                showEnhancedNotification(`Template "${template.name}" applied!`, 'info', 2000);
            });
        });
    }
}

// Helper functions
function getPriorityText(priority) {
    switch (priority) {
        case "Low": return "🟢 Low";
        case "Medium": return "🟡 Medium";
        case "High": return "🔴 High";
        default: return "🟡 Medium";
    }
}

function formatTaskDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) {
        return 'No date set';
    }
    
    try {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let dateText;
        if (date.toDateString() === today.toDateString()) {
            dateText = "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            dateText = "Tomorrow";
        } else {
            dateText = formatDate(dateStr);
        }
        
        // Format time to 12-hour format
        const time = new Date(`2000-01-01 ${timeStr}`);
        const timeText = time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        return `${dateText}, ${timeText}`;
    } catch (error) {
        console.warn('Error formatting date/time:', error);
        return `${dateStr} ${timeStr}`;
    }
}

// Utility functions
function formatEffort(level) {
    switch (level) {
        case "1": return "😌 Very Easy";
        case "2": return "🙂 Easy";
        case "3": return "😐 Moderate";
        case "4": return "😰 Hard";
        case "5": return "💀 Insane";
        default: return "😐 Moderate";
    }
}

function formatPriority(priority) {
    switch (priority) {
        case "1": return "Low";
        case "2": return "Medium";
        case "3": return "High";
        default: return "Medium";
    }
}

function getPriorityColor(priority) {
    switch (priority) {
        case "Low": return "#28a745";
        case "Medium": return "#ffc107";
        case "High": return "#dc3545";
        default: return "#6c757d";
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
}

function calculateRemainingTime(dateStr, timeStr, duration) {
    if (!dateStr || !timeStr) {
        return "No deadline";
    }
    
    try {
        const taskDateTime = new Date(`${dateStr} ${timeStr}`);
        const now = new Date();
        const diff = taskDateTime.getTime() - now.getTime();
        
        if (diff < 0) {
            return "⚠️ Overdue";
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    } catch (error) {
        console.warn('Error calculating remaining time:', error);
        return "Invalid date";
    }
}

function generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Update task statistics
function updateTaskStatistics() {
    // Use global stats manager if available, otherwise fallback to local calculation
    if (window.globalStatsManager) {
        // Global stats manager will update all dynamic numbers
        window.globalStatsManager.calculateAllStats();
        window.globalStatsManager.updateAllElements();
    } else {
        // Fallback local calculation for backward compatibility
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        // Calculate late tasks locally
        const now = new Date();
        const lateTasks = tasks.filter(task => {
            if (task.completed) return false;
            if (!task.date || !task.time) return false;
            const taskDate = new Date(`${task.date} ${task.time}`);
            return taskDate < now;
        }).length;
        
        // Calculate due today tasks locally
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueTodayTasks = tasks.filter(task => {
            if (task.completed) return false;
            if (!task.date) return false;
            const taskDateOnly = new Date(task.date);
            taskDateOnly.setHours(0, 0, 0, 0);
            return taskDateOnly.getTime() === today.getTime();
        }).length;
        
        // Calculate streak (simplified version)
        const streakDays = calculateStreakDays();
        
        // Update the stats in the header
        const completedElement = document.getElementById('completedTasks');
        const pendingElement = document.getElementById('pendingTasks');
        const streakElement = document.getElementById('streakDays');
        const lateElement = document.getElementById('lateTasks');
        const dueTodayElement = document.getElementById('dueToday');
        
        if (completedElement) completedElement.textContent = completedTasks;
        if (pendingElement) pendingElement.textContent = pendingTasks;
        if (streakElement) streakElement.textContent = streakDays;
        if (lateElement) lateElement.textContent = lateTasks;
        if (dueTodayElement) dueTodayElement.textContent = dueTodayTasks;
    }
}

function calculateStreakDays() {
    // Simple streak calculation - count consecutive days with completed tasks
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);
    
    // Check the last 30 days for a reasonable streak calculation
    for (let i = 0; i < 30; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasCompletedTask = tasks.some(task => 
            task.completed && task.date === dateStr
        );
        
        if (hasCompletedTask) {
            streak++;
        } else if (i > 0) {
            // Break streak if no completed tasks on this day (but not today)
            break;
        }
        
        checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
}

// Form validation
function validateTaskForm() {
    // Helper function to safely get element value
    const getElementValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    };
    
    const name = getElementValue('task-name');
    const date = getElementValue('task-date');
    const time = getElementValue('task-time');
    const duration = getElementValue('task-duration');
    const priority = getElementValue('task-priority');
    
    const errors = [];
    
    if (!name) errors.push('📝 Task name is required');
    if (name.length > 50) errors.push('📝 Task name must be 50 characters or less');
    if (!date) errors.push('📅 Date is required - try using the quick options above!');
    if (!time) errors.push('⏰ Time is required - pick when you want to start');
    if (!duration || duration <= 0) errors.push('⏱️ Duration must be a positive number (e.g., 30, 60, 120 minutes)');
    if (!priority) errors.push('🔥 Priority is required - how important is this task?');
    
    // Enhanced date/time validation with helpful suggestions
    if (date && time) {
        const taskDateTime = new Date(`${date} ${time}`);
        const now = new Date();
        if (taskDateTime < now) {
            const minutesAgo = Math.round((now - taskDateTime) / (1000 * 60));
            if (minutesAgo > 5) {
                errors.push(`⚠️ This task is scheduled ${minutesAgo} minutes in the past. Use "Right Now" or "In 1 Hour" quick options for immediate tasks.`);
            }
        }
        
        // Check for reasonable duration
        if (duration) {
            const durationNum = parseInt(duration);
            if (durationNum > 480) {
                errors.push('⏱️ Duration over 8 hours seems quite long. Consider breaking this into smaller tasks.');
            } else if (durationNum < 5) {
                errors.push('⏱️ Duration under 5 minutes might be too short for meaningful work.');
            }
        }
    }
    
    if (errors.length > 0) {
        const errorMessage = errors.join('<br>');
        showEnhancedNotification(errorMessage, 'error', 8000);
        return false;
    }
    
    return true;
}

function showNotification(message, type = 'info') {
    // Use the enhanced notification function
    showEnhancedNotification(message, type);
}

// Empty state management
function updateEmptyState() {
    if (!tasksList) {
        console.warn('Tasks list not available for empty state update');
        return;
    }
    
    const taskItems = tasksList.querySelectorAll('.task-item:not(.sample-task)');
    const emptyState = document.getElementById('emptyState');
    
    if (taskItems.length === 0) {
        tasksList.classList.add('empty');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    } else {
        tasksList.classList.remove('empty');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
}

// Listen for task updates from chat system
window.addEventListener('tasksUpdated', (event) => {
    const { task, taskId, updates, action } = event.detail;
    
    switch (action) {
        case 'create':
            // Reload tasks to show new task from chat
            loadTasks();
            showNotification(`Task "${task.name}" created from chat! 🎉`, 'success');
            break;
        case 'update':
            // Reload tasks to show updated task
            loadTasks();
            showNotification('Task updated from chat!', 'info');
            break;
        case 'delete':
            // Reload tasks to remove deleted task
            loadTasks();
            showNotification('Task deleted from chat!', 'info');
            break;
    }
});

// Add slide out animation styles
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideOut {
        0% {
            transform: translateX(0);
            opacity: 1;
        }
        100% {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(slideOutStyle);

// Date/Time enhancements initialization
function initializeDateTimeEnhancements() {
    // Set intelligent defaults for date and time
    setIntelligentDateTimeDefaults();
    
    // Setup date/time change listeners for helper text
    setupDateTimeHelpers();
    
    // Initialize preset buttons
    initializeDateTimePresets();
    
    // Add smart validation feedback
    setupSmartValidation();
}

function setIntelligentDateTimeDefaults() {
    const dateInput = document.getElementById('task-date');
    const timeInput = document.getElementById('task-time');
    
    if (dateInput && !dateInput.value) {
        // Default to today
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
    }
    
    if (timeInput && !timeInput.value) {
        // Default to next reasonable hour (or current hour + 1)
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
        const hours = String(nextHour.getHours()).padStart(2, '0');
        const minutes = '00'; // Round to the hour for simplicity
        timeInput.value = `${hours}:${minutes}`;
    }
}

function setupDateTimeHelpers() {
    const dateInput = document.getElementById('task-date');
    const timeInput = document.getElementById('task-time');
    const dateHelperText = document.getElementById('dateHelperText');
    const timeHelperText = document.getElementById('timeHelperText');
    
    if (dateInput && dateHelperText) {
        dateInput.addEventListener('change', () => {
            updateDateHelperText(dateInput.value, dateHelperText);
        });
        
        // Update on initial load
        if (dateInput.value) {
            updateDateHelperText(dateInput.value, dateHelperText);
        }
    }
    
    if (timeInput && timeHelperText) {
        timeInput.addEventListener('change', () => {
            updateTimeHelperText(timeInput.value, timeHelperText);
        });
        
        // Update on initial load
        if (timeInput.value) {
            updateTimeHelperText(timeInput.value, timeHelperText);
        }
    }
}

function updateDateHelperText(dateValue, helperElement) {
    if (!dateValue || !helperElement) return;
    
    try {
        const selectedDate = new Date(dateValue);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const daysDiff = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
        
        let helperText = '';
        
        if (selectedDate.toDateString() === today.toDateString()) {
            helperText = 'Perfect! Starting today keeps you on track 🎯';
        } else if (selectedDate.toDateString() === tomorrow.toDateString()) {
            helperText = 'Great choice! Tomorrow gives you time to prepare 📅';
        } else if (daysDiff > 0 && daysDiff <= 3) {
            helperText = `${daysDiff} days from now - good planning ahead! 👍`;
        } else if (daysDiff > 3 && daysDiff <= 7) {
            helperText = `Scheduled for next week - excellent long-term planning! 📋`;
        } else if (daysDiff > 7) {
            helperText = `Future planning - don't forget to review closer to the date! 🗓️`;
        } else {
            helperText = 'That date has passed - consider updating to today or later 📌';
        }
        
        helperElement.textContent = helperText;
    } catch (error) {
        helperElement.textContent = 'Choose a date for your task';
    }
}

function updateTimeHelperText(timeValue, helperElement) {
    if (!timeValue || !helperElement) return;
    
    try {
        const [hours, minutes] = timeValue.split(':').map(Number);
        const now = new Date();
        const currentHour = now.getHours();
        
        let helperText = '';
        
        if (hours >= 6 && hours < 9) {
            helperText = 'Early bird! Great time for focused work 🌅';
        } else if (hours >= 9 && hours < 12) {
            helperText = 'Morning productivity - when your mind is fresh! ☀️';
        } else if (hours >= 12 && hours < 14) {
            helperText = 'Lunch time task - keep it light and achievable 🍽️';
        } else if (hours >= 14 && hours < 17) {
            helperText = 'Afternoon focus time - great for detailed work! 💼';
        } else if (hours >= 17 && hours < 20) {
            helperText = 'Evening task - perfect for wrapping up the day 🌆';
        } else if (hours >= 20 && hours < 22) {
            helperText = 'Evening time - good for lighter tasks 🌙';
        } else if (hours >= 22 || hours < 6) {
            helperText = 'Late night/early morning - make sure you get enough rest! 😴';
        }
        
        // Add current time context
        const timeDiff = hours - currentHour;
        if (timeDiff === 0) {
            helperText += ' (Starting now!)';
        } else if (timeDiff === 1) {
            helperText += ' (In 1 hour)';
        } else if (timeDiff > 1 && timeDiff <= 3) {
            helperText += ` (In ${timeDiff} hours)`;
        }
        
        helperElement.textContent = helperText;
    } catch (error) {
        helperElement.textContent = 'Pick a good time to start';
    }
}

function initializeDateTimePresets() {
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    presetButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            applyDateTimePreset(btn.dataset.preset);
        });
    });
}

function applyDateTimePreset(preset) {
    const dateInput = document.getElementById('task-date');
    const timeInput = document.getElementById('task-time');
    const dateHelperText = document.getElementById('dateHelperText');
    const timeHelperText = document.getElementById('timeHelperText');
    
    if (!dateInput || !timeInput) return;
    
    const now = new Date();
    let targetDate = new Date();
    let targetTime = '';
    
    switch (preset) {
        case 'now':
            targetDate = now;
            targetTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            break;
            
        case '1hour':
            targetDate = new Date(now.getTime() + 60 * 60 * 1000);
            targetTime = `${String(targetDate.getHours()).padStart(2, '0')}:00`;
            break;
            
        case 'tomorrow-morning':
            targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() + 1);
            targetTime = '09:00';
            break;
            
        case 'next-week':
            targetDate = new Date(now);
            // Get next Monday
            const daysUntilMonday = (1 + 7 - targetDate.getDay()) % 7 || 7;
            targetDate.setDate(targetDate.getDate() + daysUntilMonday);
            targetTime = '09:00';
            break;
    }
    
    // Apply the preset values
    dateInput.value = targetDate.toISOString().split('T')[0];
    timeInput.value = targetTime;
    
    // Update helper texts
    if (dateHelperText) updateDateHelperText(dateInput.value, dateHelperText);
    if (timeHelperText) updateTimeHelperText(timeInput.value, timeHelperText);
    
    // Add visual feedback
    showEnhancedNotification(`📅 Date and time set to ${formatTaskDateTime(dateInput.value, timeInput.value)}`, 'success', 2000);
}

// Smart validation functions for date and time inputs
function setupSmartValidation() {
    const dateInput = document.getElementById('task-date');
    const timeInput = document.getElementById('task-time');
    const durationInput = document.getElementById('task-duration');
    
    if (dateInput) {
        dateInput.addEventListener('blur', () => {
            validateDateInput(dateInput);
        });
        
        dateInput.addEventListener('focus', () => {
            showEnhancedNotification('💡 Tip: Use the Quick Options below for common date selections!', 'info', 3000);
        });
    }
    
    if (timeInput) {
        timeInput.addEventListener('blur', () => {
            validateTimeInput(timeInput);
        });
        
        timeInput.addEventListener('focus', () => {
            const now = new Date();
            const nextHour = now.getHours() + 1;
            showEnhancedNotification(`💡 Current time: ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Consider starting in the next hour (${nextHour}:00).`, 'info', 3000);
        });
    }
    
    if (durationInput) {
        durationInput.addEventListener('focus', () => {
            showEnhancedNotification('💡 Duration tips: 30min (quick task), 60min (normal), 90-120min (deep work session)', 'info', 4000);
        });
    }
}