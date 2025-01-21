//password show hide function
function passwordShow(){
    const password=document.getElementById('pass');
    const icon=document.getElementById('pass_show');
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

//password Change function
function passwordChange(){
    alert("Only Institute Can Change Password! Redirecting to Institute Login...");
    window.location.href="institute-login.html";
}

//admin login function
function adminLogin(event){
    event.preventDefault();
    const adMail=document.getElementById('adMail').value;
    const pass=document.getElementById('pass').value;
    if(!adMail || !pass){
        alert('Please Enter Email and Password!');
        return;
    }
    else{
        fetch('/adminLogin',{
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({adMail,pass})
        })
        .then(response=>response.text())
        .then(data=>{
            if(data==='true')
                window.location.href='admin-dashboard.html';
            else
            alert('Incorrect Username or Password');
        })
    }
}