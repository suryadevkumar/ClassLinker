window.onload = function() {
    const container1 = document.querySelector('.container1');

    fetch('/teacherUnverifiedList')
        .then(response => response.json())
        .then(data => {
            container1.innerHTML = '<h2>Teacher Requests</h2>';
            data.forEach((teacher, index) => {
                const requestCard = `
                    <div class="request-card" id="teacher-card-${teacher.tch_id}">
                        <div class="index-pic-container">
                            <span class="index">${index + 1}</span>
                            <img class="profile-pic" src="data:image/png;base64,${teacher.tch_pic}" alt="Teacher ${index + 1}">
                        </div>
                        <div class="person-info">
                            <h3 class="person-name" onclick="showDetails('teacher${index + 1}')">${teacher.tch_name}</h3>
                            <p>Subject: Not provided</p>
                        </div>
                        <div class="action-buttons">
                            <button class="accept-btn" id="accept-btn-${teacher.tch_id}" onclick="teacherVerification(${teacher.tch_id}, 'accept')">Accept</button>
                            <button class="deny-btn" id="deny-btn-${teacher.tch_id}" onclick="teacherVerification(${teacher.tch_id}, 'deny')">Deny</button>
                        </div>
                    </div>
                `;
                container1.innerHTML += requestCard;
            });
        })
        .catch(error => {
            console.error('Error fetching teacher list:', error);
        });

    const container2 = document.querySelector('.container2');

    fetch('/studentUnverifiedList')
        .then(response => response.json())
        .then(data => {
            container2.innerHTML = '<h2>Student Requests</h2>';

            data.forEach((student, index) => {
                const requestCard = `
                    <div class="request-card" id="student-card-${student.std_id}">
                        <div class="index-pic-container">
                            <span class="index">${index + 1}</span>
                            <img class="profile-pic" src="data:image/png;base64,${student.std_pic}" alt="Student ${index + 1}">
                        </div>
                        <div class="person-info">
                            <h3 class="person-name" onclick="showDetails('student${index + 1}')">${student.std_name}</h3>
                            <p>Subject: Not provided</p>
                        </div>
                        <div class="action-buttons">
                            <button class="accept-btn" id="accept-btn-${student.std_id}" onclick="studentVerification(${student.std_id}, 'accept')">Accept</button>
                            <button class="deny-btn" id="deny-btn-${student.std_id}" onclick="studentVerification(${student.std_id}, 'deny')">Deny</button>
                        </div>
                    </div>
                `;
                container2.innerHTML += requestCard;
            });
        })
        .catch(error => {
            console.error('Error fetching student list:', error);
        });
};

//function to action on teacher request
function teacherVerification(tch_id, status) {
    fetch('/teacherVerification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tch_id, status }),
    })
    if (status === 'accept') {
        const acceptBtn = document.getElementById(`accept-btn-${tch_id}`);
        const denyBtn = document.getElementById(`deny-btn-${tch_id}`);

        acceptBtn.disabled = true;
        acceptBtn.textContent = "Request Accepted";
        acceptBtn.style.width = "150px";
        denyBtn.style.display = "none";
    } else if (status === 'deny') {
        const acceptBtn = document.getElementById(`accept-btn-${tch_id}`);
        const denyBtn = document.getElementById(`deny-btn-${tch_id}`);

        denyBtn.disabled = true;
        denyBtn.textContent = "Request Rejected";
        denyBtn.style.width = "150px";
        acceptBtn.style.display = "none";
    }
}

//function to action on student request
function studentVerification(std_id, status) {
    fetch('/studentVerification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ std_id, status }),
    })
    if (status === 'accept') {
        const acceptBtn = document.getElementById(`accept-btn-${std_id}`);
        const denyBtn = document.getElementById(`deny-btn-${std_id}`);

        acceptBtn.disabled = true;
        acceptBtn.textContent = "Request Accepted";
        acceptBtn.style.width = "150px";
        denyBtn.style.display = "none";
    } else {
        const acceptBtn = document.getElementById(`accept-btn-${std_id}`);
        const denyBtn = document.getElementById(`deny-btn-${std_id}`);

        denyBtn.disabled = true;
        denyBtn.textContent = "Request Rejected";
        denyBtn.style.width = "150px";
        acceptBtn.style.display = "none";
    }
}
