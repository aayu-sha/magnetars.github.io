
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'auto'
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const subjects = document.querySelector('.subjects');
    const subItems = document.querySelectorAll('.sub-item');
    
    let scrollSpeed = 10; // Speed of horizontal scroll
    let previousScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > previousScrollY ? 1 : -1;
        const scrollAmount = (currentScrollY - previousScrollY) * scrollSpeed * scrollDirection;

        subjects.scrollLeft += scrollAmount;
        previousScrollY = currentScrollY;
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


