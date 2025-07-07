// Global Statistics Manager for Dynamic Numbers Across All Pages
class GlobalStatsManager {
    constructor() {
        this.tasks = [];
        this.lastUpdateTime = null;
        this.studyStartDate = this.getStudyStartDate();
        this.levelSystem = {
            baseXP: 100,
            multiplier: 1.5,
            currentLevel: 1,
            currentXP: 0
        };
        
        this.init();
    }

    init() {
        this.loadTasks();
        this.calculateAllStats();
        this.setupEventListeners();
        
        // Update stats every 5 minutes
        setInterval(() => {
            this.calculateAllStats();
            this.updateAllElements();
        }, 5 * 60 * 1000);
    }

    getStudyStartDate() {
        let startDate = localStorage.getItem('studyStartDate');
        if (!startDate) {
            startDate = new Date().toISOString();
            localStorage.setItem('studyStartDate', startDate);
        }
        return new Date(startDate);
    }

    loadTasks() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.lastUpdateTime = new Date();
    }

    setupEventListeners() {
        // Listen for task updates from any page
        window.addEventListener('taskUpdated', (event) => {
            this.loadTasks();
            this.calculateAllStats();
            this.updateAllElements();
            
            // Dispatch a global stats update event
            this.dispatchStatsUpdateEvent();
        });

        // Listen for storage changes from other tabs
        window.addEventListener('storage', (event) => {
            if (event.key === 'tasks') {
                this.loadTasks();
                this.calculateAllStats();
                this.updateAllElements();
                
                // Dispatch a global stats update event
                this.dispatchStatsUpdateEvent();
            }
        });
        
        // Listen for page load events
        document.addEventListener('DOMContentLoaded', () => {
            this.calculateAllStats();
            this.updateAllElements();
        });
    }

    // Core calculation methods
    calculateTaskStats() {
        const now = new Date();
        
        const stats = {
            total: this.tasks.length,
            completed: 0,
            pending: 0,
            late: 0,
            dueToday: 0,
            dueTomorrow: 0,
            completedToday: 0,
            completedThisWeek: 0,
            completedThisMonth: 0
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        this.tasks.forEach(task => {
            // Basic completion status
            if (task.completed) {
                stats.completed++;
                
                // Completion time analysis
                if (task.completedAt) {
                    const completedDate = new Date(task.completedAt);
                    completedDate.setHours(0, 0, 0, 0);
                    
                    if (completedDate.getTime() === today.getTime()) {
                        stats.completedToday++;
                    }
                    if (completedDate >= weekStart) {
                        stats.completedThisWeek++;
                    }
                    if (completedDate >= monthStart) {
                        stats.completedThisMonth++;
                    }
                }
            } else {
                stats.pending++;
                
                // Due date analysis for pending tasks
                if (task.date && task.time) {
                    const taskDate = new Date(`${task.date} ${task.time}`);
                    const taskDateOnly = new Date(task.date);
                    taskDateOnly.setHours(0, 0, 0, 0);
                    
                    // Check if task is late
                    if (taskDate < now) {
                        stats.late++;
                    }
                    
                    // Check due dates
                    if (taskDateOnly.getTime() === today.getTime()) {
                        stats.dueToday++;
                    } else if (taskDateOnly.getTime() === tomorrow.getTime()) {
                        stats.dueTomorrow++;
                    }
                }
            }
        });

        return stats;
    }

    calculateStreakDays() {
        if (this.tasks.length === 0) return 0;

        const completedTasks = this.tasks.filter(task => task.completed && task.completedAt);
        if (completedTasks.length === 0) return 0;

        // Sort by completion date
        completedTasks.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const completionDates = new Set();
        completedTasks.forEach(task => {
            const date = new Date(task.completedAt);
            date.setHours(0, 0, 0, 0);
            completionDates.add(date.getTime());
        });

        const sortedDates = Array.from(completionDates).sort((a, b) => b - a);

        for (let dateTime of sortedDates) {
            const date = new Date(dateTime);
            if (date.getTime() === currentDate.getTime()) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (date.getTime() < currentDate.getTime() - 86400000) {
                // Gap found, streak broken
                break;
            }
        }

        return streak;
    }

    calculateProductivityScore() {
        const taskStats = this.calculateTaskStats();
        const streak = this.calculateStreakDays();
        
        let score = 0;
        
        // Base score from completion rate
        if (taskStats.total > 0) {
            score += (taskStats.completed / taskStats.total) * 40;
        }
        
        // Bonus for streak
        score += Math.min(streak * 2, 30);
        
        // Penalty for late tasks
        if (taskStats.late > 0) {
            score -= Math.min(taskStats.late * 5, 20);
        }
        
        // Bonus for recent activity
        score += Math.min(taskStats.completedThisWeek * 2, 20);
        
        // Bonus for consistency
        if (taskStats.completedToday > 0) score += 10;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    calculateLevel() {
        let xp = 0;
        
        // XP from completed tasks
        this.tasks.forEach(task => {
            if (task.completed) {
                let taskXP = 10; // Base XP
                
                // Bonus based on priority
                if (task.priority === '1') taskXP += 15; // High priority
                else if (task.priority === '2') taskXP += 10; // Medium priority
                else taskXP += 5; // Low priority
                
                // Bonus based on effort
                const effort = parseInt(task.effort) || 1;
                taskXP += effort * 2;
                
                // Bonus for completing on time
                if (task.completedAt && task.date && task.time) {
                    const completedDate = new Date(task.completedAt);
                    const dueDate = new Date(`${task.date} ${task.time}`);
                    if (completedDate <= dueDate) {
                        taskXP += 5; // On-time bonus
                    }
                }
                
                xp += taskXP;
            }
        });
        
        // Calculate level from XP
        let level = 1;
        let requiredXP = this.levelSystem.baseXP;
        let totalXPNeeded = 0;
        
        while (xp >= totalXPNeeded + requiredXP) {
            totalXPNeeded += requiredXP;
            level++;
            requiredXP = Math.floor(requiredXP * this.levelSystem.multiplier);
        }
        
        const currentLevelXP = xp - totalXPNeeded;
        const nextLevelXP = requiredXP;
        
        return {
            level,
            currentXP: currentLevelXP,
            nextLevelXP,
            totalXP: xp,
            progress: Math.round((currentLevelXP / nextLevelXP) * 100)
        };
    }

    calculateRelationshipProgress() {
        const taskStats = this.calculateTaskStats();
        const streak = this.calculateStreakDays();
        const level = this.calculateLevel();
        
        // Base relationship points
        let relationshipPoints = 0;
        
        // Points from completed tasks
        relationshipPoints += taskStats.completed * 2;
        
        // Bonus from streak
        relationshipPoints += streak * 5;
        
        // Bonus from level
        relationshipPoints += level.level * 3;
        
        // Recent activity bonus
        relationshipPoints += taskStats.completedThisWeek * 1;
        
        // Calculate percentage (0-100%)
        const maxPoints = 500; // Max relationship points
        const percentage = Math.min(100, Math.round((relationshipPoints / maxPoints) * 100));
        
        // Determine relationship status
        let status = 'Stranger';
        if (percentage >= 80) status = 'Best Friend';
        else if (percentage >= 60) status = 'Close Friend';
        else if (percentage >= 40) status = 'Friend';
        else if (percentage >= 20) status = 'Acquaintance';
        
        return {
            percentage,
            status,
            points: relationshipPoints
        };
    }

    calculateAllStats() {
        this.stats = {
            tasks: this.calculateTaskStats(),
            streak: this.calculateStreakDays(),
            productivity: this.calculateProductivityScore(),
            level: this.calculateLevel(),
            relationship: this.calculateRelationshipProgress(),
            studyDays: Math.floor((new Date() - this.studyStartDate) / (1000 * 60 * 60 * 24)) + 1
        };
        
        return this.stats;
    }

    // Update methods for different elements
    updateAllElements() {
        this.updateTasksCompleted();
        this.updateCurrentLevel();
        this.updateRelationshipStatus();
        this.updateProductivityScore();
        this.updateStreakDays();
        this.updateLateTasks();
        this.updatePendingTasks();
        this.updateDueTasks();
    }

    updateTasksCompleted() {
        const elements = document.querySelectorAll('#tasksCompleted, .tasks-completed, [data-stat="tasks-completed"]');
        elements.forEach(el => {
            if (el) el.textContent = this.stats.tasks.completed;
        });
    }

    updateCurrentLevel() {
        const elements = document.querySelectorAll('#currentLevel, .current-level, [data-stat="current-level"]');
        elements.forEach(el => {
            if (el) el.textContent = this.stats.level.level;
        });
    }

    updateRelationshipStatus() {
        const statusElements = document.querySelectorAll('.relationship-level, [data-stat="relationship-status"]');
        statusElements.forEach(el => {
            if (el) el.textContent = this.stats.relationship.status;
        });
        
        const percentageElements = document.querySelectorAll('.relationship-percentage, [data-stat="relationship-percentage"]');
        percentageElements.forEach(el => {
            if (el) el.textContent = `${this.stats.relationship.percentage}%`;
        });
        
        const progressElements = document.querySelectorAll('.relationship-progress, [data-stat="relationship-progress"]');
        progressElements.forEach(el => {
            if (el) el.textContent = `${this.stats.relationship.percentage}% - ${this.getRelationshipMessage()}`;
        });
        
        // Update meter fill
        const meterElements = document.querySelectorAll('.meter-fill');
        meterElements.forEach(el => {
            if (el) el.style.width = `${this.stats.relationship.percentage}%`;
        });
    }

    updateProductivityScore() {
        const elements = document.querySelectorAll('#productivityScore, .productivity-score, [data-stat="productivity-score"]');
        elements.forEach(el => {
            if (el) el.textContent = `${this.stats.productivity}%`;
        });
    }

    updateStreakDays() {
        const elements = document.querySelectorAll('#streakDays, .streak-days, [data-stat="streak-days"]');
        elements.forEach(el => {
            if (el) el.textContent = this.stats.streak;
        });
    }

    updateLateTasks() {
        const elements = document.querySelectorAll('#lateTasks, .late-tasks, [data-stat="late-tasks"]');
        elements.forEach(el => {
            if (el) el.textContent = this.stats.tasks.late;
        });
    }

    updatePendingTasks() {
        const elements = document.querySelectorAll('#pendingTasks, .pending-tasks, [data-stat="pending-tasks"]');
        elements.forEach(el => {
            if (el) el.textContent = this.stats.tasks.pending;
        });
    }

    updateDueTasks() {
        const dueTodayElements = document.querySelectorAll('#dueToday, .due-today, [data-stat="due-today"]');
        dueTodayElements.forEach(el => {
            if (el) el.textContent = this.stats.tasks.dueToday;
        });
        
        const dueTomorrowElements = document.querySelectorAll('#dueTomorrow, .due-tomorrow, [data-stat="due-tomorrow"]');
        dueTomorrowElements.forEach(el => {
            if (el) el.textContent = this.stats.tasks.dueTomorrow;
        });
    }

    getRelationshipMessage() {
        const percentage = this.stats.relationship.percentage;
        if (percentage >= 90) return "Amazing bond!";
        if (percentage >= 80) return "Growing stronger!";
        if (percentage >= 60) return "Good progress!";
        if (percentage >= 40) return "Building trust!";
        if (percentage >= 20) return "Getting to know each other!";
        return "Just getting started!";
    }

    // Event dispatching for cross-page updates
    dispatchStatsUpdateEvent() {
        const event = new CustomEvent('statsUpdated', {
            detail: {
                stats: this.stats
            }
        });
        window.dispatchEvent(event);
    }

    // Force refresh all stats
    forceRefresh() {
        this.loadTasks();
        this.calculateAllStats();
        this.updateAllElements();
        this.dispatchStatsUpdateEvent();
    }

    // Public methods for external use
    getStats() {
        return this.stats;
    }

    getTasksByStatus() {
        return {
            completed: this.tasks.filter(task => task.completed),
            pending: this.tasks.filter(task => !task.completed),
            late: this.tasks.filter(task => {
                if (task.completed) return false;
                if (!task.date || !task.time) return false;
                const taskDate = new Date(`${task.date} ${task.time}`);
                return taskDate < new Date();
            })
        };
    }

    markTaskCompleted(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.completed = true;
            task.completedAt = new Date().toISOString();
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.calculateAllStats();
            this.updateAllElements();
        }
    }
}

// Initialize global stats manager
window.globalStatsManager = new GlobalStatsManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalStatsManager;
}
