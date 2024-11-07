//function to teacher list load
window.onload= function() {
    const teacherListContainer = document.getElementById('student-table-body');
    fetch('/getTeacherList')
    .then(response => response.json())
    .then(data => {
        teacherListContainer.innerHTML = '';

        let rowsHTML = '';
        
        data.forEach((teacher) => {
            rowsHTML += `
                <tr>
                    <td>${teacher[1]}</td>
                    <td>${teacher[2]}</td>
                    <td><button class="edit-button">View</button></td>
                </tr>
            `;
        });

        teacherListContainer.innerHTML = rowsHTML;
    })
    .catch(error => {
        console.error('Error fetching teacher list:', error);
    });
}