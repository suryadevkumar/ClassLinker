//function to load department when page loaded
window.onload = function () {
    const departmentSelect = document.getElementById('department');
    const courseSelect = document.getElementById('course');
    const classSelect = document.getElementById('class');
    classListLoad();
    function clearOptions(selectElement, defaultText) {
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        selectElement.disabled = true;
    }

    clearOptions(courseSelect, "Select Course");
    clearOptions(classSelect, "Select Class");

    fetch('/getDepartments')
    .then(response => response.json())
    .then(data => {
        const departments = data;
        console.log("Rows Data:", departments);

        departmentSelect.innerHTML = '<option value="">Select Department</option>';
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
    const classSelect = document.getElementById('class');
    clearOptions(courseSelect, "Select Course");
    clearOptions(classSelect, "Select Class");

    if (departmentId) {
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
    classListLoad();
});

//fetch class when course selected
document.getElementById('course').addEventListener('change', function () {
    const courseId = this.value;
    const classSelect = document.getElementById('class');

    clearOptions(classSelect, "Select Class");

    if (courseId) {
        fetch(`/getClasses?courseId=${courseId}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(classItem => {
                    const option = document.createElement('option');
                    option.value = classItem[0];
                    option.textContent = classItem[1];
                    classSelect.appendChild(option);
                });
                classSelect.disabled = false;
            })
            .catch(error => console.error('Error loading classes:', error));
    }
    classListLoad();
});

//class list load when change in class
document.getElementById('class').addEventListener('change', function () {
    classListLoad();
});

// Function to clear select options
function clearOptions(selectElement, defaultText) {
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    selectElement.disabled = true;
}

//function to class list load
function classListLoad(){
    const department = document.getElementById('department').value;
    const course = document.getElementById('course').value;
    const cls = document.getElementById('class').value;
    const classListContainer = document.querySelector('.class-list');
    fetch('/getClassList',{
        method: 'POST',
        headers: {'content-type' : 'application/json'},
        body: JSON.stringify({ dep: department, crs: course, cls: cls })
    })
    .then(response=>response.json())
    .then(data=>{
        classListContainer.innerHTML = '';

        data.forEach((item, index) => {
            const classCard = document.createElement('div');
            classCard.classList.add('class-card');

            classCard.innerHTML = `
                <div class="class-number">${index + 1}</div>
                <div class="class-details">
                    <strong>Department:</strong> ${item[0]}<br>
                    <strong>Course:</strong> ${item[1]}<br>
                    <strong>Class:</strong> ${item[2]}
                </div>
                <button class="edit-button" onclick="viewSubject(${item[3]})">View</button>
            `;
            classListContainer.appendChild(classCard);
        });
    })
}

function viewSubject(idcc_id) {
    sessionStorage.setItem('idcc_id', idcc_id);
    window.location.href = "subjectList.html";
}
