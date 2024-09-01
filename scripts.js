document.addEventListener("DOMContentLoaded", function() {
    // Smooth scrolling for links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

function showLoginForm(formId) {
    // Hide all login forms
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.add('hidden');
    });
    // Show the selected login form
    document.getElementById(formId).classList.remove('hidden');
}
