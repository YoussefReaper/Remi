const inputField = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const buttons = document.querySelectorAll('.chat-item');
const chatListContainer = document.getElementById('chatListContainer');

let chats = [{
    id: '12345',
    name: 'The first chat'
}, {
    id: '67890',
    name: 'The second chat'
}];

let currentChatId = new URLSearchParams(window.location.search).get('id') || 'newChat';
let history = localStorage.getItem(`chatHistory-${currentChatId}`) || '<div class="ai-message">Welcome to the chat! How can I assist you today?</div>';


loadChats();

chatMessages.innerHTML = history;

inputField.addEventListener('keydown', (event)=>{
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const message = inputField.value.trim();
        if (message) {
            const escapedMessage = escapeHTML(message);
            const newMessage = `<div class="user-message">${escapedMessage}</div>`;
            addMessage(newMessage);
            inputField.value = '';
            inputField.style.height = 'auto'; // Reset height
        }
    }
});

function addMessage(newMessage) {
    history = `${newMessage} ${history}`;
    chatMessages.innerHTML = history;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (currentChatId === 'newChat') {
        currentChatId = generateNewChatId();
        chatMessages.dataset.chatId = currentChatId;
    }
    else {
    localStorage.setItem(`chatHistory-${currentChatId}`, history);
    }
}

function generateNewChatId() {
    return `${Date.now()}`;
}

function loadChats() {
    let chatListHTML = chatListContainer.innerHTML;
    chats.forEach(item => {
        chatListHTML += `<button class="chat-item" data-chat-id="${item.id}" onclick="selectChat(${item.id})">${escapeHTML(item.name)}</button>`;
    });
    chatListContainer.innerHTML = chatListHTML;
}

function selectChat(chatId) {
    currentChatId = chatId;
    history = localStorage.getItem(`chatHistory-${currentChatId}`) || '';
    chatMessages.innerHTML = history;
    chatMessages.dataset.chatId = currentChatId;

    // Update URL without reloading
    historyPush(`?id=${chatId}`);
}

function historyPush(query) {
    const newUrl = `${window.location.pathname}${query}`;
    window.history.pushState({}, '', newUrl);
}


function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const input = document.getElementById('messageInput');

input.addEventListener('input', ()=> {
    input.style.height = 'auto'; // Reset height
    input.style.height = input.scrollHeight + "px"; // Set height to scrollHeight
});

