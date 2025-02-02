const images = document.querySelectorAll('.carousel img');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const descriptionContainer = document.getElementById('DescriptionContainer');
let currentIndex = 0;

// Function to update the carousel and description
function updateCarousel() {
    images.forEach((img, index) => {
        img.classList.remove('active', 'prev', 'next', 'hidden');

        if (index === currentIndex) {
            img.classList.add('active');
            const description = img.getAttribute('data-description');
            
            // Update description and visibility
            if (description && description.trim() !== "") {
                descriptionContainer.textContent = description;
                descriptionContainer.style.visibility = "visible";
            } else {
                descriptionContainer.textContent = "";
                descriptionContainer.style.visibility = "hidden";
            }
        } else if (index === (currentIndex - 1 + images.length) % images.length) {
            img.classList.add('prev');
        } else if (index === (currentIndex + 1) % images.length) {
            img.classList.add('next');
        } else {
            img.classList.add('hidden');
        }
    });
}

// Event listeners for navigation buttons
prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarousel();
});

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
});

// Initialize the carousel and description
updateCarousel();