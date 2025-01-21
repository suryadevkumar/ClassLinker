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

function forgotPassword(){
    document.getElementById("step1").style.display="none";
    document.getElementById("step2").style.display="block";
}

async function checkAccount(e){
    e.preventDefault();
    const tchMail=document.getElementById("tchMail1").value;
    if(!tchMail){
        alert("Please Enter Your Email")
        return;
    }
    await fetch('/checkTchEmailUsed',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({tchMail})
    })
    .then(response=>response.text())
    .then(data=>{
        if(data=="yes"){
            document.getElementById("step3").style.display="none";
            document.getElementById("step4").style.display="block";
            sendOTP();
        }
        else
            alert("Account Not Found!")
    })
}
function sendOTP(){
    const email=document.getElementById("tchMail1").value;
    const resend=document.getElementById("resend");
    resend.disabled=true;
    fetch('sendTchEmail',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({email})
    })
    .then(response=>response.text())
    .then(data=>{
        const popup = document.getElementById('otpPopup');
        popup.innerHTML=`${data}`;
        popup.classList.add('show');
        setTimeout(function() {
            popup.classList.remove('show');
        }, 2000);
    })
    let count=59;
    resend.innerHTML=`Resend in ${count}`;
    const timer=setInterval(() => {
        count--;
        resend.innerHTML = `Resend in 0:${count < 10 ? '0' : ''}${count}`;
        if (count <= 0) {
            clearInterval(timer);
            if((document.getElementById('verify').innerText)!='Verified')
                resend.disabled = false;
            resend.innerHTML = 'Resend';
        }
    }, 1000);
}

async function verifyOTP(e){
    e.preventDefault();
    const tchOTP=document.getElementById("tchOTP").value;
    if(!tchOTP){
        alert("Please Enter OTP!")
        return;
    }
    await fetch('verifyOTP4',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({tchOTP})
    })
    .then(response=>response.text())
    .then(data=>{
        if(data==="true")
        {
            document.getElementById("resend").disabled=true;
            const verify=document.getElementById("verify");
            verify.style.backgroundColor="green";
            verify.innerHTML="Verified";
            verify.disabled=true;
            document.getElementById("step4").style.display="none";
            document.getElementById("step5").style.display="block";
        }
        else
        alert("Incorrect OTP");
    })
}

async function updatePassword(e){
    e.preventDefault();
    const tchMail=document.getElementById("tchMail1").value;
    const pass=document.getElementById("pass1").value;
    const CNFpass=document.getElementById("CNFpass").value;
    if(!pass || !CNFpass)
    {
        alert("Please Enter Password and Confirm Password!");
        return;
    }
    else if(pass!==CNFpass)
    {
        alert("Password Mismatch!");
        return;
    }
    await fetch('/updateTchPassword',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({tchMail,pass})
    })
    .then(response=>response.text())
    .then(data=>{
        alert("Password Changed Successfully!")
        window.location.reload();
    })
}

//teacher login function
function teacherLogin(event){
    event.preventDefault();
    const tchMail=document.getElementById('tchMail').value;
    const pass=document.getElementById('pass').value;
    if(!tchMail || !pass){
        alert('Please Enter Email and Password!');
        return;
    }
    else{
        fetch('/teacherLogin',{
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({tchMail,pass})
        })
        .then(response=>response.text())
        .then(data=>{
            if(data==='true')
                window.location.href='teacher-dashboard.html';
            else
            alert('Incorrect Username or Password');
        })
    }
}