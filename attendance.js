document.addEventListener('DOMContentLoaded', () => {
    const percentageElement = document.getElementById('attendance-percentage');
    const percentageCircle = document.querySelector('.percentage-circle');
    const percentage = parseInt(percentageElement.textContent);

    if (percentage < 75) {
        percentageCircle.classList.remove('green');
        percentageCircle.classList.add('red');
    }
});
