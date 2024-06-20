
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

arrowRight.addEventListener('click', () => {
    subjectsContainer.scrollBy({ left: 3000, behavior: 'smooth' });
});

arrowLeft.addEventListener('click', () => {
    subjectsContainer.scrollBy({ left: -3000, behavior: 'smooth' });
});



