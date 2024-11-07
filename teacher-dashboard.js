window.onload = function(){
    fetch('/teacherDetailsFetch')
    .then(response=>response.json())
    .then(data=>{
        document.getElementById('tchName').innerHTML=data.tch_name;
        document.getElementById('tchId').innerHTML=data.tch_id;
        document.getElementById('tchEmail').innerHTML=data.tch_email;
        document.getElementById('tchMob').innerHTML=data.tch_mobile;
        document.getElementById('tchPic').src = `data:image/jpeg;base64,${data.tch_pic}`;
        document.getElementById('insName').innerHTML=data.ins_name;
    })
}