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
                <button class="view-button" onclick="downloadAssignment(${assignment[0]})">View</button>
            `;
            assignmentContainer.appendChild(assignmentCard);
        });
    })
    .catch(error => {
        console.error('Error fetching assignment:', error);
    });
};

//function to download assignment
function downloadAssignment(assignId) {
    fetch(`/downloadAssignment/${assignId}`, {
        method: 'GET',
    })
    .then(response => {
        if (response.ok) {
            const contentDisposition = response.headers.get('Content-Disposition');
            const fileName = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `Assignment_${assignId}`;
            
            return response.blob().then(blob => ({ blob, fileName }));
        } else {
            throw new Error('Error downloading the Assignment');
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
        console.error('Error downloading Assignment:', error);
    });
}