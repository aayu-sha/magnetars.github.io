
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'auto'
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const subjectsContainer = document.querySelector('.subjects-container');
    const scrollStep = subjectsContainer.scrollWidth / 5; 
    const leftArrow = document.querySelector('.arrow.left');
    const rightArrow = document.querySelector('.arrow.right');

    leftArrow.addEventListener('click', function() {
        subjectsContainer.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', function() {
        subjectsContainer.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });
});

const subjectsContainer = document.querySelector('.subjects-container');
const arrowLeft = document.querySelector('.arrow.left');
const arrowRight = document.querySelector('.arrow.right');

const pixelStep = 1; // Adjust this value as needed

arrowRight.addEventListener('click', () => {
    subjectsContainer.scrollBy({ left: pixelStep, behavior: 'smooth' });
});

arrowLeft.addEventListener('click', () => {
    subjectsContainer.scrollBy({ left: -pixelStep, behavior: 'smooth' });
});

document.addEventListener('DOMContentLoaded', function() {
    const subjectsContainer = document.querySelector('.subjects-container');
    const scrollStep = subjectsContainer.offsetWidth; // Width of one image element

    const leftArrow = document.querySelector('.arrow.left');
    const rightArrow = document.querySelector('.arrow.right');
    let currentIndex = 0; // Current index of the displayed image

    leftArrow.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            subjectsContainer.scrollTo({ left: currentIndex * scrollStep, behavior: 'smooth' });
        }
    });

    rightArrow.addEventListener('click', function() {
        const maxIndex = subjectsContainer.children.length - 1;
        if (currentIndex < maxIndex) {
            currentIndex++;
            subjectsContainer.scrollTo({ left: currentIndex * scrollStep, behavior: 'smooth' });
        }
    });
});

