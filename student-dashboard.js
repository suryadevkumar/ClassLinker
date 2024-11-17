window.onload= function(){
    const verify = document.getElementsByClassName('bound');
    const unverify = document.getElementsByClassName('unverified');
    fetch('/studentDetailsFetch')
    .then(response=>response.json())
    .then(data=>{
        if (data.verified == '1') {
            for (let i = 0; i < verify.length; i++) {
                verify[i].style.display = 'block';
            }
            sessionStorage.setItem('user_id1', data.std_id);
            document.getElementById('stdName').innerHTML=data.std_name;
            document.getElementById('schId').innerHTML=data.sch_id;
            document.getElementById('stdEmail').innerHTML=data.std_email;
            document.getElementById('stdMob').innerHTML=data.std_mobile;
            document.getElementById('stdPic').src = `data:image/jpeg;base64,${data.std_pic}`;
            document.getElementById('insName').innerHTML=data.ins_name;
            document.getElementById('department').innerHTML=data.dep_name;
            document.getElementById('course').innerHTML=data.crs_name;
            document.getElementById('class').innerHTML=data.cls_name;
            document.getElementById('section').innerHTML=data.section;
        } else {
            for (let i = 0; i < unverify.length; i++) {
                unverify[i].style.display = 'block';
            }
        }
    })
}

// subject list function for attendance
function subAttendanceSelect() {
    const modal = document.getElementById('subSelectAttendance');
    modal.style.display = 'block';

    const subDropdown = document.getElementById('subDropdown');
    subDropdown.innerHTML = `<option value="">Select Subject</option>`;

    fetch('/subList1')
    .then(response => response.json())
    .then(data => {
        data.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject[0];
            option.textContent = `${subject[1]}`;
            subDropdown.appendChild(option);
        });
    });
}

//function attendance to load attendance sheet
function attendanceSheet(event){
    event.preventDefault();
    const sub_id=document.getElementById('subDropdown').value;
    const sub_name = document.getElementById('subDropdown').options[document.getElementById('subDropdown').selectedIndex].text;

    if(!sub_id)
    {
        alert('Please Select Your Subject!')
        return;
    }
    sessionStorage.setItem('sub_id', sub_id);
    sessionStorage.setItem('sub_name', sub_name);
    const modal = document.getElementById('subSelectAttendance');
    modal.style.display = 'none';
    window.location.href="attendance_sheet_student.html";
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

    fetch('/subList1')
    .then(response => response.json())
    .then(data => {
        data.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject[0];
            option.textContent = `${subject[1]}`;
            subDropdown.appendChild(option);
        });
    });
}

//function to load notes
function notes(event){
    event.preventDefault();
    const sub_id=document.getElementById('subDropdown1').value;
    const sub_name = document.getElementById('subDropdown1').options[document.getElementById('subDropdown1').selectedIndex].text;

    if(!sub_id)
    {
        alert('Please Select Your Subject!')
        return;
    }
    sessionStorage.setItem('sub_id', sub_id);
    sessionStorage.setItem('sub_name', sub_name);
    const modal = document.getElementById('subSelectNotes');
    modal.style.display = 'none';
    window.location.href="student-notes.html";
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

    fetch('/subList1')
    .then(response => response.json())
    .then(data => {
        data.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject[0];
            option.textContent = `${subject[1]}`;
            subDropdown.appendChild(option);
        });
    });
}

//function to load assignment
function assignment(event){
    event.preventDefault();
    const sub_id=document.getElementById('subDropdown2').value;
    const sub_name = document.getElementById('subDropdown2').options[document.getElementById('subDropdown2').selectedIndex].text;

    if(!sub_id)
    {
        alert('Please Select Your Subject!')
        return;
    }
    sessionStorage.setItem('sub_id', sub_id);
    sessionStorage.setItem('sub_name', sub_name);
    const modal = document.getElementById('subSelectAssignment');
    modal.style.display = 'none';
    window.location.href="student_assignment.html";
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

    fetch('/subList1')
    .then(response => response.json())
    .then(data => {
        data.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject[0];
            option.textContent = `${subject[1]}`;
            subDropdown.appendChild(option);
        });
    });
}

//function to load assignment
function chat(event){
    event.preventDefault();
    const sub_id=document.getElementById('subDropdown3').value;
    const sub_name = document.getElementById('subDropdown3').options[document.getElementById('subDropdown3').selectedIndex].text;
    if(!sub_id)
    {
        alert('Please Select Your Subject!')
        return;
    }
    sessionStorage.setItem('sub_id', sub_id);
    sessionStorage.setItem('sub_name', sub_name);
    const modal = document.getElementById('subSelectChat');
    modal.style.display = 'none';
    window.location.href="chat_student.html";
}

// Close modal function
function closeModal3(event) {
    event.preventDefault();
    const modal = document.getElementById('subSelectChat');
    modal.style.display = 'none';
}