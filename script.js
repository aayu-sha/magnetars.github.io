document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript loaded successfully!");

    // Typing effect for welcome text
    const textElement = document.querySelector(".typing-text");
    if (textElement) {
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
    }

    // Fade-in animation using IntersectionObserver
    const sections = document.querySelectorAll(".fade-in");

    if (sections.length === 0) {
        console.log("No .fade-in elements found. Check your HTML structure.");
    } else {
        console.log("Found", sections.length, "fade-in sections.");
    }

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
                console.log("Made visible:", entry.target);
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => observer.observe(section));
});
