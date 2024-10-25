//fetch admin credentials from database
window.onload= function(){
    fetch('/fetchAdminCredentials')
    .then(response=>response.json())
    .then(data=>{
        document.getElementById('curName').value=data[0];
        document.getElementById('curEmail').value=data[1];
        document.getElementById('curMob').value=data[2];
        // document.getElementById('currentName').value=data[3];
    })
}

//function to preview admin pic
function previewImage() {
    const file = document.getElementById('newPic').files[0];
    const preview = document.getElementById('preview');
    const warning = document.getElementById('warning'); // Add a warning message element

    if (file) {
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            const reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
                warning.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
            warning.textContent = 'Warning: The image should be in JPEG format.';
            warning.style.display = 'block';
        }
    }
}


//function for show name box
function showNameBox(){
    const btn=document.getElementById('editName');
    document.getElementById('otpLabel1').style.display='none';
    document.getElementById('otpField1').style.display='none';
    document.getElementById('CNFupdate').style.display='none';
    if(btn.innerHTML=='Edit')
    {
        document.getElementById('nameLabel').style.display='block';
        document.getElementById('adName').style.display='block';
        btn.innerHTML='Cancel';
    }
    else
    {
        document.getElementById('nameLabel').style.display='none';
        document.getElementById('adName').value='';
        document.getElementById('adName').style.display='none';
        btn.innerHTML='Edit';
    }
}

//function for show mobile box
function showMobBox(){
    const btn=document.getElementById('editMob');
    document.getElementById('otpLabel1').style.display='none';
    document.getElementById('otpField1').style.display='none';
    document.getElementById('CNFupdate').style.display='none';
    if(btn.innerHTML=='Edit')
    {
        document.getElementById('mobLabel').style.display='block';
        document.getElementById('adMob').value='';
        document.getElementById('adMob').style.display='block';
        btn.innerHTML='Cancel';
    }
    else
    {
        document.getElementById('mobLabel').style.display='none';
        document.getElementById('adMob').style.display='none';
        btn.innerHTML='Edit';
    }
}

//function for show email box
function showEmailBox(){
    const btn=document.getElementById('editEmail');
    document.getElementById('otpLabel1').style.display='none';
    document.getElementById('otpField1').style.display='none';
    document.getElementById('otpLabel').style.display='none';
    document.getElementById('otpField').style.display='none';
    document.getElementById('CNFupdate').style.display='none';
    if(btn.innerHTML=='Edit')
    {
        document.getElementById('emailLabel').style.display='block';
        document.getElementById('emailBox').style.display='block';
        btn.innerHTML='Cancel';
    }
    else
    {
        document.getElementById('emailLabel').style.display='none';
        document.getElementById('adEmail').value='';
        document.getElementById('emailBox').style.display='none';
        clearInterval(timer);
        document.getElementById('send1').innerHTML='Send OTP'
        btn.innerHTML='Edit';
    }
}

//send otp to verify admin email
let timer;
function sendAdminOTP(){
    const email=document.getElementById('adEmail').value;
    if(!email)
    {
        alert('Please enter new email!');
        return;
    }
    document.getElementById('otpLabel').style.display='block';
    document.getElementById('otpField').style.display='block';
    const send1=document.getElementById('send1');
    send1.disabled=true;
    fetch('/sendAdEmail',{
        method: 'POST',
        headers: {'content-type':'application/json'},
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
    .catch(error => {
        console.error('Error:', error);
    });

    let count=59;
    send1.innerHTML=`Resend in ${count}`;
    timer=setInterval(() => {
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
            const btn2=document.getElementById('verify1');
            btn2.style.backgroundColor='green';
            btn2.style.color='white';
            btn2.innerHTML='Verified';
            document.getElementById('adOTP').readOnly=true;
            document.getElementById('send1').disabled=true;
            document.getElementById('adEmail').readOnly=true;
            btn2.disabled= true;
        }
        else{
            document.getElementById('adOTP').value='';
            alert('incorrect OTP!')
        }
    })
}

//function to send otp for update
function updateCredentials(){
    const adName=document.getElementById('adName').value;
    const adMob=document.getElementById('adMob').value;
    const adEmail=document.getElementById('adEmail').value;
    if(!adName && !adMob && !adEmail)
    {
        alert('No any update Found!');
        window.location.href='institute-dashboard.html'
        return;
    }
    if(adEmail && document.getElementById('verify1').innerHTML!='Verified')
    {
        alert('Please Verify Admin Email!');
        return;
    }
    document.getElementById('otpLabel1').style.display='block';
    document.getElementById('otpField1').style.display='block';
    let email="";
    fetch('/sendInsEmail',{
        method:'POST',
        headers:{'content-type':'application/json'},
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
    .catch(error => {
        console.error('Error:', error);
    });
}

//function to verify institute email otp
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
            const btn2=document.getElementById('verify2');
            btn2.style.backgroundColor='green';
            btn2.style.color='white';
            btn2.innerHTML='Verified';
            document.getElementById('insOTP').readOnly=true;
            btn2.disabled= true;
            document.getElementById('adEmail').disabled=true;
            document.getElementById('editEmail').disabled=true;
            document.getElementById('editName').disabled=true;
            document.getElementById('adName').readOnly=true;
            document.getElementById('editMob').disabled=true;
            document.getElementById('adMob').readOnly=true;
            document.getElementById('updateInfo').disabled=true;
            document.getElementById('CNFupdate').style.display='block';
        }
        else{
            document.getElementById('adOTP').value='';
            alert('incorrect OTP!')
        }
    })
}

//function to save change admin data
function confirmCredentials(){
    const adName=document.getElementById('adName').value;
    const adMob=document.getElementById('adMob').value;
    const adEmail=document.getElementById('adEmail').value;
    fetch('/changeAdminCredentials',{
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({adName, adMob, adEmail})
    })
    .then(response=>response.text())
    .then(data=>{
        alert(data);
        window.location.href='institute-dashboard.html';
    })
    .catch(err=>{
        console.error(err);
    })
}

//function to cancel the change of admin credentials
function cancelCredentials(){
    alert('No any update Found!');
    window.location.href='institute-dashboard.html'
    return;
}