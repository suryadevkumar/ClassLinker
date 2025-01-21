function passwordShow(password, pass_show){
    if(password.type=="password")
    {
        password.type="text";
        pass_show.src="icon/hide.png"
    }
    else{
        password.type="password";
        pass_show.src="icon/show.png";
    }
}

async function validatePassword(e){
    e.preventDefault();
    const pass=document.getElementById("pass").value;
    if(!pass){
        alert("Please Enter Your Current Password!");
        return;
    }
    await fetch('teacherLogin',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({pass})
    })
    .then(response=>response.text())
    .then(data=>{
        if(data==="true"){
            document.getElementById("step1").style.display="none";
            document.getElementById("step2").style.display="block";
        }
        else{
            alert("Incorrect Password!")
        }
    })
}

async function updatePassword(e){
    e.preventDefault();
    const pass=document.getElementById("pass1").value;
    const CNFpass=document.getElementById("CNFpass").value;
    if(!pass || !CNFpass){
        alert("Please Enter New Password And Confirm Password!");
        return;
    }
    else if(pass !== CNFpass){
        alert("Password Mismatch!");
        return;
    }
    await fetch('/updateTchPassword',{
        method: 'POST',
        headers: {"content-type":"application/json"},
        body: JSON.stringify({pass})
    })
    .then(response=>response.text())
    .then(data=>{
        alert("Password Changed Successfully");
        window.location.href="teacher-dashboard.html";
    })
}