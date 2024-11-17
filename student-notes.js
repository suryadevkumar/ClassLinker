// Load notes list on window load
window.onload = function() {
    const sub_id = sessionStorage.getItem('sub_id');
    const sub_name = sessionStorage.getItem('sub_name');
    const notesContainer = document.getElementById('notesList');
    document.getElementById('sub_name').innerHTML=`${sub_name}`;
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
            `;
            notesContainer.appendChild(noteCard);
        });
    })
    .catch(error => {
        console.error('Error fetching notes:', error);
    });
};

//function to download note
function downloadNote(noteId) {
    fetch(`/downloadNote/${noteId}`, {
        method: 'GET',
    })
    .then(response => {
        if (response.ok) {
            const contentDisposition = response.headers.get('Content-Disposition');
            const fileName = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `note_${noteId}`;
            
            return response.blob().then(blob => ({ blob, fileName }));  // Return blob and filename together
        } else {
            throw new Error('Error downloading the note');
        }
    })
    .then(({ blob, fileName }) => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error downloading note:', error);
    });
}