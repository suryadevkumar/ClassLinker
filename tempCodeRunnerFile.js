document.addEventListener('DOMContentLoaded', () => {
//     const colleges = {
//         "College1": ["Department1", "Department2", "Department3"],
//         "College2": ["DepartmentA", "DepartmentB"],
//         "College3": ["DepartmentX", "DepartmentY", "DepartmentZ"]
//     };

//     const courses = {
//         "Department1": ["Course1", "Course2"],
//         "Department2": ["Course3", "Course4"],
//         "Department3": ["Course5"],
//         "DepartmentA": ["Course6"],
//         "DepartmentB": ["Course7", "Course8"],
//         "DepartmentX": ["Course9"],
//         "DepartmentY": ["Course10", "Course11"],
//         "DepartmentZ": ["Course12"]
//     };

//     const collegeSelect = document.getElementById('college');
//     const departmentSelect = document.getElementById('department');
//     const courseSelect = document.getElementById('course');

//     collegeSelect.addEventListener('change', function() {
//         const selectedCollege = this.value;
//         departmentSelect.innerHTML = '<option value="">Select Department</option>';
//         courseSelect.innerHTML = '<option value="">Select Course</option>';

//         if (selectedCollege && colleges[selectedCollege]) {
//             colleges[selectedCollege].forEach(department => {
//                 const option = document.createElement('option');
//                 option.value = department;
//                 option.textContent = department;
//                 departmentSelect.appendChild(option);
//             });
//         }
//     });

//     departmentSelect.addEventListener('change', function() {
//         const selectedDepartment = this.value;
//         courseSelect.innerHTML = '<option value="">Select Course</option>';

//         if (selectedDepartment && courses[selectedDepartment]) {
//             courses[selectedDepartment].forEach(course => {
//                 const option = document.createElement('option');
//                 option.value = course;
//                 option.textContent = course;
//                 courseSelect.appendChild(option);
//             });
//         }
//     });
// });

// function nextStep() {
//     const currentStep = document.querySelector('.step:not([style*="display: none"])');
//     const nextStep = currentStep.nextElementSibling;
//     if (nextStep) {
//         currentStep.style.display = 'none';
//         nextStep.style.display = 'block';
//     }
// }

// function prevStep() {
//     const currentStep = document.querySelector('.step:not([style*="display: none"])');
//     const prevStep = currentStep.previousElementSibling;
//     if (prevStep) {
//         currentStep.style.display = 'none';
//         prevStep.style.display = 'block';
//     }
// }