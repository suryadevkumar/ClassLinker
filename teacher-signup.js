//function to load institute list when page loaded
window.onload = function () {
    const collegeSelect = document.getElementById('college');

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

//function to go next page and check email are in used or not
function nextStep() {
    const tchName=document.getElementById('tchName').value;
    const tchCode=document.getElementById('tchCode').value;
    const tchMob=document.getElementById('tchMob').value;
    const tchMail=document.getElementById('tchMail').value;
    const college=document.getElementById('college').value;
    
    if(!tchName || !tchCode || !tchMob || !tchMail || !college);
    else{
        fetch('/checkTchEmailUsed',{
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({tchMail})
        })
        .then(response=>response.text())
        .then(data=>{
            if(data=='yes')
                alert('Email is already in used!')
            else{
                document.getElementById('step1').style.display='none';
                document.getElementById('step2').style.display='block';
                document.getElementById('tchMailverify').value=`${tchMail}`
            }
        })
    }
}

//function for previous step
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
    document.getElementById('otp2').style.display = 'block';
    const send=document.getElementById('send');
    send.disabled=true;
    const email = document.getElementById('tchMail').value;

    fetch('/sendTchEmail', {
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

//function for teacher email otp verify
function validateTchOTP()
{
    const tchOTP=document.getElementById('tchOTP').value;
    fetch('/verifyOTP4', {
        method: 'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({tchOTP})
    })
    .then(response=>response.text())
    .then(data=>{
        if(data=='true'){
            const btn1=document.getElementById('verify');
            btn1.style.backgroundColor='green';
            btn1.style.color='white';
            btn1.innerHTML='Verified';
            document.getElementById('tchOTP').readOnly=true;
            document.getElementById('send').disabled=true;
            btn1.disabled= true;
        }
        else{
            document.getElementById('tchOTP').value='';
            alert('incorrect OTP!')
        }
    })
}

// function teacher Signup
function teacherSignup(event) {
    event.preventDefault();

    const pic = document.getElementById('photo').files[0];
    const pass = document.getElementById('pass').value;
    const CNFpass = document.getElementById('CNFpass').value;
    const tchOTP = document.getElementById('tchOTP').value;
    const verify = document.getElementById('verify').innerText.trim();

    if (!pic || !pass || !CNFpass) {
        alert('Please fill in all the required fields.');
        return;
    }
    if (pass !== CNFpass) {
        alert('Passwords do not match.');
        return;
    }
    if(!tchOTP){
        alert('Please verify your mail!');
        return;
    }
    if (verify !== 'Verified') {
        alert('Please verify your emails before signing up.');
        return;
    }
    const signupData = document.getElementById('signupForm');
    const formData = new FormData(signupData);
    fetch('/teacherSignup', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        if (data === 'Signup Successful') {
            alert('Signup successful. Redirecting to login...');
            window.location.href = 'teacher-login.html';
        } else {
            alert(data);
        }
    })
    .catch(err => console.error(err));
}
