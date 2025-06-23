document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.task-complete-checkbox');
    console.log(checkboxes);
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            if (this.checked) {
                taskItem.classList.add('completed');
            } else {
                taskItem.classList.remove('completed');
            }
        });
    });
});



const advancedToggleButton = document.querySelector('.advanced-toggle-button');
const advancedOptions = document.querySelector('.advanced-options');

advancedToggleButton.addEventListener('click', ()=>{
    advancedOptions.classList.toggle('visible');
});

const task_name = document.getElementById('task-name');
const task_description = document.getElementById('task-description');
const task_due_date = document.getElementById('task-date');
const task_priority = document.getElementById('task-priority');
const task_duration = document.getElementById('task-duration');
const task_time = document.getElementById('task-time');
const task_repeatable = document.getElementById('task-repeatable-days');
const task_repeatable_days = document.querySelector('repeat-days');
const task_location = document.getElementById('task-location');
const task_milistone = document.getElementById('milestone-select');
const task_notes = document.getElementById('task-notes');
const task_tags = document.getElementById('task-tags');
const task_color = document.getElementById('task-color');
const task_effort = document.getElementById('task-effort');
const task_submit = document.getElementById('task-submit');

const subtasksContainer = document.getElementById('subtask-container');

