const themeToggle = document.querySelector('.toggle-dark-button');
const body = document.body;
const icon = themeToggle.querySelector('i');


const currentTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', currentTheme);

updateIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateIcon(newTheme);
    });

function updateIcon(theme) {
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const mainContent = document.querySelector('.main-content');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('expanded');
        
        // Adjust main content when sidebar expands/collapses
        if (sidebar.classList.contains('expanded')) {
            mainContent.style.marginLeft = '250px';
            sidebar.style.width = '250px';
        } else {
            mainContent.style.marginLeft = '60px';
            sidebar.style.width = '70px';
        }
    });
});
