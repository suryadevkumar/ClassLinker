let chatBox;
let sub_id = '';
let user_id = '';
let messageInput = '';

window.onload = function() {
    chatBox = document.getElementById('chat-box');
    sub_id = sessionStorage.getItem('sub_id');
    user_id = sessionStorage.getItem('user_id');
    messageInput = document.getElementById('message');
    getMessages(sub_id);
};

// Listen for storage changes to reload the page if necessary
window.addEventListener('storage', (event) => {
    if (event.key === 'chatReload' && event.newValue === 'teacher') {
        localStorage.removeItem('chatReload');
        location.reload();
    }
});

messageInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

// Mark teacher chat as open on load
window.addEventListener('load', () => {
    localStorage.setItem('teacherChatOpen', 'true');
});

// Mark teacher chat as closed before unloading the page
window.addEventListener('beforeunload', () => {
    localStorage.setItem('teacherChatOpen', 'false');
});

// Function to get messages
function getMessages(sub_id) {
    try {
        fetch('/getchats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sub_id })
        })
        .then(response => response.json())
        .then(data => {
            data.forEach((chat) => {
                let messageDiv = document.createElement('div');
                messageDiv.className = chat[0] != user_id ? 'others-message' : 'user-message';
                messageDiv.innerHTML = `<p><u>${chat[1]}</u> <sub style="color:grey">${chat[3]}</sub><hr><strong style="color:black">${chat[2]}</strong></p>`;
                chatBox.appendChild(messageDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            });
        })
        .catch(error => {
            console.error('Error fetching chats:', error);
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Send message function
async function sendMessage() {
    const message = messageInput.value.trim();
    try {
        const response = await fetch('/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sub_id, message })
        });
        const responseText = await response.text();
        if (responseText === 'true') {
            messageInput.value = '';
            getMessages();
            window.location.reload();
            if (localStorage.getItem('studentChatOpen') === 'true') {
                localStorage.setItem('chatReload', 'student');
            }
        } else {
            console.error('Failed to send message.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}