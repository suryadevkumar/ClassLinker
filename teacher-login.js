const { response } = require("express");

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