const { response } = require("express");

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