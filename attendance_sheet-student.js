//function to load attendance
window.onload = function () {
    const sub_id = sessionStorage.getItem('sub_id');
    const sub_name = sessionStorage.getItem('sub_name');
    const tableBody=document.getElementById('attendance-list');

    document.getElementById('subDetails').innerHTML=`${sub_name}`;

    fetch('/studentDetailsFetch')
    .then(response => response.json())
    .then(student => {
        document.getElementById('student-id').textContent = student.sch_id;
        document.getElementById('student-name').textContent = student.std_name;
        document.getElementById('student-pic').src = `data:image/png;base64,${student.std_pic}`;
    });

    fetch('/getAttendanceDetails',{
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({sub_id})
    })
    .then(response => response.json())
    .then(data => {
        data.attendences.forEach((attendance, index) => {
            const statusClass = attendance[1] === 'Present' ? 'present' : 'absent';

            tableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${attendance[0]}</td>
                <td class="status ${statusClass}">${attendance[1]}</td>
            </tr>`;
        });
        

        const totalClasses = data.totalClasses;
        const totalPresent = data.totalPresent;
        let attendancePercentage = 0;

        if (totalClasses > 0) {
            attendancePercentage = ((totalPresent / totalClasses) * 100).toFixed(2);

            if (attendancePercentage < 75) {
                document.getElementById('noOfDays').classList.remove('green');
                document.getElementById('noOfDays').classList.add('red');
            } else {
                document.getElementById('noOfDays').classList.add('green');
                document.getElementById('noOfDays').classList.remove('red');
            }

            document.getElementById('attendance-percentage').textContent = attendancePercentage + '%';
            document.getElementById('present-count').textContent = `${totalPresent}/${totalClasses}`;
        }
    });
};
