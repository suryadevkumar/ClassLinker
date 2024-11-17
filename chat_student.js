let chatBox;
let sub_id='';
let user_id='';
let messageInput='';

window.onload=function(){
    chatBox = document.getElementById('chat-box');
    sub_id=sessionStorage.getItem('sub_id');
    user_id=sessionStorage.getItem('user_id1');
    messageInput = document.getElementById('message');
    getMessages(sub_id);
}

//function to get message
function getMessages(sub_id){
    try{
        fetch('/getchats1',{
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({sub_id})
        })
        .then(response => response.json())
        .then(data =>{
            data.forEach((chat) => {
                let messageDiv = document.createElement('div');
                messageDiv.className = chat[0] != user_id ? 'others-message' : 'user-message';
                messageDiv.innerHTML = `<p><u>${chat[1]}</u> <sub style="color:grey">${chat[3]}</sub><hr><strong style="color:black">${chat[2]}</strong></p>`;
                chatBox.appendChild(messageDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            })
        }).catch(error => {
            console.error('Error fetching chats:', error);
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// messageInput.addEventListener('keydown', function(event) {
//     if (event.key === 'Enter') {
//         event.preventDefault();
//         sendMessage();
//     }
// });

// Function to send a new student message
// async function sendMessage() {
//     const message = messageInput.value.trim();
//     try {
//         const response = await fetch('/sendMessage1', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ sub_id, message })
//         });
//         const responseText=await response.text();
//         if (responseText==="true") {
//             messageInput.value = '';
//             getMessages();
//             window.location.reload();
//         } else {
//         console.error("Failed to send message.");
//     }
//     } catch (error) {
//         console.error("Error sending message:", error);
//     }
// }

let chatWindow = null;

async function sendMessage() {
    const message = messageInput.value.trim();
    try {
        const response = await fetch('/sendMessage1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sub_id, message })
        });
        const responseText = await response.text();
        if (responseText === "true") {
            messageInput.value = '';
            getMessages();
            window.location.reload();
            setTimeout(function() {
                window.location.reload();
            }, 100);
            if (chatWindow && !chatWindow.closed) {
                chatWindow.location.reload();
            }
        } else {
            console.error("Failed to send message.");
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
}