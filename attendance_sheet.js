//changeStatus function
function changeStatus(sch_id, std_id) { 
    const row = document.getElementById(`student-${sch_id}`);
    const statusCell = row.querySelector('.status');
    const currentStatus = statusCell.textContent;
    let updatedStatus='';
    if(currentStatus==='Present' || currentStatus==='Absent')
    {
        if (currentStatus === 'Present') {
            updatedStatus='Absent';
            statusCell.textContent = 'Absent';
            statusCell.className = 'status absent';
        } else if (currentStatus === 'Absent') {
            updatedStatus='Present';
            statusCell.textContent = 'Present';
            statusCell.className = 'status present';
        }
    
        const rows = document.querySelectorAll('.attendance-table tbody tr');
        rows.forEach(row => {
            row.classList.remove('highlight1');
        });
        row.classList.add('highlight1');
        const sub_id = sessionStorage.getItem('sub_id');
        fetch('/updateAttendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                std_id: std_id,
                sub_id: sub_id,
                status: updatedStatus
            })
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

// Modal image and row highlighting function
function addImageModalListeners() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeModal = document.getElementById('closeModal');

    document.querySelectorAll('.pic').forEach(image => {
        image.addEventListener('click', function () {
            const sch_id = this.closest('tr').id.split('-')[1];
            const row = document.getElementById(`student-${sch_id}`);

            modal.style.display = "block";
            modalImg.src = this.src;

            const rows = document.querySelectorAll('.attendance-table tbody tr');
            rows.forEach(r => r.classList.remove('highlight1'));
            row.classList.add('highlight1');
        });
    });
}

//function to close model
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

window.onload = function () {
    const sub_id = sessionStorage.getItem('sub_id');

    fetch('/getSubDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sub_id })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('clsDetails').innerHTML = `${data[0][0]}, ${data[0][1]}, ${data[0][2]}, ${data[0][3]}`;
    });

    let studentIndex = 0;
    let studentsData = [];

    fetch('/getStudentDetails')
    .then(response => response.json())
    .then(students => {
        studentsData = students;
        loadStudentTable(studentsData);
        displayStudentInfo(studentsData[studentIndex]);
        addImageModalListeners();
    });

    const presentButton = document.getElementById('present-button');
    const absentButton = document.getElementById('absent-button');

    presentButton.addEventListener('click', () => {
        markAttendance('Present');
    });

    absentButton.addEventListener('click', () => {
        markAttendance('Absent');
    });

    function displayStudentInfo(student) {
        // Set student ID, name, and picture
        document.getElementById('student-id').textContent = student.sch_id;
        document.getElementById('student-name').textContent = student.std_name;
        document.getElementById('student-pic').src = `data:image/png;base64,${student.std_pic}`;
        
        highlightTableRow(student.sch_id); // Highlight selected student row
        
        const sub_id = sessionStorage.getItem('sub_id'); // Fetch subject ID from session storage
        
        // Fetch attendance statistics
        fetch('/getAttendanceStats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                std_id: student.std_id,  // Send student and subject ID in the request
                sub_id: sub_id
            })
        })
        .then(response => response.json())
        .then(data => {
            const totalClasses = data.totalClasses;
            const totalPresent = data.totalPresent;
            let attendancePercentage = 0;
    
            if (totalClasses > 0) {
                attendancePercentage = ((totalPresent / totalClasses) * 100).toFixed(2);

                if (attendancePercentage < 75) {
                    document.getElementById('noOfDays').classList.remove('green');
                    document.getElementById('noOfDays').classList.add('red');
                } else {
                    document.getElementById('noOfDays').classList.add('green');
                    document.getElementById('noOfDays').classList.remove('red');
                }

                document.getElementById('attendance-percentage').textContent = attendancePercentage + '%';
                document.getElementById('present-count').textContent = `${totalPresent}/${totalClasses}`;
            }
        })
        .catch(error => {
            console.error('Error fetching attendance stats:', error);
        });
    }      

    function markAttendance(status) {
        const currentStudent = studentsData[studentIndex];
        const row = document.querySelector(`#student-${currentStudent.sch_id}`);
        row.querySelector('.status').textContent = status;
        row.querySelector('.status').className = `status ${status.toLowerCase()}`;

        fetch('/markAttendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                std_id: currentStudent.std_id,
                sub_id: sub_id,        
                status: status
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Attendance marked successfully:', data);
        })
        .catch(error => {
            console.error('Error marking attendance:', error);
        });

        studentIndex++;
        if (studentIndex < studentsData.length) {
            displayStudentInfo(studentsData[studentIndex]);
        }
    }

    function loadStudentTable(students) {
        const tableBody = document.getElementById('student-list');
        tableBody.innerHTML = '';
        students.forEach(student => {
            tableBody.innerHTML += `
            <tr id="student-${student.sch_id}">
                <td>${student.sch_id}</td>
                <td style="text-align: center; padding: 0px; width:40px">
                    <img src="data:image/png;base64,${student.std_pic}" class="pic">
                </td>
                <td>${student.std_name}</td>
                <td class="status">---</td>
                <td><button class="change" onclick="changeStatus(${student.sch_id}, ${student.std_id})">Change</button></td>
            </tr>`;
        });

        addImageModalListeners();
    }

    function highlightTableRow(sch_id) {
        const row = document.getElementById(`student-${sch_id}`);
        const rows = document.querySelectorAll('.attendance-table tbody tr');
        rows.forEach(row => {
            row.classList.remove('highlight');
        });
        row.classList.add('highlight');
    }
};
