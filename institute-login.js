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
    document.getElementById("step3").style.display="none";
    document.getElementById("step4").style.display="block";
}

async function checkAccount(e){
    e.preventDefault();
    const instMail=document.getElementById("insMail1").value;
    if(!instMail){
        alert("Please Enter Your Email")
        return;
    }
    await fetch('/checkEmailUsed',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({instMail})
    })
    .then(response=>response.text())
    .then(data=>{
        if(data=="institute"){
            document.getElementById("step5").style.display="none";
            document.getElementById("step6").style.display="block";
            const popup=document.getElementById("otpPopup1");
            const resend=document.getElementById("resend1");
            sendOTP(instMail, resend, popup);
        }
        else
            alert("Account Not Found!")
    })
}

function sendOTP(insMail, resend, popup){
    const email=insMail;
    resend.disabled=true;
    fetch('sendInsEmail',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({email})
    })
    .then(response=>response.text())
    .then(data=>{
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
    const insOTP=document.getElementById("insOTP1").value;
    if(!insOTP){
        alert("Please Enter OTP!")
        return;
    }
    await fetch('verifyOTP1',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({insOTP})
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
            document.getElementById("step6").style.display="none";
            document.getElementById("step7").style.display="block";
        }
        else
        alert("Incorrect OTP");
    })
}

async function updatePassword(e){
    e.preventDefault();
    const insMail=document.getElementById("insMail1").value;
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
    await fetch('/updateInsPassword',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({insMail,pass})
    })
    .then(response=>response.text())
    .then(data=>{
        alert("Password Changed Successfully!")
        window.location.reload();
    })
}

//function to send otp for login
function verifyCredentials(event){
    event.preventDefault();
    const insMail=document.getElementById('insMail').value;
    const pass=document.getElementById('pass').value;
    if(!insMail || !pass){
        alert('Please Enter Email and Password!');
        return;
    }
    else{
        fetch('/insLogin',{
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({insMail,pass})
        })
        .then(response=>response.text())
        .then(data=>{
            if(data==='true')
            {
                document.getElementById("step1").style.display="none";
                document.getElementById("step2").style.display="block";
                const popup=document.getElementById("otpPopup");
                const resend=document.getElementById("resend");
                sendOTP(insMail, resend, popup);
            }
            else
            alert('Incorrect Username or Password');
        })
    }
}

function instituteLogin(event){
    event.preventDefault();
    const insOTP=document.getElementById('insOTP').value;
    if(!insOTP)
    {
        alert('Please Enter OTP!');
        return;
    }
    fetch('/verifyOTP1',{
        method:'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({insOTP})
    })
    .then(response=>response.text())
    .then(data=>{
        if(data==='true')
        {
            window.location.href='institute-dashboard.html';
        }
        else
        alert('incorrect otp!');
    })
}