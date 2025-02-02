// Select the menu icon and content
const menuIcon = document.querySelector('.menu-icon');
const menuContent = document.getElementById('menuContent');

// Toggle the menu on icon click
menuIcon.addEventListener('click', () => {
    menuContent.classList.toggle('open');
});

// Optional: Close the menu when clicking outside
document.addEventListener('click', (event) => {
    if (!menuIcon.contains(event.target) && !menuContent.contains(event.target)) {
        menuContent.classList.remove('open');
    }
});