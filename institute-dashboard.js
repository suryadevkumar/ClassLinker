window.onload = function() {
    fetch('/insLogin')
    .then(response=>response.json())
    .then(data=>{
        document.getElementById('insName').innerHTML=data[0];
        document.getElementById('insCode').innerHTML=data[1];
        document.getElementById('insMail').innerHTML=data[2];
        document.getElementById('insMob').innerHTML=data[3];
    })
};
