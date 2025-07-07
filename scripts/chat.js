// Chat Interface Elements
const inputField = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.querySelector('.send-message-button');
const chatListContainer = document.getElementById('chatListContainer');
const profileContainer = document.querySelector('.ai-profile');

// Panel Elements
const profileToggle = document.getElementById('profileToggle');
const chatHistoryBtn = document.getElementById('chatHistoryBtn');
const newChatBtn = document.getElementById('newChatBtn');
const helpBtn = document.getElementById('helpBtn');
const chatHistoryPanel = document.getElementById('chatHistoryPanel');
const panelOverlay = document.getElementById('panelOverlay');
const closeProfile = document.getElementById('closeProfile');
const closeChatHistory = document.getElementById('closeChatHistory');

// Profile Elements
const closeProfileButton = document.getElementById('close-profile-button');
const mainProfilePic = document.getElementById('mainProfilePic');
const headerAvatar = document.getElementById('headerAvatar');

// Quick Actions
const quickActionCards = document.querySelectorAll('.quick-action-card');
const quickActions = document.getElementById('quickActions');

// AI State Management
let isAITyping = false;

// Chat Data - keeping existing structure
let chats = JSON.parse(localStorage.getItem('chatList')) || [{
    id: '12345',
    name: 'The first chat',
    preview: 'Welcome to the chat!',
    timestamp: new Date().toISOString()
}, {
    id: '67890',
    name: 'The second chat',
    preview: 'Previous conversation...',
    timestamp: new Date().toISOString()
}];

let currentChatId = new URLSearchParams(window.location.search).get('id') || 'newChat';
let history = localStorage.getItem(`chatHistory-${currentChatId}`) || '';

// Helper function to update page title
function updatePageTitle() {
    const profiles = getCurrentProfiles();
    const remiName = profiles.remi?.name || 'Remi';
    document.title = `Chat with ${remiName} - AI Student Assistant`;
}

// Helper function to update chat header
function updateChatHeader() {
    const profiles = getCurrentProfiles();
    const remiName = profiles.remi?.name || 'Remi';
    const remiPicture = profiles.remi?.picture || 'pfp/Remi-pfp.png';
    
    // Update chat title
    const chatTitle = document.querySelector('.chat-title[data-remi-name]');
    if (chatTitle) {
        chatTitle.textContent = remiName;
    }
    
    // Update header avatar
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) {
        headerAvatar.src = remiPicture;
        headerAvatar.alt = remiName;
    }
    
    // Update any other data-remi-name elements in the header
    const nameElements = document.querySelectorAll('[data-remi-name]');
    nameElements.forEach(element => {
        if (element.tagName === 'IMG') {
            element.alt = remiName;
        } else {
            element.textContent = remiName;
        }
    });
    
    // Update any data-remi-avatar elements
    const avatarElements = document.querySelectorAll('[data-remi-avatar]');
    avatarElements.forEach(element => {
        if (element.tagName === 'IMG') {
            element.src = remiPicture;
            element.alt = remiName;
        }
    });
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
    setupEventListeners();
    loadChats();
    
    // Update page title and chat header with current name
    updatePageTitle();
    updateChatHeader();
    
    // Show welcome message if no history
    if (!history.trim()) {
        displayWelcomeMessage();
    } else {
        chatMessages.innerHTML = history;
        attachAvatarClickEvent();
    }
    
    // Listen for profile updates
    window.addEventListener('profileUpdated', (event) => {
        console.log('Profile updated event received:', event.detail);
        const { profileType, field } = event.detail;
        if (profileType === 'remi' && (field === 'name' || field === 'picture' || field === 'description')) {
            // Update page title if name changed
            if (field === 'name') {
                console.log('Updating page title for name change');
                updatePageTitle();
            }
            
            // Update chat header
            updateChatHeader();
            
            // Update the welcome message if it's currently displayed
            const welcomeMessage = document.querySelector('.welcome-message');
            if (welcomeMessage) {
                displayWelcomeMessage();
            }
        }
    });
});

function initializeChat() {
    // Initialize image storage
    if (window.ImageStorage) {
        window.ImageStorage.init().catch(console.error);
    }
    
    // Load profile picture for display only
    loadProfilePicture();
    
    // Setup auto-resize for textarea
    setupAutoResizeTextarea();
    
    // Update send button state
    updateSendButtonState();
}

function setupEventListeners() {
    // Send message events
    sendBtn?.addEventListener('click', handleSendMessage);
    inputField?.addEventListener('keydown', handleKeyPress);
    inputField?.addEventListener('input', handleInputChange);

    // Panel toggles
    profileToggle?.addEventListener('click', () => togglePanel('profile'));
    chatHistoryBtn?.addEventListener('click', () => togglePanel('history'));
    newChatBtn?.addEventListener('click', createNewChat);
    helpBtn?.addEventListener('click', () => sendHelpCommand());

    // Panel close buttons
    closeProfile?.addEventListener('click', () => closePanel('profile'));
    closeProfileButton?.addEventListener('click', () => closePanel('profile'));
    closeChatHistory?.addEventListener('click', () => closePanel('history'));
    panelOverlay?.addEventListener('click', closeAllPanels);

    // Quick actions
    quickActionCards.forEach(card => {
        card.addEventListener('click', () => {
            const action = card.dataset.action;
            handleQuickAction(action);
        });
    });
}

function setupAutoResizeTextarea() {
    if (!inputField) return;
    
    inputField.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        updateSendButtonState();
    });
}

function handleInputChange() {
    updateSendButtonState();
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Only send if AI is not typing
        if (!isAITyping) {
            handleSendMessage();
        }
    }
}

function handleSendMessage() {
    // Prevent sending if AI is currently typing
    if (isAITyping) {
        return;
    }
    
    const message = inputField.value.trim();
    if (!message) return;

    // Hide quick actions after first message
    if (quickActions && !quickActions.classList.contains('hidden')) {
        quickActions.classList.add('hidden');
    }

    // Add user message using existing function
    addMessage(`<div class="message-container user"><div class="user-message">${escapeHTML(message)}</div></div>`);
    
    // Send message using existing function
    sendMessage(message);
    
    // Clear input and reset height
    inputField.value = '';
    inputField.style.height = 'auto';
    updateSendButtonState();
}

function updateSendButtonState() {
    if (!sendBtn || !inputField) return;
    
    const hasText = inputField.value.trim().length > 0;
    const canSend = hasText && !isAITyping;
    
    sendBtn.disabled = !canSend;
    
    // Update input field visual state
    if (isAITyping) {
        inputField.style.opacity = '0.6';
        inputField.placeholder = 'AI is responding...';
        inputField.disabled = true;
    } else {
        inputField.style.opacity = '1';
        inputField.placeholder = 'Type your message...';
        inputField.disabled = false;
    }
    
    if (canSend) {
        sendBtn.style.background = 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))';
        sendBtn.style.opacity = '1';
        sendBtn.style.cursor = 'pointer';
    } else {
        sendBtn.style.background = 'var(--glass-bg)';
        sendBtn.style.opacity = isAITyping ? '0.3' : '0.5';
        sendBtn.style.cursor = isAITyping ? 'not-allowed' : 'default';
    }
}

// Keep existing message functions but enhance them
function sendMessage(message) {
    // Set AI typing state and update UI
    isAITyping = true;
    updateSendButtonState();
    
    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        const response = checkForCommands(message);
        typeMessageWithHTML(response);
    }, 1200);
}

function addMessage(newMessage) {
    history = `${newMessage} ${history}`;
    chatMessages.innerHTML = history;
    attachAvatarClickEvent();
    scrollToBottom();
    
    if (currentChatId === 'newChat') {
        currentChatId = generateNewChatId();
        chatMessages.dataset.chatId = currentChatId;
        chats.push({
            id: currentChatId,
            name: `Chat ${Date.now()}`,
            preview: 'New conversation...',
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('chatList', JSON.stringify(chats));
    } else {
        localStorage.setItem(`chatHistory-${currentChatId}`, history);
    }
}

// Function to safely render HTML in AI messages while preventing XSS
function sanitizeAndRenderHTML(htmlString) {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    
    // List of allowed HTML tags for AI responses
    const allowedTags = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li',
        'code', 'pre',
        'div', 'span',
        'blockquote'
    ];
    
    // List of allowed attributes
    const allowedAttributes = {
        'div': ['style', 'class'],
        'span': ['style', 'class'],
        'code': ['class'],
        'pre': ['class'],
        'h1': ['class'], 'h2': ['class'], 'h3': ['class'], 'h4': ['class'], 'h5': ['class'], 'h6': ['class'],
        'p': ['class', 'style'],
        'ul': ['class'], 'ol': ['class'], 'li': ['class'],
        'strong': ['class'], 'b': ['class'], 'em': ['class'], 'i': ['class'], 'u': ['class'],
        'blockquote': ['class', 'style']
    };
    
    // Set the HTML content
    tempDiv.innerHTML = htmlString;
    
    // Function to clean an element recursively
    function cleanElement(element) {
        const tagName = element.tagName?.toLowerCase();
        
        // Remove disallowed tags
        if (tagName && !allowedTags.includes(tagName)) {
            element.replaceWith(...element.childNodes);
            return;
        }
        
        // Remove disallowed attributes
        if (element.attributes) {
            const attributesToRemove = [];
            for (let attr of element.attributes) {
                const attrName = attr.name.toLowerCase();
                const allowedAttrs = allowedAttributes[tagName] || [];
                
                if (!allowedAttrs.includes(attrName)) {
                    attributesToRemove.push(attr.name);
                }
            }
            
            attributesToRemove.forEach(attrName => {
                element.removeAttribute(attrName);
            });
        }
        
        // Clean child elements
        Array.from(element.children).forEach(cleanElement);
    }
    
    // Clean all elements
    Array.from(tempDiv.children).forEach(cleanElement);
    
    return tempDiv.innerHTML;
}

// Enhanced typeMessage function that properly handles HTML for AI responses
function typeMessageWithHTML(text) {
    const profiles = getCurrentProfiles();
    const remiName = profiles.remi?.name || 'Remi';
    const remiPicture = profiles.remi?.picture || 'pfp/Remi-pfp.png';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'message-container ai';
    wrapper.innerHTML = `
        <div class="ai-message-wrapper">
            <div class="ai-avatar">
                <img src="${remiPicture}" alt="${remiName}" data-remi-avatar>
            </div>
            <div class="ai-message"></div>
        </div>
    `;

    const messageText = wrapper.querySelector('.ai-message');
    chatMessages.insertAdjacentElement('afterbegin', wrapper);

    // Check if the text contains HTML tags
    const containsHTML = /<[^>]*>/g.test(text);
    
    if (containsHTML) {
        // For HTML content, sanitize and render directly
        const sanitizedHTML = sanitizeAndRenderHTML(text);
        messageText.innerHTML = sanitizedHTML;
        
        // Clear AI typing state and update UI immediately
        isAITyping = false;
        updateSendButtonState();
        
        history = `${wrapper.outerHTML} ${history}`;
        localStorage.setItem(`chatHistory-${currentChatId}`, history);
        attachAvatarClickEvent();
        scrollToBottom();
    } else {
        // For plain text, use the typing animation with escaping
        let i = 0;
        const interval = setInterval(() => {
            messageText.innerHTML += escapeHTML(text[i]);
            i++;

            scrollToBottom();
            if (i >= text.length) {
                clearInterval(interval);
                
                // Clear AI typing state and update UI
                isAITyping = false;
                updateSendButtonState();
                
                history = `${wrapper.outerHTML} ${history}`;
                localStorage.setItem(`chatHistory-${currentChatId}`, history);
                attachAvatarClickEvent();
            }
        }, 30);
    }
}

// Function to safely sanitize HTML content from user input

function showTypingIndicator() {
    // Remove existing typing indicator
    removeTypingIndicator();
    
    const profiles = getCurrentProfiles();
    const remiName = profiles.remi?.name || 'Remi';
    const remiPicture = profiles.remi?.picture || 'pfp/Remi-pfp.png';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="ai-avatar">
            <img src="${remiPicture}" alt="${remiName}" data-remi-avatar>
        </div>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.insertAdjacentElement('afterbegin', typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Helper function to get current profile data
function getCurrentProfiles() {
    const defaultProfiles = {
        user: { name: 'Student' },
        remi: { 
            name: 'Remi', 
            picture: 'pfp/Remi-pfp.png',
            description: 'Your AI Study Companion'
        }
    };
    
    try {
        const saved = localStorage.getItem('remiProfiles');
        return saved ? { ...defaultProfiles, ...JSON.parse(saved) } : defaultProfiles;
    } catch (error) {
        console.error('Error loading profiles:', error);
        return defaultProfiles;
    }
}

function displayWelcomeMessage() {
    // Get current profile data
    const profiles = getCurrentProfiles();
    const remiName = profiles.remi?.name || 'Remi';
    const remiPicture = profiles.remi?.picture || 'pfp/Remi-pfp.png';
    const remiDescription = profiles.remi?.description || 'Your AI Study Companion';
    
    // Get current time for personalized greeting
    const currentHour = new Date().getHours();
    let timeGreeting = '';
    let timeEmoji = '';
    
    if (currentHour >= 5 && currentHour < 12) {
        timeGreeting = 'Good morning';
        timeEmoji = '🌅';
    } else if (currentHour >= 12 && currentHour < 17) {
        timeGreeting = 'Good afternoon';
        timeEmoji = '☀️';
    } else if (currentHour >= 17 && currentHour < 21) {
        timeGreeting = 'Good evening';
        timeEmoji = '🌇';
    } else {
        timeGreeting = 'Good evening';
        timeEmoji = '🌙';
    }
    
    // Add welcome animation to the container
    chatMessages.classList.add('welcome-animation');
    
    setTimeout(() => {
        const welcomeMessage = `
            <div class="message-container ai welcome-message">
                <div class="modern-welcome-card">
                    <div class="welcome-header-section">
                        <div class="avatar-section">
                            <img src="${remiPicture}" alt="${remiName}" class="welcome-avatar" data-remi-avatar>
                            <div class="status-badge">
                                <span class="status-dot"></span>
                                <span class="status-text">Online</span>
                            </div>
                        </div>
                        <div class="greeting-section">
                            <h2 class="main-greeting">${timeEmoji} ${timeGreeting}!</h2>
                            <h3 class="assistant-intro">I'm <span class="name-highlight" data-remi-name>${remiName}</span></h3>
                            <p class="description-text" data-remi-description>${remiDescription}</p>
                        </div>
                    </div>
                    
                    <div class="features-showcase">
                        <div class="feature-highlight">
                            <div class="feature-icon">🎓</div>
                            <div class="feature-content">
                                <h4>Smart Learning Assistant</h4>
                                <p>I can help you study, plan, and achieve your academic goals with personalized guidance.</p>
                            </div>
                        </div>
                        
                        <div class="quick-start-section">
                            <h4 class="quick-start-title">✨ Quick Start</h4>
                            <div class="starter-buttons">
                                <button class="starter-btn" data-action="study">📚 Study Help</button>
                                <button class="starter-btn" data-action="plan">📅 Make a Plan</button>
                                <button class="starter-btn" data-action="explain">💡 Explain Topic</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="welcome-footer">
                        <div class="chat-prompt">
                            <span class="prompt-icon">�</span>
                            <span class="prompt-text">What would you like to learn about today?</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.innerHTML = welcomeMessage;
        chatMessages.classList.remove('welcome-animation');
        attachAvatarClickEvent();
        attachStarterButtonEvents();
        
        // Add entrance animations
        setTimeout(() => {
            document.querySelector('.welcome-header-section')?.classList.add('animate-in');
        }, 200);
        
        setTimeout(() => {
            document.querySelector('.features-showcase')?.classList.add('animate-in');
        }, 500);
        
        setTimeout(() => {
            document.querySelector('.welcome-footer')?.classList.add('animate-in');
        }, 800);
        
    }, 800);

    // Show quick actions after welcome message
    setTimeout(() => {
        if (quickActions) {
            quickActions.classList.remove('hidden');
            quickActions.classList.add('fade-in');
        }
    }, 2500);
}

// Add event listeners for starter buttons
function attachStarterButtonEvents() {
    const starterButtons = document.querySelectorAll('.starter-btn');
    starterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            handleStarterButtonClick(action);
        });
    });
}

// Handle starter button clicks
function handleStarterButtonClick(action) {
    let message = '';
    
    switch(action) {
        case 'study':
            message = 'I need help with studying. Can you help me create a study plan?';
            break;
        case 'plan':
            message = 'I want to create a learning plan. What do you recommend?';
            break;
        case 'explain':
            message = 'Can you explain a topic to me? I have some questions.';
            break;
        default:
            message = 'Hi! I\'d like to get started with learning.';
    }
    
    // Set the message in the input and send it
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.value = message;
        sendMessage();
    }
}

// Handle capability item clicks
function handleCapabilityItemClick(action) {
    let message = '';
    
    switch (action) {
        case 'study':
            message = 'I want help with study planning and organization';
            break;
        case 'goals':
            message = 'Help me set and track my academic goals';
            break;
        case 'concepts':
            message = 'I need help understanding a concept';
            break;
        case 'questions':
            message = 'I have a question about my studies';
            break;
        case 'schedule':
            message = 'Help me manage my time and schedule';
            break;
        case 'motivation':
            message = 'I need some motivation and encouragement';
            break;
        default:
            message = `Tell me more about ${action}`;
    }
    
    // Auto-fill the input and focus
    if (inputField) {
        inputField.value = message;
        inputField.focus();
        updateSendButtonState();
        
        // Add a subtle animation to indicate the text was filled
        inputField.style.transform = 'scale(1.02)';
        setTimeout(() => {
            inputField.style.transform = 'scale(1)';
        }, 200);
    }
}

// Enhanced Quick Actions
function handleQuickAction(action) {
    // Prevent quick actions while AI is typing
    if (isAITyping) {
        return;
    }
    
    let message = '';
    
    switch (action) {
        case 'help':
            message = '/help';
            break;
        case 'task':
            message = 'I want to create a new task';
            break;
        case 'motivation':
            message = 'I need some motivation';
            break;
        case 'study-tips':
            message = 'Can you give me some study tips?';
            break;
        default:
            message = `Tell me about ${action}`;
    }
    
    // Simulate user typing the message
    inputField.value = message;
    handleSendMessage();
}

function sendHelpCommand() {
    // Prevent help command while AI is typing
    if (isAITyping) {
        return;
    }
    
    inputField.value = '/help';
    handleSendMessage();
}

// Panel Management
function togglePanel(panelType) {
    closeAllPanels();
    
    if (panelType === 'profile') {
        profileContainer?.classList.add('visible');
        showOverlay();
    } else if (panelType === 'history') {
        chatHistoryPanel?.classList.add('show');
        showOverlay();
    }
}

function closePanel(panelType) {
    if (panelType === 'profile') {
        profileContainer?.classList.remove('visible');
    } else if (panelType === 'history') {
        chatHistoryPanel?.classList.remove('show');
    }
    hideOverlay();
}

function closeAllPanels() {
    profileContainer?.classList.remove('visible');
    chatHistoryPanel?.classList.remove('show');
    hideOverlay();
}

function showOverlay() {
    panelOverlay?.classList.add('show');
}

function hideOverlay() {
    panelOverlay?.classList.remove('show');
}

function createNewChat() {
    currentChatId = 'newChat';
    history = '';
    chatMessages.innerHTML = '';
    inputField.value = '';
    inputField.style.height = 'auto';
    
    // Show quick actions for new chat
    if (quickActions) {
        quickActions.classList.remove('hidden');
    }
    
    displayWelcomeMessage();
    closeAllPanels();
    
    // Update URL
    window.history.pushState({}, '', window.location.pathname);
}

// Keep existing functions with enhancements
function checkForCommands(message) {
    const responses = [];

    if (/i love you/i.test(message)) {
        responses.push('I love you toooooo!!! ❤️ You always make me so happy!');
    }

    if (/\/new/i.test(message)) {
        createNewChat();
        responses.push('✨ New chat created! How can I help you today?');
        return responses.join('<br><br>');
    }

    if (/\/help/i.test(message)) {
        responses.push(`
            <h4>🤖 Available Commands:</h4>
            <ul>
                <li><code>/help</code> - Show this help menu</li>
                <li><code>/new</code> - Start a new chat</li>
                <li><code>/tasks</code> - View all your tasks with status</li>
                <li><code>/pending</code> - View only pending tasks</li>
                <li><code>/completed</code> - View only completed tasks</li>
                <li><code>/addTask [task name]</code> - Quick create a task</li>
                <li><code>/editTask [task name] [done/pending]</code> - Update task status</li>
                <li><code>/deleteTask [task name]</code> - Delete a task</li>
                <li><code>/task {name, date, time, duration, priority}</code> - Create detailed task</li>
            </ul>
            <p>💡 <strong>Tips:</strong></p>
            <ul>
                <li>Task names are fuzzy matched - partial names work!</li>
                <li>Ask me about study techniques and motivation</li>
                <li>Chat naturally - I understand context!</li>
            </ul>
        `);
    }

    // Task management commands
    if (/\/tasks\b/i.test(message)) {
        const allTasks = getTasksFromStorage();
        responses.push(formatTasksForChat(allTasks));
    }

    // Edit task command: /editTask taskname done|pending
    const editTaskMatch = message.match(/\/editTask\s+(.+?)\s+(done|pending|completed)/i);
    if (editTaskMatch) {
        const [, taskName, status] = editTaskMatch;
        const task = findTaskByName(taskName.trim());
        
        if (task) {
            const isCompleted = status.toLowerCase() === 'done' || status.toLowerCase() === 'completed';
            const updates = { 
                completed: isCompleted,
                ...(isCompleted ? { completedAt: new Date().toISOString() } : {})
            };
            
            // Remove completedAt if marking as pending
            if (!isCompleted && task.completedAt) {
                updates.completedAt = undefined;
            }
            
            const success = updateTaskInStorageWithEvent(task.id, updates);
            
            if (success) {
                const statusText = isCompleted ? 'completed ✅' : 'pending 🔄';
                responses.push(`✅ Task "${task.name}" has been marked as ${statusText}!`);
            } else {
                responses.push(`❌ Failed to update task "${taskName}". Please try again.`);
            }
        } else {
            responses.push(`❌ Task "${taskName}" not found. Use <code>/tasks</code> to see all available tasks.`);
        }
    }

    // Delete task command: /deleteTask taskname
    const deleteTaskMatch = message.match(/\/deleteTask\s+(.+)/i);
    if (deleteTaskMatch) {
        const taskName = deleteTaskMatch[1].trim();
        const task = findTaskByName(taskName);
        
        if (task) {
            const success = deleteTaskFromStorageWithEvent(task.id);
            
            if (success) {
                responses.push(`🗑️ Task "${task.name}" has been deleted successfully!`);
            } else {
                responses.push(`❌ Failed to delete task "${taskName}". Please try again.`);
            }
        } else {
            responses.push(`❌ Task "${taskName}" not found. Use <code>/tasks</code> to see all available tasks.`);
        }
    }

    // Quick task creation command: /addTask taskname
    const quickTaskMatch = message.match(/\/addTask\s+(.+)/i);
    if (quickTaskMatch) {
        const taskName = quickTaskMatch[1].trim();
        const quickTask = createTaskFromChat({
            name: taskName,
            description: 'Quick task created via chat',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            duration: '30',
            priority: '2'
        });
        
        responses.push(`✅ Quick task "<strong>${quickTask.name}</strong>" created successfully! 
                       <br>Use <code>/tasks</code> to view all tasks or visit the tasks page to edit details.`);
    }

    // Show pending tasks only
    if (/\/pending/i.test(message)) {
        const allTasks = getTasksFromStorage();
        const pendingTasks = allTasks.filter(task => !task.completed);
        
        if (pendingTasks.length === 0) {
            responses.push("🎉 Awesome! You have no pending tasks. Great job staying on top of things!");
        } else {
            let response = `<h4>🔄 Pending Tasks (${pendingTasks.length})</h4><ul>`;
            pendingTasks.forEach(task => {
                const priorityEmoji = task.priority === '1' ? '🔴' : task.priority === '2' ? '🟡' : '🟢';
                const deadline = task.deadline ? ` (Due: ${task.deadline})` : '';
                response += `<li>${priorityEmoji} <strong>${task.name}</strong>${deadline}</li>`;
            });
            response += `</ul>`;
            responses.push(response);
        }
    }

    // Show completed tasks only
    if (/\/completed/i.test(message)) {
        const allTasks = getTasksFromStorage();
        const completedTasks = allTasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) {
            responses.push("📝 No completed tasks yet. Keep working - you'll get there!");
        } else {
            let response = `<h4>✅ Completed Tasks (${completedTasks.length})</h4><ul>`;
            completedTasks.slice(0, 10).forEach(task => {
                response += `<li>✅ <strike>${task.name}</strike></li>`;
            });
            if (completedTasks.length > 10) {
                response += `<li><em>... and ${completedTasks.length - 10} more</em></li>`;
            }
            response += `</ul>`;
            responses.push(response);
        }
    }

    // Enhanced motivation responses
    if (/motivation|motivate|encourage/i.test(message)) {
        const motivations = [
            "🌟 You're doing amazing! Every study session brings you closer to your goals!",
            "💪 Remember: champions are made when no one is watching. Keep pushing forward!",
            "🚀 Your future self will thank you for the hard work you're putting in today!",
            "✨ Learning is a superpower, and you're developing yours every single day!",
            "🎯 Focus on progress, not perfection. You've got this!"
        ];
        responses.push(motivations[Math.floor(Math.random() * motivations.length)]);
    }

    // Enhanced study tips
    if (/study tip|help study|how to study/i.test(message)) {
        const tips = [
            "📚 <strong>Pomodoro Technique:</strong> Study for 25 minutes, then take a 5-minute break. Your brain will thank you!",
            "🧠 <strong>Active Recall:</strong> Test yourself instead of just re-reading. Quiz yourself on what you've learned!",
            "📝 <strong>Take Notes by Hand:</strong> Writing helps you remember better than typing.",
            "🎯 <strong>Set Specific Goals:</strong> Instead of 'study math', try 'complete 10 algebra problems'."
        ];
        responses.push(tips[Math.floor(Math.random() * tips.length)]);
    }

    // Keep existing task creation logic
    const taskMatches = [...message.matchAll(/\/task\s*\{([^}]+)\}/gi)];
    for (const match of taskMatches) {
        const taskString = match[1];
        const keyValuePairs = taskString.split(',').map(pair => pair.split(':').map(part => part.trim()));
        const taskObj = {};
        keyValuePairs.forEach(([key, value]) => {
            if (key && value) {
                taskObj[key.toLowerCase()] = value;
            }
        });

        const requiredFields = ['name', 'time', 'duration', 'priority'];
        const missingFields = requiredFields.filter(field => !taskObj[field]);

        if (missingFields.length > 0) {
            responses.push(`❌ Missing fields: ${missingFields.join(', ')}. Please provide all required fields.`);
        } else {
            const createdTask = createTaskFromChat({
                name: taskObj.name,
                description: taskObj.description || '',
                date: taskObj.date || new Date().toLocaleDateString(),
                time: taskObj.time,
                duration: taskObj.duration,
                priority: taskObj.priority || '2',
                location: taskObj.location || '',
                milestone: taskObj.milestone || '',
                notes: taskObj.notes || '',
                tags: taskObj.tags ? taskObj.tags.split(',') : [],
                color: taskObj.color || '#6366f1',
                deadline: taskObj.deadline || '',
                effort: taskObj.effort || '1',
                repeatable: taskObj.repeatable === "true",
                repeatDays: taskObj.repeatDays ? taskObj.repeatDays.split(',') : []
            });

            responses.push(`
                <h4>✅ Task Created Successfully!</h4>
                <div style="background: var(--glass-bg); padding: 1rem; border-radius: 10px; margin: 0.5rem 0; border: 1px solid var(--glass-border);">
                    <strong>📋 ${createdTask.name}</strong><br>
                    📅 ${createdTask.date} at ${createdTask.time}<br>
                    ⏱️ Duration: ${createdTask.duration} mins<br>
                    📌 Priority: ${createdTask.priority}<br>
                    ${createdTask.location ? `📍 Location: ${createdTask.location}<br>` : ''}
                    ${createdTask.deadline ? `⏰ Deadline: ${createdTask.deadline}<br>` : ''}
                </div>
                <p>🎉 Great job staying organized! Your task is ready and saved!</p>
            `);
        }
    }

    if (responses.length === 0) {
        // Enhanced default responses
        const defaultResponses = [
            `That's interesting! Tell me more about "${message}" 🤔`,
            `I understand you're talking about "${message}". How can I help you with your studies? 📚`,
            `Great question! Let's explore that together. What specifically would you like to know? 💭`,
            `I'm here to help! Is there anything study-related I can assist you with regarding "${message}"? 🌟`
        ];
        responses.push(defaultResponses[Math.floor(Math.random() * defaultResponses.length)]);
    }

    return responses.join('<br><br>');
}

// Task management functions for chat commands
function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function updateTaskInStorage(taskId, updates) {
    let tasks = getTasksFromStorage();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Update the task in the tasks page if it's open
        if (window.location.pathname.includes('tasks.html') || typeof updateTaskInDOM === 'function') {
            updateTaskInDOM(tasks[taskIndex]);
        }
        
        return true;
    }
    return false;
}

function deleteTaskFromStorageById(taskId) {
    let tasks = getTasksFromStorage();
    const originalLength = tasks.length;
    tasks = tasks.filter(task => task.id !== taskId);
    
    if (tasks.length < originalLength) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Remove the task from the tasks page if it's open
        if (window.location.pathname.includes('tasks.html')) {
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.remove();
            }
        }
        
        return true;
    }
    return false;
}

function findTaskByName(taskName) {
    const tasks = getTasksFromStorage();
    return tasks.find(task => 
        task.name.toLowerCase().includes(taskName.toLowerCase()) ||
        taskName.toLowerCase().includes(task.name.toLowerCase())
    );
}

function formatTasksForChat(tasks) {
    if (tasks.length === 0) {
        return "📝 You don't have any tasks yet! Create some tasks to stay organized.";
    }

    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    
    // Categorize pending tasks
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const lateTasks = pendingTasks.filter(task => {
        if (!task.date || !task.time) return false;
        const taskDate = new Date(`${task.date} ${task.time}`);
        return taskDate < now;
    });
    
    const dueTodayTasks = pendingTasks.filter(task => {
        if (!task.date) return false;
        const taskDateOnly = new Date(task.date);
        taskDateOnly.setHours(0, 0, 0, 0);
        return taskDateOnly.getTime() === today.getTime() && !lateTasks.includes(task);
    });
    
    const dueTomorrowTasks = pendingTasks.filter(task => {
        if (!task.date) return false;
        const taskDateOnly = new Date(task.date);
        taskDateOnly.setHours(0, 0, 0, 0);
        return taskDateOnly.getTime() === tomorrow.getTime();
    });
    
    const futureTasks = pendingTasks.filter(task => 
        !lateTasks.includes(task) && 
        !dueTodayTasks.includes(task) && 
        !dueTomorrowTasks.includes(task)
    );
    
    let response = `<h4>📋 Your Tasks Summary</h4>`;
    response += `<p><strong>Total:</strong> ${tasks.length} | <strong>Completed:</strong> ${completedTasks.length} | <strong>Pending:</strong> ${pendingTasks.length}</p>`;
    
    // Show late tasks first (highest priority)
    if (lateTasks.length > 0) {
        response += `<h5>⚠️ Late Tasks (${lateTasks.length}):</h5><ul>`;
        lateTasks.forEach(task => {
            const priorityEmoji = task.priority === '1' ? '🔴' : task.priority === '2' ? '🟡' : '🟢';
            response += `<li style="color: #dc3545; font-weight: bold;">⚠️ ${priorityEmoji} <strong>${task.name}</strong>`;
            if (task.date && task.time) {
                response += ` (Was due: ${task.date} at ${task.time})`;
            }
            if (task.description && task.description !== 'No description') {
                response += `<br><em style="color: #6c757d;">${task.description}</em>`;
            }
            response += `</li>`;
        });
        response += `</ul>`;
    }
    
    // Show due today tasks
    if (dueTodayTasks.length > 0) {
        response += `<h5>� Due Today (${dueTodayTasks.length}):</h5><ul>`;
        dueTodayTasks.forEach(task => {
            const priorityEmoji = task.priority === '1' ? '🔴' : task.priority === '2' ? '🟡' : '🟢';
            response += `<li style="color: #ffc107; font-weight: bold;">📅 ${priorityEmoji} <strong>${task.name}</strong>`;
            if (task.time) {
                response += ` (Due at ${task.time})`;
            }
            if (task.description && task.description !== 'No description') {
                response += `<br><em style="color: #6c757d;">${task.description}</em>`;
            }
            response += `</li>`;
        });
        response += `</ul>`;
    }
    
    // Show due tomorrow tasks
    if (dueTomorrowTasks.length > 0) {
        response += `<h5>📋 Due Tomorrow (${dueTomorrowTasks.length}):</h5><ul>`;
        dueTomorrowTasks.forEach(task => {
            const priorityEmoji = task.priority === '1' ? '🔴' : task.priority === '2' ? '🟡' : '🟢';
            response += `<li>${priorityEmoji} <strong>${task.name}</strong>`;
            if (task.time) {
                response += ` (Due at ${task.time})`;
            }
            if (task.description && task.description !== 'No description') {
                response += `<br><em>${task.description}</em>`;
            }
            response += `</li>`;
        });
        response += `</ul>`;
    }
    
    // Show other pending tasks
    if (futureTasks.length > 0) {
        response += `<h5>🔄 Other Pending Tasks (${futureTasks.length}):</h5><ul>`;
        futureTasks.slice(0, 5).forEach(task => {
            const priorityEmoji = task.priority === '1' ? '🔴' : task.priority === '2' ? '🟡' : '🟢';
            const deadline = task.date ? ` (Due: ${task.date}${task.time ? ` at ${task.time}` : ''})` : '';
            response += `<li>${priorityEmoji} <strong>${task.name}</strong>${deadline}`;
            if (task.description && task.description !== 'No description') {
                response += `<br><em>${task.description}</em>`;
            }
            response += `</li>`;
        });
        if (futureTasks.length > 5) {
            response += `<li><em>... and ${futureTasks.length - 5} more future tasks</em></li>`;
        }
        response += `</ul>`;
    }
    
    if (completedTasks.length > 0) {
        response += `<h5>✅ Recently Completed (${completedTasks.length}):</h5><ul>`;
        completedTasks.slice(0, 3).forEach(task => {
            response += `<li>✅ <strike>${task.name}</strike>`;
            if (task.completedAt) {
                const completedDate = new Date(task.completedAt);
                response += ` <em>(Completed: ${completedDate.toLocaleDateString()})</em>`;
            }
            response += `</li>`;
        });
        if (completedTasks.length > 3) {
            response += `<li><em>... and ${completedTasks.length - 3} more completed tasks</em></li>`;
        }
        response += `</ul>`;
    }
    
    response += `<p><strong>💡 Tip:</strong> Use <code>/editTask [task name] [done/pending]</code> to update task status!</p>`;
    
    // Add urgent warnings
    if (lateTasks.length > 0) {
        response += `<p style="color: #dc3545; font-weight: bold;">⚠️ <strong>Warning:</strong> You have ${lateTasks.length} late task${lateTasks.length > 1 ? 's' : ''}! Consider prioritizing these.</p>`;
    }
    
    return response;
}

// Event system for cross-page task updates
function dispatchTaskUpdateEvent(action, taskData) {
    const event = new CustomEvent('taskUpdated', {
        detail: {
            action: action, // 'created', 'updated', 'deleted'
            task: taskData
        }
    });
    window.dispatchEvent(event);
}

// Enhanced task update function with event dispatching
function updateTaskInStorageWithEvent(taskId, updates) {
    let tasks = getTasksFromStorage();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        const oldTask = { ...tasks[taskIndex] };
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Dispatch event for other pages
        dispatchTaskUpdateEvent('updated', tasks[taskIndex]);
        
        // Update the task in the tasks page if it's open
        updateTaskInDOM(tasks[taskIndex]);
        
        // Force refresh global stats if available
        if (window.globalStatsManager) {
            window.globalStatsManager.forceRefresh();
        }
        
        return true;
    }
    return false;
}

// Enhanced task deletion function with event dispatching
function deleteTaskFromStorageWithEvent(taskId) {
    let tasks = getTasksFromStorage();
    const taskToDelete = tasks.find(task => task.id === taskId);
    const originalLength = tasks.length;
    tasks = tasks.filter(task => task.id !== taskId);
    
    if (tasks.length < originalLength) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Dispatch event for other pages
        if (taskToDelete) {
            dispatchTaskUpdateEvent('deleted', taskToDelete);
        }
        
        // Remove the task from the tasks page if it's open
        if (window.location.pathname.includes('tasks.html')) {
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.remove();
            }
        }
        
        // Force refresh global stats if available
        if (window.globalStatsManager) {
            window.globalStatsManager.forceRefresh();
        }
        
        return true;
    }
    return false;
}

// ...existing code...
function loadChats() {
    if (!chatListContainer) return;
    
    chatListContainer.innerHTML = '';

    chats.forEach(item => {
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-item';
        chatElement.innerHTML = `
            <i class="fas fa-comments" style="color: var(--accent-primary);"></i>
            <div>
                <div style="font-weight: 500;">${item.name}</div>
                <div style="font-size: 0.8rem; opacity: 0.7;">${item.preview || 'No preview'}</div>
            </div>
        `;
        chatElement.dataset.chatId = item.id;

        chatElement.addEventListener('click', () => {
            selectChat(item.id);
        });

        chatListContainer.appendChild(chatElement);
    });
}

function selectChat(chatId) {
    currentChatId = chatId;
    history = localStorage.getItem(`chatHistory-${currentChatId}`) || '';
    chatMessages.innerHTML = history;
    attachAvatarClickEvent();
    chatMessages.dataset.chatId = currentChatId;

    // Update URL without reloading
    historyPush(`?id=${chatId}`);
    
    // Close panels
    closeAllPanels();
    
    // Hide quick actions if there's content
    if (history.trim() && quickActions) {
        quickActions.classList.add('hidden');
    } else if (quickActions) {
        quickActions.classList.remove('hidden');
    }
}

function generateNewChatId() {
    return `${Date.now()}`;
}

function historyPush(query) {
    const newUrl = `${window.location.pathname}${query}`;
    window.history.pushState({}, '', newUrl);
}

// Load profile picture from storage
async function loadProfilePicture() {
    try {
        if (window.ImageStorage) {
            const savedPic = await window.ImageStorage.getImageWithFallback('profilePicture');
            if (savedPic) {
                setProfilePicture(savedPic);
            }
        } else {
            // Fallback to localStorage if ImageStorage is not available
            const savedPic = localStorage.getItem('profilePicture');
            if (savedPic) {
                setProfilePicture(savedPic);
            }
        }
    } catch (error) {
        console.error('Error loading profile picture:', error);
    }
}

function setProfilePicture(src) {
    // Update all avatar images for display only
    if (mainProfilePic) mainProfilePic.src = src;
    if (headerAvatar) headerAvatar.src = src;
    
    const avatars = document.querySelectorAll('.ai-avatar img');
    avatars.forEach(avatar => {
        avatar.src = src;
    });
}

function attachAvatarClickEvent() {
    const avatars = document.querySelectorAll('.ai-avatar');
    avatars.forEach(avatar => {
        avatar.addEventListener('click', () => {
            togglePanel('profile');
        });
    });
}

function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Function to update task in DOM (for tasks page integration)
function updateTaskInDOM(updatedTask) {
    const taskElement = document.querySelector(`[data-task-id="${updatedTask.id}"]`);
    if (taskElement) {
        const checkbox = taskElement.querySelector('.task-complete-checkbox');
        if (checkbox) {
            checkbox.checked = updatedTask.completed;
            taskElement.classList.toggle('completed', updatedTask.completed);
        }
        
        // Update task statistics if the function exists
        if (typeof updateTaskStatistics === 'function') {
            updateTaskStatistics();
        }
    }
}

// Enhanced task creation with better validation and feedback
function createTaskFromChat(taskData) {
    // Generate unique ID
    const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const task = {
        id: taskId,
        name: taskData.name,
        description: taskData.description || '',
        date: taskData.date || new Date().toLocaleDateString(),
        time: taskData.time,
        duration: taskData.duration,
        priority: taskData.priority || '2',
        location: taskData.location || '',
        milestone: taskData.milestone || '',
        notes: taskData.notes || '',
        tags: taskData.tags || [],
        color: taskData.color || '#6366f1',
        deadline: taskData.deadline || '',
        effort: taskData.effort || '1',
        repeatable: taskData.repeatable || false,
        repeatDays: taskData.repeatDays || [],
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Save to storage
    let tasks = getTasksFromStorage();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Dispatch event for other pages
    dispatchTaskUpdateEvent('created', task);
    
    // Update DOM if tasks page is open
    if (window.location.pathname.includes('tasks.html') && typeof renderTask === 'function') {
        renderTask(task);
    }
    
    // Force refresh global stats if available
    if (window.globalStatsManager) {
        window.globalStatsManager.forceRefresh();
    }
    
    return task;
}