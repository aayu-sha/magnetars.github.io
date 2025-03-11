// Typing Effect
document.addEventListener("DOMContentLoaded", function () {
    const textElement = document.querySelector(".typing-text");
    const text = "Innovating the future of Astrophysics & AI";
    let index = 0;

    function typeText() {
        if (index < text.length) {
            textElement.textContent += text[index];
            index++;
            setTimeout(typeText, 50);
        }
    }
    textElement.textContent = "";
    typeText();
});

// Scroll Animation
const sections = document.querySelectorAll(".fade-in");

function showSections() {
    sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight - 100) {
            section.classList.add("visible");
        }
    });
}

window.addEventListener("scroll", showSections);
