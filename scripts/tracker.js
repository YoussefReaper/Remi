// Enhanced Task Tracker with Pomodoro, Stopwatch, and Analytics
class TaskTracker {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = null;
        this.timerInterval = null;
        this.mode = 'stopwatch'; // stopwatch, pomodoro, custom
        this.sessions = [];
        this.tasks = [];
        this.stats = {
            totalTime: 0,
            sessionsCompleted: 0,
            streak: 0,
            focusScore: 95
        };
        
        // Pomodoro settings
        this.pomodoroSettings = {
            workDuration: 25 * 60, // 25 minutes in seconds
            shortBreak: 5 * 60,    // 5 minutes in seconds
            longBreak: 15 * 60,    // 15 minutes in seconds
            sessionsUntilLongBreak: 4
        };
        
        this.currentPhase = 'work'; // work, shortBreak, longBreak
        this.pomodoroCount = 0;
        
        // Enhanced features
        this.focusGoals = {
            daily: 2 * 60 * 60, // 2 hours daily goal
            weekly: 14 * 60 * 60, // 14 hours weekly goal
            streak: 0
        };
        
        this.sessionTemplates = [
            { name: 'Deep Work', duration: 90, mode: 'custom', icon: '🧠' },
            { name: 'Quick Focus', duration: 25, mode: 'pomodoro', icon: '⚡' },
            { name: 'Study Sprint', duration: 45, mode: 'custom', icon: '📚' },
            { name: 'Creative Flow', duration: 120, mode: 'stopwatch', icon: '🎨' },
            { name: 'Review Session', duration: 30, mode: 'custom', icon: '📝' }
        ];
        
        this.notifications = {
            enabled: true,
            sound: true,
            breakReminders: true,
            goalReminders: true
        };
        
        this.keyboardShortcuts = {
            'Space': 'toggleTimer',
            'KeyS': 'stopTimer',
            'KeyP': 'pauseTimer',
            'KeyQ': 'quickStart',
            'KeyN': 'addNote'
        };

        this.insights = {
            lastAnalysis: null,
            suggestions: [],
            productivity: {
                bestHours: [],
                bestDays: [],
                averageFocus: 0
            }
        };
        
        this.breakReminders = {
            enabled: true,
            interval: 60 * 60, // 1 hour
            lastReminder: null
        };
        
        this.currentSessionNotes = '';
        this.autoStartBreaks = false;
        this.smartBreakSuggestions = true;
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
        this.loadTasks();
        this.generateWeeklyChart();
        this.updateGoalProgress();
        this.generateProductivityInsights();
    }
    
    setupEventListeners() {
        // Mode selection
        document.querySelectorAll('input[name="timerMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.mode = e.target.value;
                this.updateModeUI();
            });
        });
        
        // Custom duration toggle
        document.getElementById('customMinutes')?.addEventListener('input', () => {
            this.updateCustomDuration();
        });
        
        // Control buttons
        document.getElementById('playPauseBtn')?.addEventListener('click', () => {
            this.toggleTimer();
        });
        
        document.getElementById('stopBtn')?.addEventListener('click', () => {
            this.stopTimer();
        });
        
        document.getElementById('skipBtn')?.addEventListener('click', () => {
            this.skipBreak();
        });
        
        // Enhanced event listeners
        this.setupKeyboardShortcuts();
        this.setupBreakReminders();
        this.setupSessionTemplates();
        this.setupFocusGoals();
        
        // Session notes
        document.getElementById('addNoteBtn')?.addEventListener('click', () => {
            this.toggleSessionNotes();
        });
        
        document.getElementById('sessionNotesTextarea')?.addEventListener('input', (e) => {
            this.currentSessionNotes = e.target.value;
        });
        
        // Quick actions
        document.getElementById('quickStartBtn')?.addEventListener('click', () => {
            this.quickStart();
        });
        
        document.getElementById('smartBreakBtn')?.addEventListener('click', () => {
            this.suggestSmartBreak();
        });
        
        // Settings
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });
        
        // Auto-start breaks toggle
        document.getElementById('autoStartBreaks')?.addEventListener('change', (e) => {
            this.autoStartBreaks = e.target.checked;
            this.saveSettings();
        });
        
        // Break reminder toggle
        document.getElementById('breakRemindersToggle')?.addEventListener('change', (e) => {
            this.breakReminders.enabled = e.target.checked;
            this.saveSettings();
        });
        
        // Goal settings
        document.getElementById('dailyGoalSlider')?.addEventListener('input', (e) => {
            this.focusGoals.daily = parseInt(e.target.value) * 60 * 60;
            this.updateGoalDisplay();
            this.saveSettings();
        });
        
        document.getElementById('weeklyGoalSlider')?.addEventListener('input', (e) => {
            this.focusGoals.weekly = parseInt(e.target.value) * 60 * 60;
            this.updateGoalDisplay();
            this.saveSettings();
        });
        
        // Task selection
        document.getElementById('taskSelector')?.addEventListener('change', (e) => {
            this.selectTask(e.target.value);
        });
        
        document.getElementById('refreshTasksBtn')?.addEventListener('click', () => {
            this.loadTasks();
        });
        
        // Modal controls
        document.getElementById('closeSessionModal')?.addEventListener('click', () => {
            this.closeSessionModal();
        });
        
        document.getElementById('continueBtn')?.addEventListener('click', () => {
            this.continueSession();
        });
        
        document.getElementById('takeBreakBtn')?.addEventListener('click', () => {
            this.takeBreak();
        });
        
        // View all sessions
        document.getElementById('viewAllSessionsBtn')?.addEventListener('click', () => {
            this.viewAllSessions();
        });
    }
    
    loadData() {
        // Load sessions from localStorage
        const savedSessions = localStorage.getItem('trackerSessions');
        if (savedSessions) {
            this.sessions = JSON.parse(savedSessions);
        }
        
        // Load stats
        const savedStats = localStorage.getItem('trackerStats');
        if (savedStats) {
            this.stats = { ...this.stats, ...JSON.parse(savedStats) };
        }
        
        // Calculate today's time
        this.calculateTodayStats();
    }
    
    saveData() {
        localStorage.setItem('trackerSessions', JSON.stringify(this.sessions));
        localStorage.setItem('trackerStats', JSON.stringify(this.stats));
    }
    
    loadTasks() {
        // Load tasks from tasks.js localStorage
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        this.updateTaskSelector();
    }
    
    updateTaskSelector() {
        const selector = document.getElementById('taskSelector');
        if (!selector) return;
        
        // Clear existing options except the first one
        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }
        
        // Add tasks
        this.tasks.forEach(task => {
            if (!task.completed) {
                const option = document.createElement('option');
                option.value = task.id;
                option.textContent = task.name;
                selector.appendChild(option);
            }
        });
        
        // Add quick options
        const quickOptions = [
            { id: 'study', name: '📚 General Study Session' },
            { id: 'reading', name: '📖 Reading Session' },
            { id: 'homework', name: '✏️ Homework Time' },
            { id: 'project', name: '🚀 Project Work' },
            { id: 'break', name: '☕ Focus Break' }
        ];
        
        quickOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            optionElement.textContent = option.name;
            selector.appendChild(optionElement);
        });
    }
    
    selectTask(taskId) {
        const taskDetails = document.getElementById('taskDetails');
        if (!taskId) {
            taskDetails.style.display = 'none';
            return;
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.updateTaskDetails(task);
            taskDetails.style.display = 'block';
        } else {
            // Handle quick options
            const quickTask = this.getQuickTaskDetails(taskId);
            this.updateTaskDetails(quickTask);
            taskDetails.style.display = 'block';
        }
    }
    
    getQuickTaskDetails(taskId) {
        const quickTasks = {
            'study': { name: 'General Study Session', duration: '60', priority: 'Medium' },
            'reading': { name: 'Reading Session', duration: '45', priority: 'Low' },
            'homework': { name: 'Homework Time', duration: '90', priority: 'High' },
            'project': { name: 'Project Work', duration: '120', priority: 'High' },
            'break': { name: 'Focus Break', duration: '15', priority: 'Low' }
        };
        
        return quickTasks[taskId] || { name: 'Custom Task', duration: '30', priority: 'Medium' };
    }
    
    updateTaskDetails(task) {
        document.getElementById('taskDuration').textContent = `${task.duration} min`;
        document.getElementById('taskPriority').textContent = task.priority;
        
        // Calculate progress if it's a real task
        let progress = 0;
        if (task.id) {
            const taskSessions = this.sessions.filter(s => s.taskId === task.id);
            const totalTracked = taskSessions.reduce((sum, s) => sum + s.duration, 0);
            const expectedDuration = parseInt(task.duration) * 60; // Convert to seconds
            progress = Math.min((totalTracked / expectedDuration) * 100, 100);
        }
        
        document.getElementById('taskProgressFill').style.width = `${progress}%`;
        document.getElementById('taskProgressText').textContent = 
            progress > 0 ? `${Math.round(progress)}% completed` : 'Not started';
    }
    
    updateModeUI() {
        const customDuration = document.getElementById('customDuration');
        if (customDuration) {
            customDuration.style.display = this.mode === 'custom' ? 'block' : 'none';
        }
    }
    
    updateCustomDuration() {
        // Update UI when custom duration changes
    }
    
    toggleTimer() {
        if (!this.isRunning) {
            this.startTimer();
        } else if (this.isPaused) {
            this.resumeTimer();
        } else {
            this.pauseTimer();
        }
    }
    
    startTimer() {
        const taskSelector = document.getElementById('taskSelector');
        const selectedTask = taskSelector?.value;
        
        if (!selectedTask) {
            this.showNotification('Please select a task to track', 'warning');
            return;
        }
        
        // Create new session
        this.currentSession = {
            id: this.generateSessionId(),
            taskId: selectedTask,
            startTime: new Date(),
            mode: this.mode,
            elapsedTime: 0,
            isActive: true
        };
        
        // Set duration based on mode
        this.setSessionDuration();
        
        // Switch to active session view
        this.showActiveSession();
        
        // Start the timer
        this.isRunning = true;
        this.isPaused = false;
        this.startTimerInterval();
        
        this.updateControlButtons();
        this.updateSessionInfo();
    }
    
    setSessionDuration() {
        switch (this.mode) {
            case 'pomodoro':
                this.currentSession.duration = this.pomodoroSettings.workDuration;
                this.currentPhase = 'work';
                break;
            case 'custom':
                const customMinutes = document.getElementById('customMinutes')?.value || 25;
                this.currentSession.duration = parseInt(customMinutes) * 60;
                break;
            case 'stopwatch':
            default:
                this.currentSession.duration = null; // Unlimited
                break;
        }
    }
    
    startTimerInterval() {
        this.timerInterval = setInterval(() => {
            this.currentSession.elapsedTime++;
            this.updateTimerDisplay();
            this.updateProgress();
            
            // Check if session is complete (for timed modes)
            if (this.currentSession.duration && 
                this.currentSession.elapsedTime >= this.currentSession.duration) {
                this.completePhase();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isPaused = true;
        clearInterval(this.timerInterval);
        this.updateControlButtons();
        this.updateTimerPhase('Paused');
    }
    
    resumeTimer() {
        this.isPaused = false;
        this.startTimerInterval();
        this.updateControlButtons();
        this.updateTimerPhase();
    }
    
    stopTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        
        if (this.currentSession) {
            this.saveSession();
        }
        
        this.hideActiveSession();
        this.resetTimer();
    }
    
    completePhase() {
        clearInterval(this.timerInterval);
        
        if (this.mode === 'pomodoro') {
            this.handlePomodoroPhaseComplete();
        } else {
            this.completeSession();
        }
    }
    
    handlePomodoroPhaseComplete() {
        if (this.currentPhase === 'work') {
            this.pomodoroCount++;
            this.saveSession();
            
            // Determine break type
            if (this.pomodoroCount % this.pomodoroSettings.sessionsUntilLongBreak === 0) {
                this.startBreak('long');
            } else {
                this.startBreak('short');
            }
        } else {
            // Break complete, start new work session
            this.startWorkSession();
        }
    }
    
    startBreak(type) {
        this.currentPhase = type === 'long' ? 'longBreak' : 'shortBreak';
        this.currentSession.duration = type === 'long' ? 
            this.pomodoroSettings.longBreak : 
            this.pomodoroSettings.shortBreak;
        this.currentSession.elapsedTime = 0;
        
        this.updateTimerPhase(`${type === 'long' ? 'Long' : 'Short'} Break`);
        this.showSkipButton(true);
        this.startTimerInterval();
    }
    
    startWorkSession() {
        this.currentPhase = 'work';
        this.currentSession.duration = this.pomodoroSettings.workDuration;
        this.currentSession.elapsedTime = 0;
        
        this.updateTimerPhase('Focus Time');
        this.showSkipButton(false);
        this.startTimerInterval();
    }
    
    skipBreak() {
        if (this.currentPhase !== 'work') {
            clearInterval(this.timerInterval);
            this.startWorkSession();
        }
    }
    
    completeSession() {
        this.saveSession();
        this.showSessionCompleteModal();
        this.updateStats();
        this.hideActiveSession();
        this.resetTimer();
    }
    
    saveSession() {
        if (!this.currentSession) return;
        
        const sessionData = {
            ...this.currentSession,
            endTime: new Date(),
            completed: true,
            notes: this.currentSessionNotes || ''
        };
        
        this.sessions.push(sessionData);
        this.saveData();
        this.updateRecentSessions();
        this.calculateTodayStats();
        this.updateGoalProgress();
        this.checkGoalAchievements();
        
        // Clear session notes for next session
        this.currentSessionNotes = '';
        const notesTextarea = document.getElementById('sessionNotesTextarea');
        if (notesTextarea) notesTextarea.value = '';
    }
    
    showActiveSession() {
        document.getElementById('trackerDashboard').style.display = 'none';
        document.getElementById('activeSessionPanel').style.display = 'block';
    }
    
    hideActiveSession() {
        document.getElementById('trackerDashboard').style.display = 'block';
        document.getElementById('activeSessionPanel').style.display = 'none';
    }
    
    updateTimerDisplay() {
        const elapsed = this.currentSession.elapsedTime;
        const display = document.getElementById('timerDisplay');
        
        if (this.mode === 'stopwatch') {
            display.textContent = this.formatTime(elapsed);
        } else {
            const remaining = Math.max(0, this.currentSession.duration - elapsed);
            display.textContent = this.formatTime(remaining);
        }
    }
    
    updateProgress() {
        if (this.mode === 'stopwatch') return;
        
        const elapsed = this.currentSession.elapsedTime;
        const total = this.currentSession.duration;
        const progress = (elapsed / total) * 100;
        
        // Update circular progress
        const circle = document.getElementById('progressCircle');
        const circumference = 2 * Math.PI * 130; // radius = 130
        const offset = circumference - (progress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        
        // Update progress stats
        document.getElementById('elapsedTime').textContent = this.formatTime(elapsed);
        document.getElementById('remainingTime').textContent = this.formatTime(total - elapsed);
        document.getElementById('completionPercent').textContent = `${Math.round(progress)}%`;
    }
    
    updateControlButtons() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const playPauseIcon = playPauseBtn?.querySelector('i');
        const playPauseText = playPauseBtn?.querySelector('span');
        
        if (this.isRunning && !this.isPaused) {
            playPauseIcon?.setAttribute('class', 'fas fa-pause');
            if (playPauseText) playPauseText.textContent = 'Pause';
            playPauseBtn?.classList.add('active');
        } else {
            playPauseIcon?.setAttribute('class', 'fas fa-play');
            if (playPauseText) playPauseText.textContent = this.isPaused ? 'Resume' : 'Start';
            playPauseBtn?.classList.remove('active');
        }
    }
    
    updateSessionInfo() {
        const taskSelector = document.getElementById('taskSelector');
        const selectedOption = taskSelector?.options[taskSelector.selectedIndex];
        
        if (selectedOption) {
            document.getElementById('activeSessionTitle').textContent = 'Active Session';
            document.getElementById('activeSessionTask').textContent = selectedOption.textContent;
        }
        
        const modeBadge = document.getElementById('sessionModeBadge');
        if (modeBadge) {
            modeBadge.textContent = this.mode.charAt(0).toUpperCase() + this.mode.slice(1);
        }
    }
    
    showSkipButton(show = false) {
        const skipBtn = document.getElementById('skipBreakBtn');
        if (skipBtn) {
            skipBtn.style.display = show ? 'block' : 'none';
        }
    }
    
    updateTimerPhase(phase = null) {
        const phaseElement = document.getElementById('timerPhase');
        if (!phaseElement) return;
        
        if (phase) {
            phaseElement.textContent = phase;
            return;
        }
        
        if (this.mode === 'pomodoro') {
            switch (this.currentPhase) {
                case 'work':
                    phaseElement.textContent = 'Focus Time';
                    break;
                case 'shortBreak':
                    phaseElement.textContent = 'Short Break';
                    break;
                case 'longBreak':
                    phaseElement.textContent = 'Long Break';
                    break;
            }
        } else if (this.mode === 'custom') {
            phaseElement.textContent = 'Custom Session';
        } else {
            phaseElement.textContent = 'Stopwatch Mode';
        }
    }
    
    showSkipButton(show) {
        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
            skipBtn.style.display = show ? 'flex' : 'none';
        }
    }
    
    resetTimer() {
        this.currentSession = null;
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        
        // Reset UI
        document.getElementById('timerDisplay').textContent = '00:00:00';
        document.getElementById('timerPhase').textContent = 'Ready to Start';
        document.getElementById('elapsedTime').textContent = '0:00';
        document.getElementById('remainingTime').textContent = '--:--';
        document.getElementById('completionPercent').textContent = '0%';
        
        // Reset progress circle
        const circle = document.getElementById('progressCircle');
        if (circle) {
            circle.style.strokeDashoffset = 2 * Math.PI * 130; // Full circle
        }
        
        this.updateControlButtons();
        this.showSkipButton(false);
    }
    
    startQuickTracking() {
        // Set to stopwatch mode and start with first available task
        document.querySelector('input[value="stopwatch"]').checked = true;
        this.mode = 'stopwatch';
        
        const taskSelector = document.getElementById('taskSelector');
        if (taskSelector && taskSelector.children.length > 1) {
            taskSelector.selectedIndex = 1; // Select first task
            this.selectTask(taskSelector.value);
        }
        
        this.startTimer();
    }
    
    startQuickPomodoro() {
        // Set to pomodoro mode and start
        document.querySelector('input[value="pomodoro"]').checked = true;
        this.mode = 'pomodoro';
        
        const taskSelector = document.getElementById('taskSelector');
        if (taskSelector && taskSelector.children.length > 1) {
            taskSelector.selectedIndex = 1; // Select first task
            this.selectTask(taskSelector.value);
        }
        
        this.startTimer();
    }
    
    showSessionCompleteModal() {
        const modal = document.getElementById('sessionCompleteModal');
        if (modal) {
            // Update modal content
            const duration = this.formatTime(this.currentSession.elapsedTime);
            const taskName = document.getElementById('activeSessionTask').textContent;
            const mode = this.mode.charAt(0).toUpperCase() + this.mode.slice(1);
            
            document.getElementById('sessionDuration').textContent = duration;
            document.getElementById('sessionTask').textContent = taskName;
            document.getElementById('sessionMode').textContent = mode;
            
            modal.classList.add('active');
        }
    }
    
    closeSessionModal() {
        const modal = document.getElementById('sessionCompleteModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    continueSession() {
        this.closeSessionModal();
        // Start a new session with the same task
        setTimeout(() => this.startTimer(), 500);
    }
    
    takeBreak() {
        this.closeSessionModal();
        this.showNotification('Great work! Take a well-deserved break. 🌟', 'success');
    }
    
    calculateTodayStats() {
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => {
            return new Date(session.startTime).toDateString() === today;
        });
        
        const totalSeconds = todaySessions.reduce((sum, session) => sum + session.elapsedTime, 0);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        document.getElementById('totalTrackedTime').textContent = `${hours}h ${minutes}m`;
        document.getElementById('sessionsCompleted').textContent = todaySessions.length;
        
        // Update daily progress
        const dailyGoal = 4 * 3600; // 4 hours in seconds
        const progress = Math.min((totalSeconds / dailyGoal) * 100, 100);
        
        document.getElementById('dailyProgressPercentage').textContent = `${Math.round(progress)}%`;
        document.getElementById('dailyTracked').textContent = `${hours}h ${minutes}m`;
        
        const remainingSeconds = Math.max(0, dailyGoal - totalSeconds);
        const remainingHours = Math.floor(remainingSeconds / 3600);
        const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
        document.getElementById('dailyRemaining').textContent = `${remainingHours}h ${remainingMinutes}m`;
        
        // Update progress circle
        const circle = document.getElementById('dailyProgressCircle');
        if (circle) {
            const circumference = 2 * Math.PI * 40; // radius = 40
            const offset = circumference - (progress / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }
    
    updateRecentSessions() {
        const sessionsList = document.getElementById('recentSessionsList');
        if (!sessionsList) return;
        
        const recentSessions = this.sessions.slice(-5).reverse();
        
        if (recentSessions.length === 0) {
            sessionsList.innerHTML = `
                <div class="empty-sessions">
                    <i class="fas fa-clock"></i>
                    <p>No sessions yet today</p>
                    <span>Start tracking to see your sessions here</span>
                </div>
            `;
            return;
        }
        
        sessionsList.innerHTML = recentSessions.map(session => {
            const taskName = this.getTaskName(session.taskId);
            const duration = this.formatTime(session.elapsedTime);
            const timeAgo = this.getTimeAgo(session.endTime);
            
            return `
                <div class="session-item">
                    <div class="session-info">
                        <h4>${taskName}</h4>
                        <p>${timeAgo}</p>
                    </div>
                    <div class="session-duration">${duration}</div>
                </div>
            `;
        }).join('');
    }
    
    getTaskName(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) return task.name;
        
        const quickTask = this.getQuickTaskDetails(taskId);
        return quickTask.name;
    }
    
    generateWeeklyChart() {
        const chartContainer = document.getElementById('weeklyChart');
        if (!chartContainer) return;
        
        const today = new Date();
        const weekData = [];
        
        // Generate data for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const daySessions = this.sessions.filter(session => {
                return new Date(session.startTime).toDateString() === dateStr;
            });
            
            const totalTime = daySessions.reduce((sum, session) => sum + session.elapsedTime, 0);
            weekData.push(totalTime);
        }
        
        const maxTime = Math.max(...weekData, 3600); // At least 1 hour for scale
        
        chartContainer.innerHTML = weekData.map(time => {
            const height = (time / maxTime) * 100;
            return `<div class="chart-bar" style="height: ${height}%" title="${this.formatTime(time)}"></div>`;
        }).join('');
        
        // Update weekly summary
        const weeklyTotal = weekData.reduce((sum, time) => sum + time, 0);
        const dailyAverage = weeklyTotal / 7;
        
        document.getElementById('weeklyTotal').textContent = this.formatTime(weeklyTotal);
        document.getElementById('dailyAverage').textContent = this.formatTime(dailyAverage);
    }
    
    updateStats() {
        this.stats.sessionsCompleted++;
        this.stats.totalTime += this.currentSession.elapsedTime;
        this.saveData();
        
        // Update UI
        document.getElementById('sessionsCompleted').textContent = this.stats.sessionsCompleted;
        document.getElementById('streakDays').textContent = this.stats.streak;
        document.getElementById('focusScore').textContent = `${this.stats.focusScore}%`;
    }
    
    viewDetailedStats() {
        this.showDetailedStatsModal();
    }
    
    viewAllSessions() {
        this.showSessionHistoryModal();
    }
    
    // Enhanced Modal Functions
    showSessionCompleteModal() {
        const modal = document.getElementById('sessionCompleteModal');
        const duration = this.currentSession.elapsedTime;
        const coinsEarned = Math.floor(duration / 60) * 2; // 2 coins per minute
        const xpEarned = Math.floor(duration / 60) * 5; // 5 XP per minute
        
        // Update rewards
        document.getElementById('coinsEarned').textContent = `+${coinsEarned} coins`;
        document.getElementById('xpEarned').textContent = `+${xpEarned} XP`;
        
        // Motivational messages
        const messages = [
            "Excellent focus! You're building great habits! 🌟",
            "Outstanding dedication! Keep up the momentum! 🚀",
            "Fantastic work! You're becoming more productive! 💪",
            "Great session! Your consistency is impressive! 🎯",
            "Well done! Every minute counts towards your goals! ⭐"
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('completionMessage').textContent = message;
        
        modal.style.display = 'block';
        
        // Update user stats (if available)
        this.updateUserRewards(coinsEarned, xpEarned);
    }
    
    closeSessionModal() {
        document.getElementById('sessionCompleteModal').style.display = 'none';
    }
    
    continueSession() {
        this.closeSessionModal();
        // Start a new session with the same task
        setTimeout(() => this.startTimer(), 500);
    }
    
    takeBreak() {
        this.closeSessionModal();
        this.showNotification('Great work! Take a well-deserved break. 🌟', 'success');
    }
    
    // Enhanced functionality methods
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const action = this.keyboardShortcuts[e.code];
            if (action) {
                e.preventDefault();
                this[action]?.();
            }
        });
    }
    
    setupBreakReminders() {
        setInterval(() => {
            if (this.breakReminders.enabled && this.isRunning && !this.isPaused) {
                const now = Date.now();
                const sessionDuration = this.currentSession?.elapsedTime || 0;
                
                if (sessionDuration > 0 && sessionDuration % this.breakReminders.interval === 0) {
                    this.showBreakReminder();
                }
            }
        }, 1000);
    }
    
    setupSessionTemplates() {
        const container = document.getElementById('sessionTemplates');
        if (!container) return;
        
        container.innerHTML = this.sessionTemplates.map(template => `
            <button class="template-btn" onclick="taskTracker.useTemplate('${template.name}')">
                <span class="template-icon">${template.icon}</span>
                <span class="template-name">${template.name}</span>
                <span class="template-duration">${template.duration}m</span>
            </button>
        `).join('');
    }
    
    setupFocusGoals() {
        this.updateGoalProgress();
        this.checkGoalAchievements();
    }
    
    useTemplate(templateName) {
        const template = this.sessionTemplates.find(t => t.name === templateName);
        if (!template) return;
        
        // Set mode and duration
        this.mode = template.mode;
        document.querySelector(`input[value="${template.mode}"]`).checked = true;
        
        if (template.mode === 'custom') {
            document.getElementById('customMinutes').value = template.duration;
        }
        
        this.updateModeUI();
        this.showNotification(`${template.icon} ${template.name} template loaded!`, 'success');
    }
    
    quickStart() {
        // Start with last used settings or default 25-minute session
        if (!this.isRunning) {
            const taskSelector = document.getElementById('taskSelector');
            if (!taskSelector.value) {
                taskSelector.value = 'study'; // Default to general study
            }
            this.startTimer();
        } else {
            this.toggleTimer();
        }
    }
    
    toggleSessionNotes() {
        const notesPanel = document.getElementById('sessionNotesPanel');
        const addNoteBtn = document.getElementById('addNoteBtn');
        
        if (notesPanel.style.display === 'block') {
            notesPanel.style.display = 'none';
            addNoteBtn.innerHTML = '<i class="fas fa-sticky-note"></i> Add Note';
        } else {
            notesPanel.style.display = 'block';
            addNoteBtn.innerHTML = '<i class="fas fa-times"></i> Close Notes';
            document.getElementById('sessionNotesTextarea').focus();
        }
    }
    
    showBreakReminder() {
        if (!this.notifications.enabled) return;
        
        const reminder = document.createElement('div');
        reminder.className = 'break-reminder';
        reminder.innerHTML = `
            <div class="reminder-content">
                <i class="fas fa-coffee"></i>
                <h4>Time for a break!</h4>
                <p>You've been focusing for ${Math.floor(this.currentSession.elapsedTime / 60)} minutes.</p>
                <div class="reminder-actions">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">Continue</button>
                    <button onclick="taskTracker.takeBreak(); this.parentElement.parentElement.parentElement.remove()">Take Break</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(reminder);
        
        // Play notification sound if enabled
        if (this.notifications.sound) {
            this.playNotificationSound();
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (reminder.parentNode) reminder.remove();
        }, 10000);
    }
    
    takeBreak() {
        this.pauseTimer();
        this.showNotification('Break time! Come back refreshed! ☕', 'info');
    }
    
    suggestSmartBreak() {
        const suggestions = this.generateBreakSuggestions();
        this.showBreakSuggestionsModal(suggestions);
    }
    
    generateBreakSuggestions() {
        const sessionTime = this.currentSession?.elapsedTime || 0;
        const currentHour = new Date().getHours();
        
        const suggestions = [];
        
        if (sessionTime > 3600) { // Over 1 hour
            suggestions.push({
                type: 'stretch',
                title: '🧘 Stretch & Move',
                description: 'Take a 10-minute movement break to refresh your body',
                duration: 10
            });
        }
        
        if (currentHour >= 12 && currentHour <= 14) {
            suggestions.push({
                type: 'meal',
                title: '🍽️ Lunch Break',
                description: 'Perfect time for a nourishing meal break',
                duration: 30
            });
        }
        
        if (sessionTime > 1800) { // Over 30 minutes
            suggestions.push({
                type: 'hydrate',
                title: '💧 Hydration Break',
                description: 'Get some water and rest your eyes for 5 minutes',
                duration: 5
            });
        }
        
        suggestions.push({
            type: 'walk',
            title: '🚶 Fresh Air Walk',
            description: 'A short walk outside to clear your mind',
            duration: 15
        });
        
        return suggestions;
    }
    
    showBreakSuggestionsModal(suggestions) {
        const modal = document.createElement('div');
        modal.className = 'modal break-suggestions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-lightbulb"></i> Smart Break Suggestions</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="break-suggestions">
                        ${suggestions.map(suggestion => `
                            <div class="suggestion-card" onclick="taskTracker.startBreak('${suggestion.type}', ${suggestion.duration})">
                                <h4>${suggestion.title}</h4>
                                <p>${suggestion.description}</p>
                                <span class="suggestion-duration">${suggestion.duration} minutes</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
    
    startBreak(type, duration) {
        this.pauseTimer();
        
        // Close suggestion modal
        document.querySelector('.break-suggestions-modal')?.remove();
        
        // Start break timer
        this.showBreakTimer(type, duration);
        this.showNotification(`Starting ${duration}-minute break`, 'info');
    }
    
    showBreakTimer(type, duration) {
        const breakTimer = document.createElement('div');
        breakTimer.className = 'break-timer-overlay';
        breakTimer.innerHTML = `
            <div class="break-timer-content">
                <h3>Break Time</h3>
                <div class="break-timer-display">${duration}:00</div>
                <p>Enjoy your break! Timer will notify you when it's time to return.</p>
                <button class="btn btn-secondary" onclick="taskTracker.endBreakEarly()">End Break Early</button>
            </div>
        `;
        
        document.body.appendChild(breakTimer);
        
        // Start break countdown
        let remaining = duration * 60;
        const breakInterval = setInterval(() => {
            remaining--;
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            
            const display = breakTimer.querySelector('.break-timer-display');
            if (display) {
                display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (remaining <= 0) {
                clearInterval(breakInterval);
                this.endBreak();
            }
        }, 1000);
        
        breakTimer.dataset.intervalId = breakInterval;
    }
    
    endBreakEarly() {
        const breakTimer = document.querySelector('.break-timer-overlay');
        if (breakTimer) {
            clearInterval(parseInt(breakTimer.dataset.intervalId));
            breakTimer.remove();
        }
        this.showNotification('Break ended. Ready to focus again! 💪', 'success');
    }
    
    endBreak() {
        const breakTimer = document.querySelector('.break-timer-overlay');
        if (breakTimer) breakTimer.remove();
        
        this.showNotification('Break complete! Time to get back to work! 🚀', 'success');
        this.playNotificationSound();
    }
    
    updateGoalProgress() {
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => 
            new Date(session.startTime).toDateString() === today
        );
        
        const todayTime = todaySessions.reduce((sum, session) => sum + session.elapsedTime, 0);
        const dailyProgress = (todayTime / this.focusGoals.daily) * 100;
        
        // Update daily goal display
        const dailyProgressBar = document.getElementById('dailyGoalProgress');
        const dailyProgressText = document.getElementById('dailyGoalText');
        
        if (dailyProgressBar) {
            dailyProgressBar.style.width = `${Math.min(dailyProgress, 100)}%`;
        }
        
        if (dailyProgressText) {
            const remaining = Math.max(0, this.focusGoals.daily - todayTime);
            dailyProgressText.textContent = remaining > 0 
                ? `${this.formatTime(remaining)} remaining`
                : 'Goal achieved! 🎉';
        }
        
        // Weekly goal
        const weekStart = this.getWeekStart();
        const weekSessions = this.sessions.filter(session => 
            new Date(session.startTime) >= weekStart
        );
        
        const weekTime = weekSessions.reduce((sum, session) => sum + session.elapsedTime, 0);
        const weeklyProgress = (weekTime / this.focusGoals.weekly) * 100;
        
        const weeklyProgressBar = document.getElementById('weeklyGoalProgress');
        const weeklyProgressText = document.getElementById('weeklyGoalText');
        
        if (weeklyProgressBar) {
            weeklyProgressBar.style.width = `${Math.min(weeklyProgress, 100)}%`;
        }
        
        if (weeklyProgressText) {
            const remaining = Math.max(0, this.focusGoals.weekly - weekTime);
            weeklyProgressText.textContent = remaining > 0 
                ? `${this.formatTime(remaining)} remaining`
                : 'Weekly goal achieved! 🏆';
        }
    }
    
    checkGoalAchievements() {
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => 
            new Date(session.startTime).toDateString() === today
        );
        
        const todayTime = todaySessions.reduce((sum, session) => sum + session.elapsedTime, 0);
        
        if (todayTime >= this.focusGoals.daily && !localStorage.getItem(`goalAchieved_${today}`)) {
            localStorage.setItem(`goalAchieved_${today}`, 'true');
            this.showGoalAchievement('daily');
        }
    }
    
    showGoalAchievement(type) {
        const achievement = document.createElement('div');
        achievement.className = 'goal-achievement';
        achievement.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">🎯</div>
                <h3>${type === 'daily' ? 'Daily' : 'Weekly'} Goal Achieved!</h3>
                <p>Congratulations! You've reached your ${type} focus goal!</p>
                <div class="achievement-rewards">
                    <span><i class="fas fa-coins"></i> +50 coins</span>
                    <span><i class="fas fa-star"></i> +100 XP</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(achievement);
        
        setTimeout(() => {
            if (achievement.parentNode) achievement.remove();
        }, 5000);
        
        this.playNotificationSound();
    }
    
    generateProductivityInsights() {
        if (this.sessions.length < 5) return; // Need at least 5 sessions for insights
        
        const insights = {
            bestHours: this.findBestProductiveHours(),
            bestDays: this.findBestProductiveDays(),
            averageSessionLength: this.calculateAverageSessionLength(),
            focusPatterns: this.analyzeFocusPatterns(),
            suggestions: []
        };
        
        // Generate suggestions based on patterns
        if (insights.bestHours.length > 0) {
            insights.suggestions.push({
                type: 'timing',
                title: 'Optimize Your Schedule',
                description: `You're most productive between ${insights.bestHours[0]}:00-${insights.bestHours[0] + 1}:00. Try scheduling important tasks during this time.`
            });
        }
        
        if (insights.averageSessionLength < 1800) // Less than 30 minutes
        {
            insights.suggestions.push({
                type: 'duration',
                title: 'Extend Your Sessions',
                description: 'Consider longer focus sessions (45-90 minutes) for deeper work and better flow states.'
            });
        }
        
        this.insights = insights;
        this.insights.lastAnalysis = new Date();
        this.saveData();
    }
    
    findBestProductiveHours() {
        const hourlyData = new Array(24).fill(0);
        const hourlyCount = new Array(24).fill(0);
        
        this.sessions.forEach(session => {
            const hour = new Date(session.startTime).getHours();
            hourlyData[hour] += session.elapsedTime;
            hourlyCount[hour]++;
        });
        
        // Calculate average session length per hour
        const averageByHour = hourlyData.map((total, hour) => ({
            hour,
            average: hourlyCount[hour] > 0 ? total / hourlyCount[hour] : 0
        }));
        
        return averageByHour
            .sort((a, b) => b.average - a.average)
            .slice(0, 3)
            .map(item => item.hour);
    }
    
    findBestProductiveDays() {
        const dayData = new Array(7).fill(0);
        const dayCount = new Array(7).fill(0);
        
        this.sessions.forEach(session => {
            const day = new Date(session.startTime).getDay();
            dayData[day] += session.elapsedTime;
            dayCount[day]++;
        });
        
        const averageByDay = dayData.map((total, day) => ({
            day,
            average: dayCount[day] > 0 ? total / dayCount[day] : 0
        }));
        
        return averageByDay
            .sort((a, b) => b.average - a.average)
            .slice(0, 3)
            .map(item => item.day);
    }
    
    calculateAverageSessionLength() {
        if (this.sessions.length === 0) return 0;
        const totalTime = this.sessions.reduce((sum, session) => sum + session.elapsedTime, 0);
        return totalTime / this.sessions.length;
    }
    
    analyzeFocusPatterns() {
        const patterns = {
            shortSessions: this.sessions.filter(s => s.elapsedTime < 1800).length,
            mediumSessions: this.sessions.filter(s => s.elapsedTime >= 1800 && s.elapsedTime < 3600).length,
            longSessions: this.sessions.filter(s => s.elapsedTime >= 3600).length
        };
        
        return patterns;
    }
    
    showProductivityInsights() {
        this.generateProductivityInsights();
        
        const modal = document.createElement('div');
        modal.className = 'modal insights-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3><i class="fas fa-brain"></i> Productivity Insights</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="insights-grid">
                        <div class="insight-card">
                            <h4>🕐 Best Hours</h4>
                            <p>Most productive: ${this.insights.bestHours.map(h => `${h}:00`).join(', ')}</p>
                        </div>
                        <div class="insight-card">
                            <h4>📅 Best Days</h4>
                            <p>Top days: ${this.insights.bestDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}</p>
                        </div>
                        <div class="insight-card">
                            <h4>⏱️ Average Session</h4>
                            <p>${this.formatTime(this.insights.averageSessionLength)}</p>
                        </div>
                    </div>
                    <div class="suggestions-section">
                        <h4>💡 Personalized Suggestions</h4>
                        ${this.insights.suggestions.map(suggestion => `
                            <div class="suggestion-item">
                                <h5>${suggestion.title}</h5>
                                <p>${suggestion.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
    
    playNotificationSound() {
        if (!this.notifications.sound) return;
        
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    getWeekStart() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    }
    
    updateGoalDisplay() {
        const dailyHours = this.focusGoals.daily / 3600;
        const weeklyHours = this.focusGoals.weekly / 3600;
        
        document.getElementById('dailyGoalDisplay').textContent = `${dailyHours}h`;
        document.getElementById('weeklyGoalDisplay').textContent = `${weeklyHours}h`;
    }
    
    saveSettings() {
        const settings = {
            focusGoals: this.focusGoals,
            notifications: this.notifications,
            breakReminders: this.breakReminders,
            autoStartBreaks: this.autoStartBreaks,
            smartBreakSuggestions: this.smartBreakSuggestions
        };
        
        localStorage.setItem('trackerSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('trackerSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.focusGoals = { ...this.focusGoals, ...settings.focusGoals };
            this.notifications = { ...this.notifications, ...settings.notifications };
            this.breakReminders = { ...this.breakReminders, ...settings.breakReminders };
            this.autoStartBreaks = settings.autoStartBreaks || false;
            this.smartBreakSuggestions = settings.smartBreakSuggestions !== false;
        }
    }
    
    showSettings() {
        const modal = document.createElement('div');
        modal.className = 'modal settings-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> Tracker Settings</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="settings-section">
                        <h4>🎯 Focus Goals</h4>
                        <div class="setting-item">
                            <label>Daily Goal: <span id="dailyGoalDisplay">${this.focusGoals.daily / 3600}h</span></label>
                            <input type="range" id="dailyGoalSlider" min="1" max="8" value="${this.focusGoals.daily / 3600}">
                        </div>
                        <div class="setting-item">
                            <label>Weekly Goal: <span id="weeklyGoalDisplay">${this.focusGoals.weekly / 3600}h</span></label>
                            <input type="range" id="weeklyGoalSlider" min="5" max="50" value="${this.focusGoals.weekly / 3600}">
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h4>🔔 Notifications</h4>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="breakRemindersToggle" ${this.breakReminders.enabled ? 'checked' : ''}>
                                Break Reminders
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="autoStartBreaks" ${this.autoStartBreaks ? 'checked' : ''}>
                                Auto-start Breaks
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h4>⚡ Quick Actions</h4>
                        <div class="keyboard-shortcuts">
                            <div class="shortcut-item">
                                <kbd>Space</kbd> Toggle Timer
                            </div>
                            <div class="shortcut-item">
                                <kbd>S</kbd> Stop Timer
                            </div>
                            <div class="shortcut-item">
                                <kbd>Q</kbd> Quick Start
                            </div>
                            <div class="shortcut-item">
                                <kbd>N</kbd> Add Note
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Save Settings
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Re-setup event listeners for settings
        this.setupSettingsListeners(modal);
    }
    
    setupSettingsListeners(modal) {
        const dailySlider = modal.querySelector('#dailyGoalSlider');
        const weeklySlider = modal.querySelector('#weeklyGoalSlider');
        const breakToggle = modal.querySelector('#breakRemindersToggle');
        const autoStartToggle = modal.querySelector('#autoStartBreaks');
        
        dailySlider?.addEventListener('input', (e) => {
            this.focusGoals.daily = parseInt(e.target.value) * 3600;
            modal.querySelector('#dailyGoalDisplay').textContent = `${e.target.value}h`;
            this.saveSettings();
        });
        
        weeklySlider?.addEventListener('input', (e) => {
            this.focusGoals.weekly = parseInt(e.target.value) * 3600;
            modal.querySelector('#weeklyGoalDisplay').textContent = `${e.target.value}h`;
            this.saveSettings();
        });
        
        breakToggle?.addEventListener('change', (e) => {
            this.breakReminders.enabled = e.target.checked;
            this.saveSettings();
        });
        
        autoStartToggle?.addEventListener('change', (e) => {
            this.autoStartBreaks = e.target.checked;
            this.saveSettings();
        });
    }
    
    showDetailedStatsModal() {
        const modal = document.getElementById('detailedStatsModal');
        this.updateDetailedStats();
        modal.style.display = 'block';
    }
    
    closeDetailedStats() {
        document.getElementById('detailedStatsModal').style.display = 'none';
    }
    
    showSessionHistoryModal() {
        const modal = document.getElementById('sessionHistoryModal');
        this.updateSessionHistory();
        modal.style.display = 'block';
    }
    
    closeSessionHistory() {
        document.getElementById('sessionHistoryModal').style.display = 'none';
    }
    
    switchStatsTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.stats-tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`statsTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
        
        // Load tab-specific data
        switch(tab) {
            case 'overview':
                this.updateOverviewTab();
                break;
            case 'productivity':
                this.updateProductivityTab();
                break;
            case 'patterns':
                this.updatePatternsTab();
                break;
        }
    }
    
    updateDetailedStats() {
        this.updateOverviewTab();
        this.updateProductivityTab();
        this.updatePatternsTab();
    }
    
    updateOverviewTab() {
        const totalSessions = this.sessions.length;
        const totalTime = this.sessions.reduce((sum, session) => sum + session.elapsedTime, 0);
        const averageSession = totalSessions > 0 ? totalTime / totalSessions : 0;
        
        const totalSessionsEl = document.getElementById('totalSessionsDetailed');
        const totalTimeEl = document.getElementById('totalTimeDetailed');
        const averageSessionEl = document.getElementById('averageSessionDetailed');
        const bestStreakEl = document.getElementById('bestStreakDetailed');
        
        if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
        if (totalTimeEl) totalTimeEl.textContent = this.formatTime(totalTime);
        if (averageSessionEl) averageSessionEl.textContent = this.formatTime(averageSession);
        if (bestStreakEl) bestStreakEl.textContent = `${this.stats.bestStreak || this.stats.streak} days`;
        
        this.generateMonthlyChart();
    }
    
    updateProductivityTab() {
        const completedTasks = this.sessions.filter(s => s.completed).length;
        const totalSessions = this.sessions.length;
        const completionRate = totalSessions > 0 ? (completedTasks / totalSessions) * 100 : 0;
        
        const completionRateEl = document.getElementById('completionRate');
        if (completionRateEl) completionRateEl.textContent = `${Math.round(completionRate)}%`;
        
        // Session duration analysis
        const shortSessions = this.sessions.filter(s => s.elapsedTime < 1800).length;
        const mediumSessions = this.sessions.filter(s => s.elapsedTime >= 1800 && s.elapsedTime < 3600).length;
        const longSessions = this.sessions.filter(s => s.elapsedTime >= 3600).length;
        
        const total = shortSessions + mediumSessions + longSessions;
        if (total > 0) {
            const shortBar = document.getElementById('shortSessionBar');
            const mediumBar = document.getElementById('mediumSessionBar');
            const longBar = document.getElementById('longSessionBar');
            
            if (shortBar) shortBar.style.width = `${(shortSessions / total) * 100}%`;
            if (mediumBar) mediumBar.style.width = `${(mediumSessions / total) * 100}%`;
            if (longBar) longBar.style.width = `${(longSessions / total) * 100}%`;
        }
    }
    
    updatePatternsTab() {
        this.generateHourlyHeatmap();
        this.generateWeekdayChart();
    }
    
    generateMonthlyChart() {
        const chartContainer = document.getElementById('monthlyChart');
        if (!chartContainer) return;
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const dailyData = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            const daySessions = this.sessions.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate >= dayStart && sessionDate <= dayEnd;
            });
            
            const totalTime = daySessions.reduce((sum, session) => sum + session.elapsedTime, 0);
            dailyData.push(totalTime);
        }
        
        const maxTime = Math.max(...dailyData, 3600);
        
        chartContainer.innerHTML = dailyData.map((time, index) => {
            const height = (time / maxTime) * 100;
            const date = new Date(thirtyDaysAgo.getTime() + index * 24 * 60 * 60 * 1000);
            return `<div class="month-bar" style="height: ${height}%" 
                         title="${date.toLocaleDateString()}: ${this.formatTime(time)}"></div>`;
        }).join('');
    }
    
    generateHourlyHeatmap() {
        const heatmapContainer = document.getElementById('hourlyHeatmap');
        if (!heatmapContainer) return;
        
        const hourlyData = new Array(24).fill(0);
        
        this.sessions.forEach(session => {
            const hour = new Date(session.startTime).getHours();
            hourlyData[hour] += session.elapsedTime;
        });
        
        const maxTime = Math.max(...hourlyData, 1);
        
        heatmapContainer.innerHTML = hourlyData.map((time, hour) => {
            const intensity = time / maxTime;
            const opacity = Math.max(0.1, intensity);
            const color = `rgba(139, 69, 245, ${opacity})`;
            
            return `<div class="heatmap-cell" 
                         style="background-color: ${color}" 
                         title="${hour}:00 - ${this.formatTime(time)}"></div>`;
        }).join('');
    }
    
    generateWeekdayChart() {
        const chartContainer = document.getElementById('weekdayChart');
        if (!chartContainer) return;
        
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdayData = new Array(7).fill(0);
        
        this.sessions.forEach(session => {
            const weekday = new Date(session.startTime).getDay();
            weekdayData[weekday] += session.elapsedTime;
        });
        
        const maxTime = Math.max(...weekdayData, 1);
        
        chartContainer.innerHTML = weekdayData.map((time, index) => {
            const height = (time / maxTime) * 100;
            return `
                <div class="weekday-bar">
                    <div class="weekday-bar-fill" style="height: ${height}px" 
                         title="${this.formatTime(time)}"></div>
                    <div class="weekday-label">${weekdays[index]}</div>
                </div>
            `;
        }).join('');
    }
    
    updateSessionHistory() {
        this.filterHistory();
    }
    
    filterHistory() {
        const filterEl = document.getElementById('historyFilter');
        const searchEl = document.getElementById('historySearch');
        
        if (!filterEl || !searchEl) return;
        
        const filter = filterEl.value;
        const searchTerm = searchEl.value.toLowerCase();
        
        let filteredSessions = this.sessions.slice().reverse(); // Most recent first
        
        // Apply date filter
        const now = new Date();
        switch (filter) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                filteredSessions = filteredSessions.filter(session => 
                    new Date(session.startTime) >= today);
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredSessions = filteredSessions.filter(session => 
                    new Date(session.startTime) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredSessions = filteredSessions.filter(session => 
                    new Date(session.startTime) >= monthAgo);
                break;
        }
        
        // Apply search filter
        if (searchTerm) {
            filteredSessions = filteredSessions.filter(session => {
                const taskName = this.getTaskName(session.taskId).toLowerCase();
                return taskName.includes(searchTerm);
            });
        }
        
        this.displaySessionHistory(filteredSessions);
        this.updateHistorySummary(filteredSessions);
    }
    
    searchHistory() {
        this.filterHistory();
    }
    
    displaySessionHistory(sessions) {
        const container = document.getElementById('sessionHistoryList');
        if (!container) return;
        
        if (sessions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--ai-text-color); opacity: 0.6;">
                    <i class="fas fa-clock" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>No sessions found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = sessions.map(session => {
            const taskName = this.getTaskName(session.taskId);
            const startTime = new Date(session.startTime);
            const dateStr = startTime.toLocaleDateString();
            const timeStr = startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            return `
                <div class="history-session">
                    <div class="session-info">
                        <div class="session-task">${taskName}</div>
                        <div class="session-details">
                            ${dateStr} at ${timeStr} • ${session.mode} mode
                        </div>
                    </div>
                    <div class="session-duration">${this.formatTime(session.elapsedTime)}</div>
                </div>
            `;
        }).join('');
    }
    
    updateHistorySummary(sessions) {
        const totalTime = sessions.reduce((sum, session) => sum + session.elapsedTime, 0);
        
        const filteredCountEl = document.getElementById('filteredCount');
        const filteredTimeEl = document.getElementById('filteredTime');
        
        if (filteredCountEl) filteredCountEl.textContent = sessions.length;
        if (filteredTimeEl) filteredTimeEl.textContent = this.formatTime(totalTime);
    }
    
    exportData() {
        const data = {
            sessions: this.sessions,
            stats: this.stats,
            exportDate: new Date().toISOString(),
            version: '3.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `remi-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully! 📊', 'success');
    }
    
    clearAllSessions() {
        if (confirm('Are you sure you want to clear all session history? This action cannot be undone.')) {
            this.sessions = [];
            this.stats = {
                sessionsCompleted: 0,
                totalTime: 0,
                streak: 0,
                bestStreak: 0,
                focusScore: 100
            };
            this.saveData();
            this.updateUI();
            this.closeSessionHistory();
            this.showNotification('Session history cleared', 'info');
        }
    }
    
    updateUserRewards(coins, xp) {
        // This would integrate with the main user system
        // For now, we'll just store it locally
        const currentCoins = parseInt(localStorage.getItem('userCoins') || '0');
        const currentXP = parseInt(localStorage.getItem('userXP') || '0');
        
        localStorage.setItem('userCoins', (currentCoins + coins).toString());
        localStorage.setItem('userXP', (currentXP + xp).toString());
        
        // Trigger achievement check if available
        if (window.checkAchievements) {
            window.checkAchievements('session_complete', {
                duration: this.currentSession.elapsedTime,
                sessionsToday: this.sessions.filter(s => {
                    const today = new Date().toDateString();
                    return new Date(s.startTime).toDateString() === today;
                }).length
            });
        }
    }

    // ...existing code...
    
    // Utility functions
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    getTimeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.1));
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 16px;
                    color: var(--ai-text-color);
                    box-shadow: var(--shadow-medium);
                    z-index: 1000;
                    max-width: 350px;
                    animation: slideInRight 0.3s ease;
                }
                .notification-success { border-left: 4px solid var(--success-color); }
                .notification-warning { border-left: 4px solid var(--warning-color); }
                .notification-error { border-left: 4px solid var(--error-color); }
                .notification-info { border-left: 4px solid var(--accent-primary); }
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--ai-text-color);
                    cursor: pointer;
                    opacity: 0.7;
                }
                .notification-close:hover { opacity: 1; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    updateUI() {
        this.updateRecentSessions();
        this.calculateTodayStats();
        this.generateWeeklyChart();
        this.updateGoalProgress();
        this.generateProductivityInsights();
        
        // Update quick insights if elements exist
        if (document.getElementById('peakHoursDisplay')) {
            this.updateQuickInsightsDisplay();
        }
        
        // Update smart suggestions
        if (document.getElementById('smartSuggestions')) {
            this.updateSmartSuggestionsDisplay();
        }
    }
    
    updateQuickInsightsDisplay() {
        // Update peak hours display
        const peakHoursEl = document.getElementById('peakHoursDisplay');
        if (peakHoursEl && this.insights?.bestHours?.length > 0) {
            const bestHours = this.insights.bestHours.slice(0, 2).map(h => `${h}:00`).join(', ');
            peakHoursEl.textContent = bestHours || 'Analyzing...';
        }
        
        // Update focus trend
        const focusTrendEl = document.getElementById('focusTrendDisplay');
        if (focusTrendEl && this.sessions.length > 0) {
            focusTrendEl.textContent = '→ Stable';
        }
        
        // Update success rate
        const successRateEl = document.getElementById('successRateDisplay');
        if (successRateEl) {
            const completedSessions = this.sessions.filter(s => s.completed !== false).length;
            const totalSessions = this.sessions.length;
            const successRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100;
            successRateEl.textContent = `${successRate}%`;
        }
    }
    
    updateSmartSuggestionsDisplay() {
        const suggestionsContainer = document.getElementById('smartSuggestions');
        if (!suggestionsContainer) return;
        
        const suggestions = [
            {
                icon: 'fas fa-clock',
                text: 'Try extending your focus sessions to 25-45 minutes for better deep work'
            },
            {
                icon: 'fas fa-coffee',
                text: 'Take a 5-minute movement break every hour for better focus'
            }
        ];
        
        // Display suggestions
        suggestionsContainer.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-tip">
                <i class="${suggestion.icon}"></i>
                <span>${suggestion.text}</span>
            </div>
        `).join('');
    }
}

// Initialize tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskTracker = new TaskTracker();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskTracker;
}