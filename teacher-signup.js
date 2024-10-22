document.addEventListener('DOMContentLoaded', () => {
    const colleges = {
        "College1": ["Department1", "Department2", "Department3"],
        "College2": ["DepartmentA", "DepartmentB"],
        "College3": ["DepartmentX", "DepartmentY", "DepartmentZ"]
    };

    const courses = {
        "Department1": ["Course1", "Course2"],
        "Department2": ["Course3", "Course4"],
        "Department3": ["Course5"],
        "DepartmentA": ["Course6"],
        "DepartmentB": ["Course7", "Course8"],
        "DepartmentX": ["Course9"],
        "DepartmentY": ["Course10", "Course11"],
        "DepartmentZ": ["Course12"]
    };

    const collegeSelect = document.getElementById('college');
    const departmentSelect = document.getElementById('department');
    const courseSelect = document.getElementById('course');

    collegeSelect.addEventListener('change', function() {
        const selectedCollege = this.value;
        departmentSelect.innerHTML = '<option value="">Select Department</option>';
        courseSelect.innerHTML = '<option value="">Select Course</option>';

        if (selectedCollege && colleges[selectedCollege]) {
            colleges[selectedCollege].forEach(department => {
                const option = document.createElement('option');
                option.value = department;
                option.textContent = department;
                departmentSelect.appendChild(option);
            });
        }
    });

    departmentSelect.addEventListener('change', function() {
        const selectedDepartment = this.value;
        courseSelect.innerHTML = '<option value="">Select Course</option>';

        if (selectedDepartment && courses[selectedDepartment]) {
            courses[selectedDepartment].forEach(course => {
                const option = document.createElement('option');
                option.value = course;
                option.textContent = course;
                courseSelect.appendChild(option);
            });
        }
    });
});

function nextStep() {
    const tchMail=document.getElementById('tchMail').value; 

    document.getElementById('step1').style.display='none';
    document.getElementById('step2').style.display='block';
    document.getElementById('tchMailverify').value=`${tchMail}`
}

function prevStep() {
    document.getElementById('step2').style.display='none';
    document.getElementById('step1').style.display='block';
}

//function to preview teacher pic
function previewImage() {
    const file = document.getElementById('photo').files[0];
    const preview = document.getElementById('preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

//function for password validation
function passValidate() {
    const pass = document.getElementById('pass').value;
    const CNFpass = document.getElementById('CNFpass').value;
    const passWarning = document.getElementById('passWarning');

    if (CNFpass) {
        if (pass === CNFpass) {
            passWarning.innerHTML = '* Password match.<br><br>';
            passWarning.style.color = 'green';
        } else {
            passWarning.innerHTML = '* Passwords do not match.<br><br>';
            passWarning.style.color = 'red';
        }
    } 
    else {
        passWarning.innerHTML = '';
    }
}

//function to send OTP on teacher email
function sendOTP(){
    document.getElementById('otp1').style.display = 'block';
    const send=document.getElementById('send');
    send.disabled=true;
    const email = document.getElementById('tchMail').value;

    fetch('/sendStdEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => response.text())
    .then(data =>{
        const otpSent=document.getElementById('otpSent');
        otpSent.style.display='block';
        otpSent.style.color='green';
        otpSent.innerHTML=`${data} <br>`;
    })
    .catch(error => {
        console.error('Error:', error);
    });

    let count=59;
    send.innerHTML=`Resend in ${count}`;
    const timer=setInterval(() => {
        count--;
        send.innerHTML = `Resend in 0:${count < 10 ? '0' : ''}${count}`;
        if (count <= 0) {
            clearInterval(timer);
            if((document.getElementById('verify').innerText)!='Verified')
            send.disabled = false;
            send.innerHTML = 'Resend';
        }
    }, 1000);
}

function studentSignup(){
    const name=document.getElementById('stdName').value;
    const dob=document.getElementById('stdDob').value;
    const scholarId=document.getElementById('scholarId').value;
    const mobile=document.getElementById('stdMob').value;
    const mail=document.getElementById('stdMail').value;
    const pass=document.getElementById('pass').value;
    console.log(name);
    console.log(dob);
    console.log(scholarId);
    console.log(mobile);
    console.log(mail);
    fetch('/studentSignup',{
        method:'POST',
        headers: {'content-type':'application/json'},
        body:JSON.stringify({name,dob,scholarId,mobile,mail,pass})
    })
    .then(response=>response.text())
    .then(data=>alert(data))
    .catch(err=>console.error(err))
}
