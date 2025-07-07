// schedule.js - Remi AI Schedule Page Logic
// Handles calendar rendering, event CRUD, and UI interactions

const SCHEDULE_STORAGE_KEY = 'remiScheduleEvents';

// Utility: Get events from localStorage
function getScheduleEvents() {
    return JSON.parse(localStorage.getItem(SCHEDULE_STORAGE_KEY) || '[]');
}

// Utility: Save events to localStorage
function saveScheduleEvents(events) {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(events));
}

// Utility: Generate a unique event ID
function generateEventId() {
    return 'event-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

// Date helpers
function getToday() {
    const now = new Date();
    now.setHours(0,0,0,0);
    return now;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
}

// State
let currentView = 'week';
let currentDate = getToday();
let editingEventId = null;

// DOM Elements
const weekView = () => document.getElementById('weekView');
const monthView = () => document.getElementById('monthView');
const dayView = () => document.getElementById('dayView');
const currentPeriod = () => document.getElementById('currentPeriod');
const eventModal = () => document.getElementById('eventModal');
const eventForm = () => document.getElementById('eventForm');
const deleteModal = () => document.getElementById('deleteModal');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupViewControls();
    setupCalendarNav();
    setupEventModal();
    setupQuickAdd();
    renderSchedule();
    
    // Add example events and tasks if needed
    addExampleEventsAndTasks();
    
    // Initialize the clock and task markers
    initClock();
    
    // Refresh markers after a short delay to ensure everything is loaded
    setTimeout(() => {
        renderTaskMarkersOnClock();
    }, 500);
});

function setupViewControls() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderSchedule();
        });
    });
}

function setupCalendarNav() {
    document.getElementById('prevBtn').onclick = () => {
        if (currentView === 'month') currentDate.setMonth(currentDate.getMonth() - 1);
        else if (currentView === 'week') currentDate.setDate(currentDate.getDate() - 7);
        else currentDate.setDate(currentDate.getDate() - 1);
        renderSchedule();
    };
    document.getElementById('nextBtn').onclick = () => {
        if (currentView === 'month') currentDate.setMonth(currentDate.getMonth() + 1);
        else if (currentView === 'week') currentDate.setDate(currentDate.getDate() + 7);
        else currentDate.setDate(currentDate.getDate() + 1);
        renderSchedule();
    };
    document.getElementById('todayBtn').onclick = () => {
        currentDate = getToday();
        renderSchedule();
    };
}

function setupEventModal() {
    document.querySelector('.add-event-btn').onclick = () => openEventModal();
    document.getElementById('closeModal').onclick = closeEventModal;
    document.getElementById('cancelEvent').onclick = closeEventModal;
    eventForm().onsubmit = handleEventFormSubmit;
    document.getElementById('closeDeleteModal').onclick = closeDeleteModal;
    document.getElementById('cancelDelete').onclick = closeDeleteModal;
    document.getElementById('confirmDelete').onclick = confirmDeleteEvent;
}

function setupQuickAdd() {
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.onclick = () => {
            openEventModal({
                type: btn.dataset.template,
                title: btn.textContent.trim(),
                date: formatDate(currentDate),
            });
        };
    });
}

function renderSchedule() {
    renderPeriodLabel();
    renderWeekView();
    renderMonthView();
    renderDayView();
    renderUpcomingEvents();
    updateTodayItems(); // Update today's events and tasks when schedule changes
}

function renderPeriodLabel() {
    const options = { month: 'long', year: 'numeric' };
    let label = '';
    if (currentView === 'month') {
        label = currentDate.toLocaleDateString(undefined, options);
    } else if (currentView === 'week') {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        label = `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
        label = currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    currentPeriod().textContent = label;
}

function renderWeekView() {
    weekView().classList.toggle('active', currentView === 'week');
    if (currentView !== 'week') return;
    // Render day headers
    const dayHeaders = document.getElementById('dayHeaders');
    dayHeaders.innerHTML = '';
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const div = document.createElement('div');
        div.className = 'day-header';
        
        // Check if this is today
        if (d.getTime() === today.getTime()) {
            div.classList.add('today');
        }
        
        div.textContent = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
        dayHeaders.appendChild(div);
    }
    // Render time labels
    const timeLabels = document.getElementById('timeLabels');
    timeLabels.innerHTML = '';
    for (let h = 7; h <= 22; h++) {
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = `${h}:00`;
        timeLabels.appendChild(label);
    }
    // Render events grid
    const weekDays = document.getElementById('weekDays');
    weekDays.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const col = document.createElement('div');
        col.className = 'week-day-col';
        for (let h = 7; h <= 22; h++) {
            const slot = document.createElement('div');
            slot.className = 'week-slot';
            slot.dataset.date = formatDate(d);
            slot.dataset.hour = h;
            
            // Make slots clickable to add events
            slot.addEventListener('click', (e) => {
                // Only trigger if clicked directly on the slot (not on an event)
                if (e.target === slot) {
                    const date = slot.dataset.date;
                    const hour = slot.dataset.hour;
                    
                    // Format time for the event modal
                    const formattedHour = hour.toString().padStart(2, '0');
                    const startTime = `${formattedHour}:00`;
                    const endTime = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`;
                    
                    // Open event modal with pre-filled date and time
                    openEventModal({
                        date: date,
                        startTime: startTime,
                        endTime: endTime
                    });
                }
            });
            
            col.appendChild(slot);
        }
        weekDays.appendChild(col);
    }
    // Place events
    const events = getScheduleEvents();
    for (const event of events) {
        const eventDate = new Date(event.date);
        if (eventDate >= start && eventDate < new Date(start.getTime() + 7 * 86400000)) {
            const colIdx = (eventDate.getDay() + 7 - start.getDay()) % 7;
            
            // Only process events with start times
            if (event.startTime) {
                const [hour, minute] = event.startTime.split(':').map(Number);
                
                // Only show events between 7am and 10pm
                if (hour >= 7 && hour <= 22) {
                    const col = weekDays.children[colIdx];
                    if (col) {
                        const slotIdx = hour - 7;
                        const slot = col.children[slotIdx];
                        
                        if (slot) {
                            const el = createEventElement(event);
                            
                            // Calculate event duration if end time exists
                            if (event.endTime) {
                                const [endHour, endMinute] = event.endTime.split(':').map(Number);
                                // Only extend if end hour is within display range
                                if (endHour > hour && endHour <= 22) {
                                    const durationHours = Math.min(endHour - hour, 22 - hour);
                                    const heightPercentage = durationHours * 100;
                                    el.style.height = `${heightPercentage}%`;
                                    el.style.zIndex = '5';
                                }
                            }
                            
                            slot.appendChild(el);
                        }
                    }
                }
            }
        }
    }
}

function renderMonthView() {
    monthView().classList.toggle('active', currentView === 'month');
    if (currentView !== 'month') return;
    const grid = document.getElementById('monthGrid');
    grid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Render day headers
    const headerRow = document.createElement('div');
    headerRow.className = 'month-header-row';
    for (let i = 0; i < 7; i++) {
        const div = document.createElement('div');
        div.className = 'month-header';
        div.textContent = new Date(2025, 5, i + 1).toLocaleDateString(undefined, { weekday: 'short' });
        headerRow.appendChild(div);
    }
    grid.appendChild(headerRow);
    // Render days
    let day = 1 - startDay;
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const todayDate = today.getDate();
    
    for (let r = 0; r < 6; r++) {
        const row = document.createElement('div');
        row.className = 'month-row';
        for (let c = 0; c < 7; c++) {
            const cell = document.createElement('div');
            cell.className = 'month-cell';
            if (day > 0 && day <= daysInMonth) {
                cell.textContent = day;
                cell.dataset.date = formatDate(new Date(year, month, day));
                
                // Highlight today
                if (isCurrentMonth && day === todayDate) {
                    cell.classList.add('today');
                }
                
                cell.onclick = () => {
                    currentView = 'day';
                    currentDate = new Date(year, month, day);
                    renderSchedule();
                };
                // Place events
                const events = getScheduleEvents().filter(ev => ev.date === formatDate(new Date(year, month, day)));
                if (events.length) {
                    const badge = document.createElement('span');
                    badge.className = 'event-badge';
                    badge.textContent = events.length;
                    cell.appendChild(badge);
                }
            }
            row.appendChild(cell);
            day++;
        }
        grid.appendChild(row);
    }
}

function renderDayView() {
    dayView().classList.toggle('active', currentView === 'day');
    if (currentView !== 'day') return;
    const header = document.getElementById('dayHeader');
    header.textContent = currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    // Render time labels
    const timeLabels = document.getElementById('dayTimeLabels');
    timeLabels.innerHTML = '';
    for (let h = 7; h <= 22; h++) {
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = `${h}:00`;
        timeLabels.appendChild(label);
    }
    // Render events
    const dayEvents = document.getElementById('dayEvents');
    dayEvents.innerHTML = '';
    const events = getScheduleEvents().filter(ev => ev.date === formatDate(currentDate));
    for (const event of events) {
        const el = createEventElement(event, true);
        dayEvents.appendChild(el);
    }
}

function renderUpcomingEvents() {
    const list = document.getElementById('upcomingEventsList');
    list.innerHTML = '';
    const events = getScheduleEvents()
        .filter(ev => new Date(ev.date) >= getToday())
        .sort((a, b) => new Date(a.date) - new Date(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
        .slice(0, 5);
    for (const event of events) {
        const div = document.createElement('div');
        div.className = 'upcoming-event';
        div.innerHTML = `<strong>${event.title}</strong> <span>${event.date} ${formatTime(event.startTime)}</span>`;
        list.appendChild(div);
    }
}

function createEventElement(event, showDetails = false) {
    const el = document.createElement('div');
    el.className = 'event-item';
    
    // Set a color based on event type
    const eventColors = {
        'class': '#4B0082', // Indigo
        'study': '#33A1FF', // Blue
        'meeting': '#FF5733', // Coral
        'appointment': '#33FF57', // Green
        'social': '#FF33A8', // Pink
        'workout': '#FFD433', // Gold
        'other': '#B833FF'  // Purple
    };
    
    const color = eventColors[event.type] || eventColors.other;
    el.style.borderLeftColor = color;
    
    el.innerHTML = `
        <div class="event-title">${event.title}</div>
        <div class="event-meta">
            <span class="event-type ${event.type}"><i class="fas fa-${eventTypeIcon(event.type)}"></i> ${capitalize(event.type)}</span>
            <span class="event-time">${formatTime(event.startTime)}${event.endTime ? ' - ' + formatTime(event.endTime) : ''}</span>
        </div>
        ${showDetails && event.description ? `<div class="event-desc">${event.description}</div>` : ''}
        ${showDetails && event.location ? `<div class="event-loc"><i class="fas fa-location-dot"></i> ${event.location}</div>` : ''}
        <div class="event-actions">
            <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Add event handlers
    const editBtn = el.querySelector('.edit-btn');
    if (editBtn) {
        editBtn.onclick = (e) => {
            e.stopPropagation();
            openEventModal(event);
        };
    }
    
    const deleteBtn = el.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            openDeleteModal(event.id);
        };
    }
    
    // Make the entire event clickable
    el.addEventListener('click', () => openEventModal(event));
    
    return el;
}

function eventTypeIcon(type) {
    switch(type) {
        case 'class': return 'chalkboard-teacher';
        case 'study': return 'book';
        case 'assignment': return 'clipboard-check';
        case 'exam': return 'graduation-cap';
        case 'meeting': return 'users';
        case 'personal': return 'user';
        default: return 'calendar';
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Event Modal Logic ---
function openEventModal(event = null) {
    editingEventId = event?.id || null;
    eventModal().classList.add('active');
    eventForm().reset();
    if (event) {
        document.getElementById('modalTitle').textContent = 'Edit Event';
        eventForm().title.value = event.title || '';
        eventForm().type.value = event.type || 'class';
        eventForm().date.value = event.date || formatDate(currentDate);
        eventForm().startTime.value = event.startTime || '';
        eventForm().endTime.value = event.endTime || '';
        eventForm().description.value = event.description || '';
        eventForm().location.value = event.location || '';
        eventForm().reminder.checked = !!event.reminder;
    } else {
        document.getElementById('modalTitle').textContent = 'Add Event';
        eventForm().date.value = formatDate(currentDate);
    }
}

function closeEventModal() {
    eventModal().classList.remove('active');
    editingEventId = null;
}

function handleEventFormSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(eventForm()).entries());
    data.reminder = !!eventForm().reminder.checked;
    if (!data.title || !data.date || !data.startTime) return;
    let events = getScheduleEvents();
    if (editingEventId) {
        events = events.map(ev => ev.id === editingEventId ? { ...ev, ...data } : ev);
    } else {
        data.id = generateEventId();
        events.push(data);
    }
    saveScheduleEvents(events);
    closeEventModal();
    renderSchedule();
    renderTaskMarkersOnClock(); // Update task markers after adding/editing an event
}

// --- Delete Modal Logic ---
function openDeleteModal(eventId) {
    deleteModal().classList.add('active');
    deleteModal().dataset.eventId = eventId;
}
function closeDeleteModal() {
    deleteModal().classList.remove('active');
    deleteModal().dataset.eventId = '';
}
function confirmDeleteEvent() {
    const eventId = deleteModal().dataset.eventId;
    let events = getScheduleEvents();
    events = events.filter(ev => ev.id !== eventId);
    saveScheduleEvents(events);
    closeDeleteModal();
    renderSchedule();
    renderTaskMarkersOnClock(); // Update task markers after deleting an event
}

// Clock functionality
function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
    updateTodayItems();
    renderTaskMarkersOnClock();
}

function updateClock() {
    const now = new Date();
    
    // Update digital clock
    const timeDisplay = document.getElementById('currentTime');
    const dateDisplay = document.getElementById('currentDate');
    
    // Format time as HH:MM:SS
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    
    // Format date as Day, Month DD, YYYY
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString(undefined, options);
    
    // Update analog clock hands
    const hourHand = document.getElementById('hourHand');
    const minuteHand = document.getElementById('minuteHand');
    const secondHand = document.getElementById('secondHand');
    
    const hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
    const minuteDeg = now.getMinutes() * 6 + now.getSeconds() * 0.1;
    const secondDeg = now.getSeconds() * 6;
    
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
}

function updateTodayItems() {
    updateTodayEvents();
    updateTodayTasks();
    renderTaskMarkersOnClock(); // Update task markers on clock
    // Update every minute
    setTimeout(updateTodayItems, 60000);
}

function updateTodayEvents() {
    const todayEventsContainer = document.getElementById('todayEvents');
    const todayDate = formatDate(new Date());
    const events = getScheduleEvents().filter(event => event.date === todayDate);
    
    if (events.length === 0) {
        todayEventsContainer.innerHTML = '<div class="no-items">No events scheduled for today</div>';
        return;
    }
    
    // Sort events by time
    events.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    
    todayEventsContainer.innerHTML = '';
    events.forEach(event => {
        const item = document.createElement('div');
        item.className = 'today-item';
        item.innerHTML = `
            <div class="today-item-content">
                <div class="today-item-title">${event.title}</div>
                <div class="today-item-meta">
                    <i class="fas fa-${eventTypeIcon(event.type)}"></i> ${capitalize(event.type)}
                    ${event.location ? ` | <i class="fas fa-location-dot"></i> ${event.location}` : ''}
                </div>
            </div>
            <div class="today-item-time">${formatTime(event.startTime) || 'All day'}</div>
        `;
        item.addEventListener('click', () => openEventModal(event));
        todayEventsContainer.appendChild(item);
    });
}

function updateTodayTasks() {
    const todayTasksContainer = document.getElementById('todayTasks');
    
    // Try to load tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('remiTasks') || '[]');
    const todayDate = formatDate(new Date());
    
    // Filter tasks due today
    const todayTasks = tasks.filter(task => {
        return task.dueDate === todayDate || 
               (task.repeatPattern && isTaskDueToday(task));
    });
    
    if (todayTasks.length === 0) {
        todayTasksContainer.innerHTML = '<div class="no-items">No tasks due today</div>';
        return;
    }
    
    // Sort tasks by priority and completion status
    todayTasks.sort((a, b) => {
        // First by completion
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // Then by priority
        return (b.priority || 0) - (a.priority || 0);
    });
    
    todayTasksContainer.innerHTML = '';
    todayTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'today-item';
        if (task.completed) {
            item.classList.add('completed');
        }
        
        item.innerHTML = `
            <div class="today-item-content">
                <div class="today-item-title">
                    <span class="checkbox ${task.completed ? 'checked' : ''}">
                        <i class="fas ${task.completed ? 'fa-check-square' : 'fa-square'}"></i>
                    </span>
                    ${task.title}
                </div>
                <div class="today-item-meta">
                    ${task.category ? `<i class="fas fa-folder"></i> ${task.category}` : ''}
                    ${task.priority ? ` | Priority: ${getPriorityLabel(task.priority)}` : ''}
                </div>
            </div>
        `;
        
        // Add checkbox click handler
        const checkbox = item.querySelector('.checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTaskCompletion(task);
        });
        
        // Add click handler to navigate to tasks page
        item.addEventListener('click', () => {
            window.location.href = `tasks.html?task=${task.id}`;
        });
        
        todayTasksContainer.appendChild(item);
    });
}

// Helper function to check if a recurring task is due today
function isTaskDueToday(task) {
    if (!task.repeatPattern) return false;
    
    const today = new Date();
    const startDate = new Date(task.startDate || task.dueDate);
    
    switch (task.repeatPattern) {
        case 'daily':
            return true;
            
        case 'weekdays':
            const day = today.getDay();
            return day >= 1 && day <= 5; // Monday to Friday
            
        case 'weekly':
            return getDaysBetween(startDate, today) % 7 === 0;
            
        case 'biweekly':
            return getDaysBetween(startDate, today) % 14 === 0;
            
        case 'monthly':
            return today.getDate() === startDate.getDate();
            
        default:
            return false;
    }
}

function getDaysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    firstDate.setHours(0, 0, 0, 0);
    secondDate.setHours(0, 0, 0, 0);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

function toggleTaskCompletion(task) {
    // Load all tasks
    const tasks = JSON.parse(localStorage.getItem('remiTasks') || '[]');
    
    // Find and update the task
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
        tasks[index].completed = !tasks[index].completed;
        tasks[index].completedDate = tasks[index].completed ? new Date().toISOString() : null;
        
        // Save back to localStorage
        localStorage.setItem('remiTasks', JSON.stringify(tasks));
        
        // Update the UI
        updateTodayTasks();
        renderTaskMarkersOnClock(); // Update task markers when a task is completed
    }
}

function getPriorityLabel(priority) {
    switch (parseInt(priority)) {
        case 3: return 'High';
        case 2: return 'Medium';
        case 1: return 'Low';
        default: return 'None';
    }
}

// Default example events and tasks
function addExampleEventsAndTasks() {
    // Check if events already exist
    let events = getScheduleEvents();
    let tasks = JSON.parse(localStorage.getItem('remiTasks') || '[]');
    
    // Only add examples if no events/tasks exist
    if (events.length === 0) {
        const today = formatDate(new Date());
        
        // Add example events for today
        events = [
            {
                id: 'example-event-1',
                title: 'Math Lecture',
                type: 'class',
                date: today,
                startTime: '09:00',
                endTime: '10:30',
                description: 'Advanced Calculus with Prof. Johnson',
                location: 'Room 302, Science Building',
                reminder: true
            },
            {
                id: 'example-event-2',
                title: 'Study Group',
                type: 'study',
                date: today,
                startTime: '14:00',
                endTime: '16:00',
                description: 'Project preparation with Alex and Sarah',
                location: 'Library, Study Room 5',
                reminder: false
            }
        ];
        
        saveScheduleEvents(events);
    }
    
    // Add example tasks if none exist
    if (tasks.length === 0) {
        tasks = [
            {
                id: 'example-task-1',
                title: 'Physics Assignment',
                completed: false,
                priority: 3,
                category: 'Homework',
                dueDate: today,
                startTime: '11:00',
                endTime: '13:00',
                description: 'Complete problems 1-10 for Chapter 5',
                repeatPattern: null
            },
            {
                id: 'example-task-2',
                title: 'Research Literature Review',
                completed: false,
                priority: 2,
                category: 'Projects',
                dueDate: today,
                startTime: '18:00',
                endTime: '20:00',
                description: 'Find at least 5 sources for the research paper',
                repeatPattern: null
            }
        ];
        
        localStorage.setItem('remiTasks', JSON.stringify(tasks));
    }
    
    renderSchedule();
}

// Listen for profile updates
window.addEventListener('profileUpdated', (event) => {
    renderSchedule();
    updateTodayItems();
});

function renderTaskMarkersOnClock() {
    const taskMarkersContainer = document.getElementById('taskMarkers');
    const clockLegend = document.getElementById('clockLegend');
    
    taskMarkersContainer.innerHTML = '';
    clockLegend.innerHTML = '<div class="legend-header">Today\'s Schedule</div>';
    
    const todayDate = formatDate(new Date());
    
    // Get events for today
    const events = getScheduleEvents().filter(event => event.date === todayDate && event.startTime);
    
    // Get tasks for today
    const tasks = JSON.parse(localStorage.getItem('remiTasks') || '[]')
        .filter(task => task.dueDate === todayDate && task.startTime);
    
    // Define a set of colors for different tasks
    const taskColors = [
        '#FF5733', // Coral red
        '#33A1FF', // Bright blue
        '#FF33A8', // Pink
        '#33FF57', // Green
        '#B833FF', // Purple
        '#FFD433', // Gold
        '#33FFD4', // Teal
        '#FF8333', // Orange
        '#4B0082', // Indigo
        '#2E8B57',  // Sea green
        '#FF4500', // Orange red
        '#1E90FF', // Dodger blue
        '#FF1493', // Deep pink
        '#32CD32', // Lime green
        '#9400D3'  // Dark violet
    ];
    
    // Helper function to calculate position on the clock face
    function getClockPosition(hour, minute) {
        // Convert hour and minute to angle in degrees
        const angleDeg = ((hour % 12) * 30) + ((minute / 60) * 30);
        return angleDeg;
    }
    
    // Add indicators for events
    events.forEach((event, index) => {
        if (event.startTime) {
            const hourParts = event.startTime.split(':');
            const hour = parseInt(hourParts[0]);
            const minute = parseInt(hourParts[1]);
            
            // Get angle for clock
            const angle = getClockPosition(hour, minute);
            
            // Assign a color for this event
            const color = taskColors[index % taskColors.length];
            
            // Create marker
            const marker = document.createElement('div');
            marker.className = 'task-marker';
            
            // Create hour indicator (segment on clock edge)
            const indicator = document.createElement('div');
            indicator.className = 'task-hour-indicator';
            indicator.style.position = 'absolute';
            
            // Position at the edge of the clock
            indicator.style.top = 'calc(50% - 6px)'; // Half of the height
            indicator.style.right = '0';
            indicator.style.transform = `rotate(${angle}deg)`;
            indicator.style.transformOrigin = 'left center';
            indicator.style.boxShadow = `0 0 0 3px ${color}`;
            indicator.title = `${event.title} (${formatTime(event.startTime)})`;
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'task-marker-tooltip';
            tooltip.textContent = `${event.title} (${formatTime(event.startTime)}${event.endTime ? ' - ' + formatTime(event.endTime) : ''})`;
            
            // Position tooltip with the same angle but further out
            const tooltipAngleRad = (angle - 90) * (Math.PI / 180);
            const tooltipRadius = 85; // Slightly outside the clock
            const tooltipX = 50 + (tooltipRadius * Math.cos(tooltipAngleRad));
            const tooltipY = 50 + (tooltipRadius * Math.sin(tooltipAngleRad));
            
            tooltip.style.left = `${tooltipX}%`;
            tooltip.style.top = `${tooltipY}%`;
            
            marker.appendChild(indicator);
            marker.appendChild(tooltip);
            taskMarkersContainer.appendChild(marker);
            
            // Add to legend
            addToLegend(event.title, color, 'Event');
        }
    });
    
    // Add indicators for tasks with different colors
    tasks.forEach((task, index) => {
        if (task.startTime) {
            const hourParts = task.startTime.split(':');
            const hour = parseInt(hourParts[0]);
            const minute = parseInt(hourParts[1]);
            
            // Get angle for clock
            const angle = getClockPosition(hour, minute);
            
            // Assign a color for this task
            const color = taskColors[(index + events.length) % taskColors.length];
            
            // Create marker
            const marker = document.createElement('div');
            marker.className = 'task-marker';
            
            // Create hour indicator (segment on clock edge)
            const indicator = document.createElement('div');
            indicator.className = 'task-hour-indicator';
            indicator.style.position = 'absolute';
            
            // Position at the edge of the clock
            indicator.style.top = 'calc(50% - 6px)'; // Half of the height
            indicator.style.right = '0';
            indicator.style.transform = `rotate(${angle}deg)`;
            indicator.style.transformOrigin = 'left center';
            indicator.style.boxShadow = `0 0 0 3px ${color}`;
            indicator.title = `${task.title} (${formatTime(task.startTime)})`;
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'task-marker-tooltip';
            tooltip.textContent = `${task.title} (${formatTime(task.startTime)}${task.endTime ? ' - ' + formatTime(task.endTime) : ''})`;
            
            // Position tooltip with the same angle but further out
            const tooltipAngleRad = (angle - 90) * (Math.PI / 180);
            const tooltipRadius = 85; // Slightly outside the clock
            const tooltipX = 50 + (tooltipRadius * Math.cos(tooltipAngleRad));
            const tooltipY = 50 + (tooltipRadius * Math.sin(tooltipAngleRad));
            
            tooltip.style.left = `${tooltipX}%`;
            tooltip.style.top = `${tooltipY}%`;
            
            marker.appendChild(indicator);
            marker.appendChild(tooltip);
            taskMarkersContainer.appendChild(marker);
            
            // Add to legend
            addToLegend(task.title, color, 'Task');
        }
    });
    
    // Helper function to add an item to the legend
    function addToLegend(title, color, type) {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorIndicator = document.createElement('span');
        colorIndicator.className = 'legend-color';
        colorIndicator.style.boxShadow = `0 0 0 3px ${color}`;
        
        const label = document.createElement('span');
        label.textContent = title;
        
        const typeLabel = document.createElement('small');
        typeLabel.textContent = type;
        typeLabel.style.marginLeft = '4px';
        typeLabel.style.opacity = '0.7';
        
        legendItem.appendChild(colorIndicator);
        legendItem.appendChild(label);
        legendItem.appendChild(typeLabel);
        clockLegend.appendChild(legendItem);
    }
    
    // Add a "No items" message if no events or tasks
    if (events.length === 0 && tasks.length === 0) {
        clockLegend.innerHTML = '<div class="no-items">No events or tasks today</div>';
    }
}
