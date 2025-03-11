// Typing Effect for Hero Section
document.addEventListener("DOMContentLoaded", function () {
    const textElement = document.querySelector(".hero-content p");
    const text = "Innovating the future of Astrophysics & AI";
    let index = 0;

    function typeText() {
        if (index < text.length) {
            textElement.textContent += text[index];
            index++;
            setTimeout(typeText, 50); // Adjust speed here
        }
    }

    textElement.textContent = ""; // Clear initial text
    typeText();
});

// Smooth Scrolling for Future Navigation
document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Dark Mode Toggle (Optional)
const themeToggle = document.createElement("button");
themeToggle.textContent = "🌙 Toggle Theme";
themeToggle.style.position = "fixed";
themeToggle.style.top = "20px";
themeToggle.style.right = "20px";
themeToggle.style.padding = "10px";
themeToggle.style.cursor = "pointer";
document.body.appendChild(themeToggle);

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});
