window.onload = function() {
    const verify = document.getElementsByClassName('bound');
    const unverify = document.getElementsByClassName('unverified');
    
    fetch('/teacherDetailsFetch')
        .then(response => response.json())
        .then(data => {
            
            if (data.verified == '1') {
                for (let i = 0; i < verify.length; i++) {
                    verify[i].style.display = 'block';
                }
                sessionStorage.setItem('user_id', data.user_id);
                document.getElementById('tchName').innerHTML = data.tch_name;
                document.getElementById('tchId').innerHTML = data.tch_id;
                document.getElementById('tchEmail').innerHTML = data.tch_email;
                document.getElementById('tchMob').innerHTML = data.tch_mobile;
                document.getElementById('tchPic').src = `data:image/jpeg;base64,${data.tch_pic}`;
                document.getElementById('insName').innerHTML = data.ins_name;
            } else {
                for (let i = 0; i < unverify.length; i++) {
                    unverify[i].style.display = 'block';
                }
            }
        })
        .catch(error => console.error('Error fetching teacher details:', error));
};

// subject list function for attendance
function subAttendanceSelect() {
    const modal = document.getElementById('subSelectAttendance');
    modal.style.display = 'block';

    const subDropdown = document.getElementById('subDropdown');
    subDropdown.innerHTML = `<option value="">Select Subject</option>`;

    fetch('/subList')
    .then(response => response.json())
    .then(data => {
        data.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject[0];
            option.textContent = `${subject[1]}, ${subject[2]}, ${subject[3]}, ${subject[4]}`;
            subDropdown.appendChild(option);
        });
    });
}

//function attendance to load attendance sheet
function attendanceSheet(event){
    event.preventDefault();
    const sub_id=document.getElementById('subDropdown').value;
    if(!sub_id)
    {
        alert('Please Select Your Subject!')
        return;
    }
    sessionStorage.setItem('sub_id', sub_id);
    const modal = document.getElementById('subSelectAttendance');
    modal.style.display = 'none';
    window.location.href="attendance_sheet.html";
}

// Close modal function
function closeModal(event) {
    event.preventDefault();
    const modal = document.getElementById('subSelectAttendance');
    modal.style.display = 'none';
}

// Close modal when clicking outside the modal content
window.onclick = function(event) {
    const modal = document.getElementById('subSelectAttendance');
    const modal1 = document.getElementById('subSelectNotes');
    const modal2 = document.getElementById('subSelectAssignment');
    const modal3 = document.getElementById('subSelectChat');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
    if (event.target === modal1) {
        modal1.style.display = 'none';
    }
    if (event.target === modal2) {
        modal2.style.display = 'none';
    }
    if (event.target === modal3) {
        modal3.style.display = 'none';
    }
};

// subject list function for notes
function subNotesSelect() {
    const modal = document.getElementById('subSelectNotes');
    modal.style.display = 'block';

    const subDropdown = document.getElementById('subDropdown1');
    subDropdown.innerHTML = `<option value="">Select Subject</option>`;

    fetch('/subList')
    .then(response => response.json())
    .then(data => {
        data.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject[0];
            option.textContent = `${subject[1]}, ${subject[2]}, ${subject[3]}, ${subject[4]}`;
            subDropdown.appendChild(option);
        });
    });
}

//function to load notes
function notes(event){
    event.preventDefault();
    const sub_id=document.getElementById('subDropdown1').value;
    if(!sub_id)
    {
        alert('Please Select Your Subject!')
        return;
    }
    sessionStorage.setItem('sub_id', sub_id);
    const modal = document.getElementById('subSelectNotes');
    modal.style.display = 'none';
    window.location.href="notes.html";
}

// Close modal function
function closeModal1(event) {
    event.preventDefault();
    const modal = document.getElementById('subSelectNotes');
    modal.style.display = 'none';
}

// subject list function for assignment
function subAssignmentSelect() {
    const modal = document.getElementById('subSelectAssignment');
    modal.style.display = 'block';

    const subDropdown = document.getElementById('subDropdown2');
    subDropdown.innerHTML = `<option value="">Select Subject</option>`;

    fetch('/subList')
    .then(response => response.json())
    .then(data => {
        data.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject[0];
            option.textContent = `${subject[1]}, ${subject[2]}, ${subject[3]}, ${subject[4]}`;
            subDropdown.appendChild(option);
        });
    });
}

//function to load assignment
function assignment(event){
    event.preventDefault();
    const sub_id=document.getElementById('subDropdown2').value;
    if(!sub_id)
    {
        alert('Please Select Your Subject!')
        return;
    }
    sessionStorage.setItem('sub_id', sub_id);
    const modal = document.getElementById('subSelectAssignment');
    modal.style.display = 'none';
    window.location.href="assignment.html";
}

// Close modal function
function closeModal2(event) {
    event.preventDefault();
    const modal = document.getElementById('subSelectAssignment');
    modal.style.display = 'none';
}

// subject list function for chat
function subChatSelect() {
    const modal = document.getElementById('subSelectChat');
    modal.style.display = 'block';

    const subDropdown = document.getElementById('subDropdown3');
    subDropdown.innerHTML = `<option value="">Select Subject</option>`;

    fetch('/subList')
    .then(response => response.json())
    .then(data => {
        data.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject[0];
            option.textContent = `${subject[1]}, ${subject[2]}, ${subject[3]}, ${subject[4]}`;
            subDropdown.appendChild(option);
        });
    });
}

//function to load chat
function chat(event){
    event.preventDefault();
    const sub_id=document.getElementById('subDropdown3').value;
    if(!sub_id)
    {
        alert('Please Select Your Subject!')
        return;
    }
    sessionStorage.setItem('sub_id', sub_id);
    const modal = document.getElementById('subSelectChat');
    modal.style.display = 'none';
    window.location.href="chat.html";
}

// Close modal function
function closeModal3(event) {
    event.preventDefault();
    const modal = document.getElementById('subSelectChat');
    modal.style.display = 'none';
}