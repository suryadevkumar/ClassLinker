window.onload= function(){
    fetch('/adminDetailsFetch')
    .then(response=>response.json())
    .then(data=>{
        document.getElementById('adName').innerHTML=data.ad_name;
        document.getElementById('insName').innerHTML=data.ins_name;
        document.getElementById('adEmail').innerHTML=data.ad_email;
        document.getElementById('adMob').innerHTML=data.ad_mobile;
        document.getElementById('adPic').src = `data:image/jpeg;base64,${data.ad_pic}`;
    })
}
