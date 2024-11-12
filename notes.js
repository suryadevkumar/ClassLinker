// Load notes list on window load
window.onload = function() {
    const sub_id = sessionStorage.getItem('sub_id');
    const notesContainer = document.getElementById('notesList');

    fetch('/getNotesList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sub_id })
    })
    .then(response => response.json())
    .then(data => {

        notesContainer.innerHTML = '';

        data.forEach((note, index) => {
            const noteCard = document.createElement('div');
            noteCard.classList.add('note-card');

            noteCard.innerHTML = `
                <div class="note-index">${index + 1}</div>
                <div class="note-image">
                    <img src="icon/file.png" alt="Note Image" height="30px"/>
                </div>
                <div class="note-details">
                    <h3>${note[1]}</h3>
                </div>
                <button class="view-button" onclick="downloadNote(${note[0]})">View</button>
                <button class="delete-button" onclick="DeleteNote(${note[0]})">Delete</button>
            `;
            notesContainer.appendChild(noteCard);
        });
    })
    .catch(error => {
        console.error('Error fetching notes:', error);
    });
};

//function to upload notes
function uploadNotes(event) {
    event.preventDefault();

    const title = document.getElementById('noteTitle').value;
    const fileInput = document.getElementById('noteFile');
    const file = fileInput.files[0];

    if (!title || !file) {
        alert('Please provide both the note title and file!');
        return;
    }

    const subId = sessionStorage.getItem('sub_id'); 

    const formData = new FormData();
    formData.append('noteTitle', title);
    formData.append('noteFile', file);
    formData.append('sub_id', subId);

    fetch('/uploadNotes', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Note uploaded successfully');
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error uploading note:', error);
    });
}

//delete notes
function DeleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        fetch(`/deleteNote/${noteId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                alert('Note deleted successfully');
                window.location.reload();
            } else {
                alert('Error deleting note');
            }
        })
        .catch(error => {
            console.error('Error deleting note:', error);
        });
    }
}

//function to download note
function downloadNote(noteId) {
    fetch(`/downloadNote/${noteId}`, {
        method: 'GET',
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        } else {
            throw new Error('Error downloading the note');
        }
    })
    .then(blob => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = `note_${noteId}`;
        link.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error downloading note:', error);
    });
}