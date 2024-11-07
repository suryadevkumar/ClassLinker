const { response } = require("express");

//student login function
function studentLogin(event){
    event.preventDefault();
    const stdMail=document.getElementById('stdMail').value;
    const pass=document.getElementById('pass').value;
    if(!stdMail || !pass){
        alert('Please Enter Email and Password!');
        return;
    }
    else{
        fetch('/studentLogin',{
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({stdMail,pass})
        })
        .then(response=>response.text())
        .then(data=>{
            if(data==='true')
                window.location.href='student-dashboard.html';
            else
            alert('Incorrect Username or Password');
        })
    }
}