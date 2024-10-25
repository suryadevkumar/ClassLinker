window.onload= function(){
    fetch('/adminDetailsFetch')
    .then(response=>response.json())
    .then(data=>{
        document.getElementById('adName').innerHTML=data[0];
        document.getElementById('insName').innerHTML=data[1];
        document.getElementById('adEmail').innerHTML=data[2];
        document.getElementById('adMob').innerHTML=data[3];
    })
}