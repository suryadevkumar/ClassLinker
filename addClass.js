//function to load department when page loaded
window.onload = function () {
    const departmentSelect = document.getElementById('department');
    const courseSelect = document.getElementById('course');

    function clearOptions(selectElement) {
        selectElement.innerHTML = `<option value="">Select Course</option><option value="addNew">Add New Course</option>`;
        selectElement.disabled = true;
    }

    clearOptions(courseSelect);

    fetch('/getDepartments')
    .then(response => response.json())
    .then(data => {
        const departments = data;
        console.log("Rows Data:", departments);

        departmentSelect.innerHTML = '<option value="">Select Department</option><option value="addNew">Add New Department</option>';
        departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department[0];
            option.textContent = department[1];
            departmentSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error loading departments:', error));
};

//fetch course when department selected
document.getElementById('department').addEventListener('change', function () {
    const departmentId = this.value;
    const courseSelect = document.getElementById('course');

    function clearOptions(selectElement) {
        selectElement.innerHTML = `<option value="">Select Course</option><option value="addNew">Add New Course</option>`;
        selectElement.disabled = true;
    }
    clearOptions(courseSelect);

    if (departmentId && departmentId!='addNew') {
        fetch(`/getCourses?departmentId=${departmentId}`)
            .then(response => response.json())
            .then(data => {
                console.log("Courses Data:", data);
                data.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course[0];
                    option.textContent = course[1];
                    courseSelect.appendChild(option);
                });
                courseSelect.disabled = false;  // Enable course dropdown
            })
            .catch(error => console.error('Error loading courses:', error));
    }
});

function toggleDepartmentOptions() {
    const departmentSelect = document.getElementById("department");
    const newDepInput = document.getElementById("newDep");
    const crsLabel = document.getElementById("crsLabel");
    const courseSelect = document.getElementById("course");
    const newCrsInput = document.getElementById("newCrs");
    newDepInput.value="";
    newCrsInput.value="";
    courseSelect.value="";
    if (departmentSelect.value === "addNew") {
        newDepInput.style.display = "block";
        crsLabel.style.display = "none";
        courseSelect.style.display = "none";
        newCrsInput.style.display = "block";
    } else if (departmentSelect.value) {
        newDepInput.style.display = "none";
        crsLabel.style.display = "block";
        courseSelect.style.display = "block";
        newCrsInput.style.display = "none";
    } else {
        newDepInput.style.display = "none";
        crsLabel.style.display = "none";
        courseSelect.style.display = "none";
        newCrsInput.style.display = "none";
    }
}

function toggleCourseOptions() {
    const courseSelect = document.getElementById("course");
    const newCrsInput = document.getElementById("newCrs");
    newCrsInput.value="";
    if (courseSelect.value === "addNew") {
        newCrsInput.style.display = "block";
    } else {
        newCrsInput.style.display = "none";
    }
}

function addClass() {
    const selDep = document.getElementById("department").value;
    const newDep = document.getElementById("newDep").value;
    const selCrs = document.getElementById("course").value;
    const newCrs = document.getElementById("newCrs").value;
    const cls = document.getElementById("className").value;
    const sec = document.getElementById("sectionNum").value;
    if(selDep=="")
    {
        alert("Please Choose Department!");
        return;
    }
    if(selDep=="addNew" && newDep=="")
    {
        alert("Please Enter the Department Name!")
        return;
    }
    if(selDep=="addNew" && newCrs=="")
    {
        alert("Please Enter the Course Name!")
        return;
    }
    if(selCrs=="" && newCrs=="")
    {
        alert("Please Choose Course!");
        return;
    }
    if(selCrs=="addNew" && newCrs=="")
    {
        alert("Please Enter the Course Name!")
        return;
    }
    if(cls=="")
    {
        alert("Please Enter the Class Name!")
        return;
    }
    if(sec=="")
    {
        alert("Please Enter the Number of Sections!")
        return;
    }
    if(sec<1)
    {
        alert("Please Enter the valid Number of Sections!")
        return;
    }
    const classData=document.getElementById('classData');
    const formData=new FormData(classData);
    fetch('/addClass',{
        method:'POST',
        body: formData
    })
    .then(response=>response.text())
    .then(data=>{
        alert(data);
        window.location.href="admin-dashboard.html";
    })
}
