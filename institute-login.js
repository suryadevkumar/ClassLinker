const { response } = require("express");

//function to send otp for login
function sendOTP(event){
    event.preventDefault();
    const insMail=document.getElementById('insMail').value;
    const pass=document.getElementById('pass').value;
    if(!insMail || !pass){
        alert('Please Enter Email and Password!');
        return;
    }
    else{
        fetch('/insOTPLogin',{
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({insMail,pass})
        })
        .then(response=>response.text())
        .then(data=>{
            if(data==='true')
            {
                const email=document.getElementById('insMail').value;
                document.getElementById('step1').style.display='none';
                document.getElementById('step2').style.display='block';
                fetch('/sendInsEmail',{
                    method: 'POST',
                    headers: {'content-type':'application/json'},
                    body:JSON.stringify({email})
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