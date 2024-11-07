// Load subject list on window load
window.onload = function() {
    const idcc_id = sessionStorage.getItem('idcc_id');
    const subjectTableBody = document.getElementById('subject-table-body');
    fetch('/getClassDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idcc_id })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('dep_name').innerHTML=data[0][0];
        document.getElementById('crs_name').innerHTML=data[0][1];
        document.getElementById('cls_name').innerHTML=data[0][2];
    });
    fetch('/getSubjectList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idcc_id })
    })
    .then(response => response.json())
    .then(data => {
        subjectTableBody.innerHTML = '';
        data.forEach((subject, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${subject[1]}</td>
                <td>${subject[2] ? subject[2] : ''}</td>
                <td>
                    <button class="action-button" onclick="editSubject('${subject[0]}', '${subject[1]}', '${subject[3]}')">Edit</button>
                    <button class="delete-button" onclick="deleteSubject('${subject[0]}')">Delete</button>
                </td>
            `;

            subjectTableBody.appendChild(row);
        });
    });
};

// Add subject function
function addSubject() {
    const modal = document.getElementById('subjectModal');
    modal.style.display = 'block';

    const teacherDropdown = document.getElementById('teacherDropdown');
    teacherDropdown.innerHTML = `<option value="invalid">Select Teacher</option>
                                <option value="">Not Available</option>`;

    fetch('/teacherList')
    .then(response => response.json())
    .then(teachers => {
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher[0];
            option.textContent = teacher[1];
            teacherDropdown.appendChild(option);
        });
    });
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('subjectModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside the modal content
window.onclick = function(event) {
    const modal = document.getElementById('subjectModal');
    const modal1 = document.getElementById('editSubModal');
    const modal2 = document.getElementById('confirmModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
    if (event.target === modal1) {
        modal1.style.display = 'none';
    }
    if (event.target === modal2) {
        modal2.style.display = 'none';
    }
};

// Submit new subject function
function submitSubject(event) {
    event.preventDefault();

    const idcc_id = sessionStorage.getItem('idcc_id');
    const subjectName = document.getElementById('subName').value;
    const teacherId = document.getElementById('teacherDropdown').value;
    if(!subjectName || teacherId=="invalid")
    {
        alert('Please Enter Subject and Teacher Name');
        window.location.reload();
        return;
    }

    fetch('/addSubject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idcc_id, subjectName, teacherId })
    })
    .then(response => response.text())
    .then(data => {
        if (data=='success') {
            window.location.reload();
        } else {
            alert('Error adding subject');
        }
    });

    closeModal();
}

// Edit subject function
let subject_id='';
function editSubject(sub_id, sub_name, tch_id) {
    subject_id=sub_id;
    const modal = document.getElementById('editSubModal');
    let newSubName=document.getElementById('newSubName');
    newSubName.value=sub_name;
    modal.style.display = 'block';

    const teacherDropdown = document.getElementById('teacherDropdown1');
    teacherDropdown.innerHTML = `<option value="invalid">Select Teacher</option>
                                <option value="">Not Available</option>`;

    fetch('/teacherList')
    .then(response => response.json())
    .then(teachers => {
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher[0];
            option.textContent = teacher[1];
            teacherDropdown.appendChild(option);
        });
        if(tch_id!='null')
        teacherDropdown.value = tch_id;
    });
}

// Save edit subject function
function saveSubject(event) {
    event.preventDefault();

    const subjectName = document.getElementById('newSubName').value;
    const teacherId = document.getElementById('teacherDropdown1').value;
    if(!subjectName || teacherId=="invalid")
    {
        alert('Please Enter Subject and Teacher Name');
        return;
    }

    fetch('/updateSubject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_id, subjectName, teacherId })
    })
    .then(response => response.text())
    .then(data => {
        if (data=='success') {
            window.location.reload();
        } else {
            alert('Error adding subject');
        }
    });

    closeModal1();
}

//function to delete subject
function delSubject(){
    fetch('/deleteSubject',{
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({subject_id})
    })
    .then(response => response.text())
    .then(data => {
        if (data=='success') {
            window.location.reload();
        } else {
            alert('Error to delete subject');
        }
    });

    closeModal2();
}

//delete subject confirmation window function
function deleteSubject(sub_id) {
    subject_id=sub_id;
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'block';
}

// Close modal1 function
function closeModal1() {
    const modal = document.getElementById('editSubModal');
    modal.style.display = 'none';
}
// Close modal2 function
function closeModal2() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'none';
}