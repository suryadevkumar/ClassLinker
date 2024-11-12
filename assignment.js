// Load assignment list on window load
window.onload = function() {
    const sub_id = sessionStorage.getItem('sub_id');
    const assignmentContainer = document.getElementById('assignmentList');

    fetch('/getAssignmentList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sub_id })
    })
    .then(response => response.json())
    .then(data => {

        assignmentContainer.innerHTML = '';

        data.forEach((assignment, index) => {
            const assignmentCard = document.createElement('div');
            assignmentCard.classList.add('assignment-card');

            assignmentCard.innerHTML = `
                <div class="assignment-index">${index + 1}</div>
                <div class="assignment-image">
                    <img src="icon/file.png" alt="assignment Image" height="30px"/>
                </div>
                <div class="assignment-details">
                    <h3>${assignment[1]}</h3>
                </div>
                <button class="view-button" onclick="downloadassignment(${assignment[0]})">View</button>
                <button class="delete-button" onclick="Deleteassignment(${assignment[0]})">Delete</button>
            `;
            assignmentContainer.appendChild(assignmentCard);
        });
    })
    .catch(error => {
        console.error('Error fetching assignment:', error);
    });
};

//function to upload assignment
function uploadAssignment(event) {
    event.preventDefault();

    const title = document.getElementById('assignmentTitle').value;
    const fileInput = document.getElementById('assignmentFile');
    const file = fileInput.files[0];

    if (!title || !file) {
        alert('Please provide both the assignment title and file!');
        return;
    }

    const subId = sessionStorage.getItem('sub_id'); 

    const formData = new FormData();
    formData.append('assignmentTitle', title);
    formData.append('assignmentFile', file);
    formData.append('sub_id', subId);

    fetch('/uploadassignment', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('assignment uploaded successfully');
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error uploading assignment:', error);
    });
}

//delete assignment
function Deleteassignment(assignmentId) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        fetch(`/deleteAssignment/${assignmentId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                alert('assignment deleted successfully');
                window.location.reload();
            } else {
                alert('Error deleting assignment');
            }
        })
        .catch(error => {
            console.error('Error deleting assignment:', error);
        });
    }
}

//function to download assignment
// function downloadassignment(assignmentId) {
//     fetch(`/downloadassignment/${assignmentId}`, {
//         method: 'GET',
//     })
//     .then(response => {
//         if (response.ok) {
//             return response.blob();
//         } else {
//             throw new Error('Error downloading the assignment');
//         }
//     })
//     .then(blob => {
//         const link = document.createElement('a');
//         const url = window.URL.createObjectURL(blob);
//         link.href = url;
//         link.download = `assignment_${assignmentId}`;
//         link.click();
//         window.URL.revokeObjectURL(url);
//     })
//     .catch(error => {
//         console.error('Error downloading assignment:', error);
//     });
// }