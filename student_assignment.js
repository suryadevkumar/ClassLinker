// Load assignment list on window load
window.onload = function() {
    const sub_id = sessionStorage.getItem('sub_id');
    const sub_name = sessionStorage.getItem('sub_name');
    const assignmentContainer = document.getElementById('assignmentList');
    document.getElementById('sub_name').innerHTML=`${sub_name}`;
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
            `;
            assignmentContainer.appendChild(assignmentCard);
        });
    })
    .catch(error => {
        console.error('Error fetching assignment:', error);
    });
};

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