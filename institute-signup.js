//function to go next page and check email are in used or not
function nextStep() {
    instName=document.getElementById('insName').value;
    instCode=document.getElementById('insCode').value;
    instMob=document.getElementById('insMob').value;
    instMail=document.getElementById('insMail').value;
    instAdd=document.getElementById('insAddress').value;
    adName=document.getElementById('adName').value;
    adMob=document.getElementById('adMob').value;
    adMail=document.getElementById('adMail').value;
    
    if(!instName || !instCode || !instMob || !instMail || !instAdd || !adName || !adMail || !adMob);
    else if(instMail === adMail){
        alert('Institute Email and Admin Email Shoud be different!')
    }
    else if(instMob === adMob){
        alert('Institute Mobile and Admin Mobile Shoud be different!')
    }
    else{
        fetch('/checkEmailUsed',{
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({instMail, adMail})
        })
        .then(response=>response.text())
        .then(data=>{
            if(data=='admin')
                alert('Admin email is already in used!')
            else if(data=='institute')
                alert('Institute email is already in used!')
            else{
                const currentStep = document.querySelector('.step:not([style*="display: none"])');
                const nextStep = currentStep.nextElementSibling;
                if (nextStep) {
                    currentStep.style.display = 'none';
                    nextStep.style.display = 'block';
                }
                document.getElementById('insMailverify').value=`${instMail}`
                document.getElementById('adMailverify').value=`${adMail}`
            }
        })
    }
}

//function to go previous page
function prevStep() {
    const currentStep = document.querySelector('.step:not([style*="display: none"])');
    const prevStep = currentStep.previousElementSibling;
    if (prevStep) {
        currentStep.style.display = 'none';
        prevStep.style.display = 'block';
    }
}

//function to preview admin pic
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

//function for institute otp verify
function validateInsOTP()
{
    const insOTP=document.getElementById('insOTP').value;
    fetch('/verifyOTP1', {
        method: 'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({insOTP})
    })
    .then(response=>response.text())
    .then(data=>{
        if(data=='true'){
            const btn1=document.getElementById('verify1');
            btn1.style.backgroundColor='green';
            btn1.style.color='white';
            btn1.innerHTML='Verified';
            document.getElementById('insOTP').readOnly=true;
            document.getElementById('send1').disabled=true;
            btn1.disabled= true;
        }
        else{
            document.getElementById('insOTP').value='';
            alert('incorrect OTP!')
        }
    })
}

//function to verify admin email otp
function validateAdOTP()
{
    const adOTP=document.getElementById('adOTP').value;
    fetch('/verifyOTP2', {
        method: 'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({adOTP})
    })
    .then(response=>response.text())
    .then(data=>{
        if(data=='true'){
            const btn2=document.getElementById('verify2');
            btn2.style.backgroundColor='green';
            btn2.style.color='white';
            btn2.innerHTML='Verified';
            document.getElementById('adOTP').readOnly=true;
            document.getElementById('send2').disabled=true;
            btn2.disabled= true;
        }
        else{
            document.getElementById('adOTP').value='';
            alert('incorrect OTP!')
        }
    })
}

//function to send OTP on institute email
function sendOTP1(){
    document.getElementById('otp1').style.display = 'block';
    document.getElementById('otp2').style.display = 'block';
    const send1=document.getElementById('send1');
    send1.disabled=true;
    const email = document.getElementById('insMail').value;

    fetch('/sendInsEmail', {
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
    send1.innerHTML=`Resend in ${count}`;
    const timer=setInterval(() => {
        count--;
        send1.innerHTML = `Resend in 0:${count < 10 ? '0' : ''}${count}`;
        if (count <= 0) {
            clearInterval(timer);
            if((document.getElementById('verify1').innerText)!='Verified')
            send1.disabled = false;
            send1.innerHTML = 'Resend';
        }
    }, 1000);
}

//function to send OTP on admin email
function sendOTP2(){
    document.getElementById('otp3').style.display = 'block';
    document.getElementById('otp4').style.display = 'block';
    const send2=document.getElementById('send2');
    send2.disabled=true;
    const email = document.getElementById('adMail').value;

    fetch('/sendAdEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => response.text())
    .then(data => {
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
    send2.innerHTML=`Resend in ${count}`;
    const timer=setInterval(() => {
        count--;
        send2.innerHTML = `Resend in 0:${count < 10 ? '0' : ''}${count}`;
        if (count <= 0) {
            clearInterval(timer);
            if((document.getElementById('verify2').innerText)!='Verified')
            send2.disabled = false;
            console.log(document.getElementById('verify2').innerText);
            send2.innerHTML = 'Resend';
        }
    }, 1000);
}

//institute signup function
function instituteSignup(event) {
    event.preventDefault();

    const pic = document.getElementById('photo').files[0];
    const pass = document.getElementById('pass').value;
    const CNFpass = document.getElementById('CNFpass').value;
    const insOTP = document.getElementById('insOTP').value;
    const adOTP = document.getElementById('adOTP').value;
    const verify1 = document.getElementById('verify1').innerText.trim();
    const verify2 = document.getElementById('verify2').innerText.trim();

    if (!pic || !pass || !CNFpass) {
        alert('Please fill in all the required fields.');
        return;
    }
    if (pass !== CNFpass) {
        alert('Passwords do not match.');
        return;
    }
    if(!insOTP || !adOTP){
        alert('Please verify your mail!');
        return;
    }
    if (verify1 !== 'Verified' || verify2 !== 'Verified') {
        alert('Please verify your emails before signing up.');
        return;
    }
    const signupData = document.getElementById('signupForm');
    const formData = new FormData(signupData);
    fetch('/instituteSignup', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        if (data === 'Signup Successful') {
            alert('Signup successful. Redirecting to login...');
            window.location.href = 'institute-login.html';
        } else {
            alert(data);
        }
    })
    .catch(err => console.error(err));
}
