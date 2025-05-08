class ScheduleManager {
    constructor() {
        this.activities = this.loadActivities();
        document.addEventListener('DOMContentLoaded', () => {
            this.setupForm();
            this.updateSchedule();
            this.setupClockHands();
            // Update every second
            setInterval(() => this.updateClockHands(), 1000);
            setInterval(() => this.updateSchedule(), 60000);
        });
    }

    setupForm() {
        const form = document.getElementById('activity-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.editingId) {
                this.saveEditActivity();
            } else {
                this.addActivity();
            }
        });
        this.editingId = null;
    }

    addActivity() {
        const name = document.getElementById('activity-name').value;
        const startTime = document.getElementById('activity-start').value;
        const duration = parseInt(document.getElementById('activity-duration').value);
        const days = Array.from(document.querySelectorAll('.days-select input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
        if (!name || !startTime || !duration || days.length === 0) return;

        const activity = {
            id: Date.now(),
            name,
            startTime,
            duration,
            days,
            color: this.generateRandomColor()
        };

        this.activities.push(activity);
        this.saveActivities();
        this.updateSchedule();
        document.getElementById('activity-form').reset();
    }

    editActivity(id) {
        const activity = this.activities.find(a => a.id === id);
        if (!activity) return;
        document.getElementById('activity-name').value = activity.name;
        document.getElementById('activity-start').value = activity.startTime;
        document.getElementById('activity-duration').value = activity.duration;
        document.querySelectorAll('.days-select input[type="checkbox"]').forEach(cb => {
            cb.checked = activity.days.includes(parseInt(cb.value));
        });
        this.editingId = id;
        document.querySelector('#activity-form button[type="submit"]').textContent = "Save Changes";
    }

    saveEditActivity() {
        const id = this.editingId;
        const name = document.getElementById('activity-name').value;
        const startTime = document.getElementById('activity-start').value;
        const duration = parseInt(document.getElementById('activity-duration').value);
        const days = Array.from(document.querySelectorAll('.days-select input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
        if (!name || !startTime || !duration || days.length === 0) return;
        const idx = this.activities.findIndex(a => a.id === id);
        if (idx === -1) return;
        this.activities[idx] = {
            ...this.activities[idx],
            name,
            startTime,
            duration,
            days
        };
        this.saveActivities();
        this.editingId = null;
        document.getElementById('activity-form').reset();
        document.querySelector('#activity-form button[type="submit"]').textContent = "Add Activity";
        this.updateSchedule();
    }

    deleteActivity(id) {
        this.activities = this.activities.filter(a => a.id !== id);
        this.saveActivities();
        this.updateSchedule();
    }

    updateSchedule() {
        this.drawClockCanvas();
        this.updateActivityList();
        this.updateClockHand();
    }

    setupClockHands() {
        const clock = document.querySelector('.clock');
        if (!clock) return;

        // Create all three hands
        const hourHand = document.createElement('div');
        hourHand.className = 'clock-hand hour-hand';
        
        const minuteHand = document.createElement('div');
        minuteHand.className = 'clock-hand minute-hand';
        
        const secondHand = document.createElement('div');
        secondHand.className = 'clock-hand second-hand';
        
        clock.appendChild(hourHand);
        clock.appendChild(minuteHand);
        clock.appendChild(secondHand);
        
        this.updateClockHands();
    }

    updateClockHands() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();

        // Calculate precise angles for smooth movement
        const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360 - 90;
        const minuteDegrees = ((minutes + seconds / 60) / 60) * 360 - 90;
        const secondDegrees = ((seconds + milliseconds / 1000) / 60) * 360 - 90;

        // Update all hands
        const hourHand = document.querySelector('.hour-hand');
        const minuteHand = document.querySelector('.minute-hand');
        const secondHand = document.querySelector('.second-hand');

        if (hourHand) {
            hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        }
        if (minuteHand) {
            minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
        }
        if (secondHand) {
            secondHand.style.transform = `rotate(${secondDegrees}deg)`;
        }
    }

    updateClockHand() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const totalDegrees = ((hours * 3600 + minutes * 60 + seconds) / 86400) * 360 - 90;
        
        let hand = document.querySelector('.clock-hand');
        if (!hand) {
            hand = document.createElement('div');
            hand.className = 'clock-hand';
            document.querySelector('.clock').appendChild(hand);
        }
        hand.style.transform = `rotate(${totalDegrees}deg)`;
    }

    drawClockCanvas() {
        const canvas = document.getElementById('clock-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = 300, centerY = 300;
        const circleRadius = 276;

        // Clear existing tooltips
        document.querySelectorAll('.activity-tooltip').forEach(t => t.remove());

        // Draw the background circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
        ctx.lineWidth = 48;
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        ctx.stroke();
        ctx.restore();

        // Draw activity segments with tooltips
        const today = new Date().getDay();
        const activities = [
            ...this.activities.filter(a => a.days.includes(today)),
            ...(window.taskManager?.tasks?.filter(t => !t.isCompleted && t.startTime && t.duration) || [])
        ];

        activities.forEach(activity => {
            const [hours, minutes] = activity.startTime.split(':').map(Number);
            const startMinutes = hours * 60 + minutes;
            const duration = parseInt(activity.duration);
            const endMinutes = startMinutes + duration;
            
            const startAngle = (startMinutes / 1440) * Math.PI * 2 - Math.PI / 2;
            const endAngle = (endMinutes / 1440) * Math.PI * 2 - Math.PI / 2;

            // Draw segment
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, circleRadius, startAngle, endAngle);
            ctx.lineWidth = 48;
            ctx.strokeStyle = activity.color || '#6C63FF';
            ctx.lineCap = 'butt';
            ctx.stroke();
            ctx.restore();

            // Add invisible hit area for tooltip
            const hitArea = document.createElement('div');
            hitArea.className = 'segment-hit-area';
            hitArea.style.position = 'absolute';
            hitArea.style.left = '0';
            hitArea.style.top = '0';
            hitArea.style.width = '100%';
            hitArea.style.height = '100%';
            hitArea.style.clipPath = `path('M ${centerX} ${centerY} L ${centerX + Math.cos(startAngle) * circleRadius} ${centerY + Math.sin(startAngle) * circleRadius} A ${circleRadius} ${circleRadius} 0 0 1 ${centerX + Math.cos(endAngle) * circleRadius} ${centerY + Math.sin(endAngle) * circleRadius} Z')`;
            
            const tooltip = document.createElement('div');
            tooltip.className = 'activity-tooltip';
            tooltip.textContent = `${activity.name} (${activity.startTime} - ${duration}min)`;
            
            hitArea.addEventListener('mouseenter', (e) => {
                tooltip.style.display = 'block';
                tooltip.style.left = e.clientX + 'px';
                tooltip.style.top = e.clientY + 'px';
            });
            
            hitArea.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.clientX + 10) + 'px';
                tooltip.style.top = (e.clientY + 10) + 'px';
            });
            
            hitArea.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });

            canvas.parentElement.appendChild(hitArea);
            document.body.appendChild(tooltip);
        });

        // Draw hour markers and numbers
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
            const markerInnerRadius = circleRadius - 24;
            const markerOuterRadius = circleRadius + 24;
            const numberRadius = circleRadius - 40;

            // Draw marker
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(
                centerX + Math.cos(angle) * markerInnerRadius,
                centerY + Math.sin(angle) * markerInnerRadius
            );
            ctx.lineTo(
                centerX + Math.cos(angle) * markerOuterRadius,
                centerY + Math.sin(angle) * markerOuterRadius
            );
            ctx.lineWidth = 2;
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
            ctx.stroke();
            ctx.restore();

            // Draw number
            ctx.save();
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                i.toString().padStart(2, '0'),
                centerX + Math.cos(angle) * numberRadius,
                centerY + Math.sin(angle) * numberRadius
            );
            ctx.restore();
        }
    }

    updateActivityList() {
        const list = document.getElementById('activity-list');
        if (!list) return;
        list.innerHTML = '';
        const today = new Date().getDay();
        const activities = this.activities.filter(a => a.days.includes(today));
        activities.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime));
        activities.forEach(activity => {
            const div = document.createElement('div');
            div.className = 'activity-item';
            div.innerHTML = `
                <span style="color: ${activity.color || '#6C63FF'}">●</span>
                <span class="activity-name">${activity.name}</span>
                <span class="activity-time">${activity.startTime} (${activity.duration}min)</span>
                <div class="activity-actions">
                    <button title="Edit" onclick="window.scheduleManager.editActivity(${activity.id})"><i class="fas fa-edit"></i></button>
                    <button title="Delete" onclick="window.scheduleManager.deleteActivity(${activity.id})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            list.appendChild(div);
        });
    }

    generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }

    loadActivities() {
        return JSON.parse(localStorage.getItem('schedule-activities')) || [];
    }

    saveActivities() {
        localStorage.setItem('schedule-activities', JSON.stringify(this.activities));
    }
}

window.scheduleManager = new ScheduleManager();
