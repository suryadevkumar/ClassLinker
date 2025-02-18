//function to load institute list when page loaded
window.onload = function () {
    const collegeSelect = document.getElementById('college');
    const departmentSelect = document.getElementById('department');
    const courseSelect = document.getElementById('course');
    const classSelect = document.getElementById('cls');
    const sectionSelect = document.getElementById('section');
    function clearOptions(selectElement, defaultText) {
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        selectElement.disabled = true;
    }

    clearOptions(departmentSelect, "Select Department");
    clearOptions(courseSelect, "Select Course");
    clearOptions(classSelect, "Select Class");
    clearOptions(sectionSelect, "Select Section");

    fetch('/getInstitute')
    .then(response => response.json())
    .then(data => {
        const colleges = data;

        collegeSelect.innerHTML = '<option value="">Select College</option>';
        colleges.forEach(college => {
            const option = document.createElement('option');
            option.value = college[0];
            option.textContent = college[1];
            collegeSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error loading colleges:', error));
};

//fetch department when institute selected
document.getElementById('college').addEventListener('change', function () {
    const instId = this.value;
    const departmentSelect = document.getElementById('department');
    const courseSelect = document.getElementById('course');
    const classSelect = document.getElementById('cls');
    const sectionSelect = document.getElementById('section');
    clearOptions(departmentSelect, "Select Department");
    clearOptions(courseSelect, "Select Course");
    clearOptions(classSelect, "Select Class");
    clearOptions(sectionSelect, "Select Section");

    if (instId) {
        fetch(`/getDepList?instId=${instId}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(department => {
                    const option = document.createElement('option');
                    option.value = department[0];
                    option.textContent = department[1];
                    departmentSelect.appendChild(option);
                });
                departmentSelect.disabled = false;
            })
            .catch(error => console.error('Error loading courses:', error));
    }
});

//fetch course when department selected
document.getElementById('department').addEventListener('change', function () {
    const departmentId = this.value;
    const courseSelect = document.getElementById('course');
    const classSelect = document.getElementById('cls');
    const sectionSelect = document.getElementById('section');
    clearOptions(courseSelect, "Select Course");
    clearOptions(classSelect, "Select Class");
    clearOptions(sectionSelect, "Select Section");

    if (departmentId) {
        fetch(`/getCourses?departmentId=${departmentId}`)
            .then(response => response.json())
            .then(data => {
                console.log("Courses Data:", data);
                data.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course[0];
                    option.textContent = course[1];
                    courseSelect.appendChild(option);
                });
                courseSelect.disabled = false;  // Enable course dropdown
            })
            .catch(error => console.error('Error loading courses:', error));
    }
});

//fetch class when course selected
document.getElementById('course').addEventListener('change', function () {
    const courseId = this.value;
    const classSelect = document.getElementById('cls');
    const sectionSelect = document.getElementById('section');

    clearOptions(classSelect, "Select Class");
    clearOptions(sectionSelect, "Select Section");

    if (courseId) {
        fetch(`/getClasses?courseId=${courseId}`)
            .then(response => response.json())
            .then(data => {
                console.log("Classes Data:", data);
                data.forEach(classItem => {
                    const option = document.createElement('option');
                    option.value = classItem[0];
                    option.textContent = classItem[1];
                    classSelect.appendChild(option);
                });
                classSelect.disabled = false;
            })
            .catch(error => console.error('Error loading classes:', error));
    }
});

//fetch section when class selected
document.getElementById('cls').addEventListener('change', function () {
    const clsId = this.value;
    const sectionSelect = document.getElementById('section');

    clearOptions(sectionSelect, "Select Section");

    if (clsId) {
        fetch(`/getSections?clsId=${clsId}`)
            .then(response => response.json())
            .then(data => {
                console.log("Section:", data);
                for(let i=1;i<=data;i++)
                {
                    const option = document.createElement('option');
                    option.value = `${i}`;
                    option.textContent = `Section ${i}`;
                    sectionSelect.appendChild(option);
                }
                sectionSelect.disabled = false;
            })
            .catch(error => console.error('Error loading classes:', error));
    }
});

// Function to clear select options
function clearOptions(selectElement, defaultText) {
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    selectElement.disabled = true;
}

//function to go next page and check email are in used or not
function nextStep() {
    const stdName=document.getElementById('stdName').value;
    const stdDob=document.getElementById('stdDob').value;
    const scholarId=document.getElementById('scholarId').value;
    const stdMob=document.getElementById('stdMob').value;
    const stdMail=document.getElementById('stdMail').value;
    const college=document.getElementById('college').value;
    const department=document.getElementById('department').value;
    const course=document.getElementById('course').value;
    const cls=document.getElementById('cls').value;
    const section=document.getElementById('section').value;
    
    if(!stdName || !stdDob || !scholarId || !stdMob || !stdMail || !college || !department || !course || !cls ||!section);
    else{
        fetch('/checkStdEmailUsed',{
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({stdMail})
        })
        .then(response=>response.text())
        .then(data=>{
            if(data=='yes')
                alert('Email is already in used!')
            else{
                document.getElementById('step1').style.display='none';
                document.getElementById('step2').style.display='block';
                document.getElementById('stdMailverify').value=`${stdMail}`
            }
        })
    }
}

//password show hide function
function passwordShow(password, icon){
    if(password.type=="password")
    {
        password.type="text";
        icon.src="icon/hide.png"
    }
    else{
        password.type="password";
        icon.src="icon/show.png"
    }
}

//function for previous step
function prevStep() {
    document.getElementById('step2').style.display='none';
    document.getElementById('step1').style.display='block';
}

//function to preview student pic
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

// function for password validation
function passValidate() {
    const pass = document.getElementById('pass').value;
    const CNFpass = document.getElementById('CNFpass').value;
    const passWarning = document.getElementById('passWarning');

    if (CNFpass) {
        if (pass === CNFpass) {
            passWarning.innerHTML = '* Password match.<br><br>';
            passWarning.style.color = 'green';
        } else {
            passWarning.innerHTML = '* Password do not match.<br><br>';
            passWarning.style.color = 'red';
        }
    } 
    else {
        passWarning.innerHTML = '';
    }
}

// function to send OTP on student email
function sendOTP(){
    document.getElementById('otp1').style.display = 'block';
    document.getElementById('otp2').style.display = 'block';
    const send=document.getElementById('send');
    send.disabled=true;
    const email = document.getElementById('stdMail').value;

    fetch('/sendStdEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => response.text())
    .then(data =>{
        const popup = document.getElementById('otpPopup');
        popup.innerHTML=`${data}`;
        popup.classList.add('show');
        setTimeout(function() {
            popup.classList.remove('show');
        }, 2000);
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

//function for Student email otp verify
function validateStdOTP()
{
    const stdOTP=document.getElementById('stdOTP').value;
    fetch('/verifyOTP3', {
        method: 'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({stdOTP})
    })
    .then(response=>response.text())
    .then(data=>{
        if(data=='true'){
            const btn1=document.getElementById('verify');
            btn1.style.backgroundColor='green';
            btn1.style.color='white';
            btn1.innerHTML='Verified';
            document.getElementById('stdOTP').readOnly=true;
            document.getElementById('send').disabled=true;
            btn1.disabled= true;
        }
        else{
            document.getElementById('stdOTP').value='';
            alert('incorrect OTP!')
        }
    })
}

// function studentSignup(){
function studentSignup(event) {
    event.preventDefault();

    const pic = document.getElementById('photo').files[0];
    const reciept = document.getElementById('receipt').files[0];
    const pass = document.getElementById('pass').value;
    const CNFpass = document.getElementById('CNFpass').value;
    const stdOTP = document.getElementById('stdOTP').value;
    const verify = document.getElementById('verify').innerText.trim();

    if (!pic || !reciept || !pass || !CNFpass) {
        alert('Please fill in all the required fields.');
        return;
    }
    if (pass !== CNFpass) {
        alert('Passwords do not match.');
        return;
    }
    if(!stdOTP){
        alert('Please verify your mail!');
        return;
    }
    if (verify !== 'Verified') {
        alert('Please verify your emails before signing up.');
        return;
    }
    const signupData = document.getElementById('signupForm');
    const formData = new FormData(signupData);
    fetch('/studentSignup', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        if (data === 'Signup Successful') {
            alert('Signup successful. Redirecting to login...');
            window.location.href = 'student-login.html';
        } else {
            alert(data);
        }
    })
    .catch(err => console.error(err));
}
