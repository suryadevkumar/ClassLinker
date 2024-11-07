window.onload= function(){
    fetch('/studentDetailsFetch')
    .then(response=>response.json())
    .then(data=>{
        document.getElementById('stdName').innerHTML=data.std_name;
        document.getElementById('schId').innerHTML=data.sch_id;
        document.getElementById('stdEmail').innerHTML=data.std_email;
        document.getElementById('stdMob').innerHTML=data.std_mobile;
        document.getElementById('stdPic').src = `data:image/jpeg;base64,${data.std_pic}`;
        document.getElementById('insName').innerHTML=data.ins_name;
        document.getElementById('department').innerHTML=data.dep_name;
        document.getElementById('course').innerHTML=data.crs_name;
        document.getElementById('class').innerHTML=data.cls_name;
        document.getElementById('section').innerHTML=data.section;
    })
}