class TaskManager {
    constructor() {
        this.tasks = [];
    }

    validateTask(task) {
        return task && task.name && task.type;
    }

    createTask(task) {
        if (!this.validateTask(task)) return false;
        this.tasks.push(task);
        return true;
    }

    renderTasks() {
        // Implement task rendering logic
        console.log('Tasks updated:', this.tasks);
    }

    renderStats() {
        // Implement stats rendering logic
        console.log('Stats updated');
    }
}
